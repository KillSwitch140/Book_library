import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import OpenAI from "openai";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const MODEL = "gpt-4o-mini";

// ---------------------------------------------------------------------------
// Supabase clients
// ---------------------------------------------------------------------------

/** Anon client — respects RLS. Used for reads + auth verification. */
function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** Service-role client — bypasses RLS. Used only for the DB write. */
function serviceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// ---------------------------------------------------------------------------
// OpenAI structured output schema
// ---------------------------------------------------------------------------

const insightsSchema = {
  name: "book_insights",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      quick_summary: { type: "string" as const },
      best_for: { type: "array" as const, items: { type: "string" as const } },
      tone: { type: "array" as const, items: { type: "string" as const } },
      themes: { type: "array" as const, items: { type: "string" as const } },
      why_read_it: { type: "string" as const },
    },
    required: [
      "quick_summary",
      "best_for",
      "tone",
      "themes",
      "why_read_it",
    ] as const,
    additionalProperties: false,
  },
} as const;

interface BookInsights {
  quick_summary: string;
  best_for: string[];
  tone: string[];
  themes: string[];
  why_read_it: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computePromptHash(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function buildPrompt(book: {
  title: string;
  author: string;
  genre: string;
  year: number | null;
  description: string;
}): string {
  const lines = [
    "You are a librarian assistant. Given the following book metadata, generate concise insights to help library borrowers decide whether to borrow this book.",
    "",
    `Title: ${book.title}`,
    `Author: ${book.author}`,
    `Genre: ${book.genre}`,
  ];

  if (book.year && book.year > 0) {
    lines.push(`Year: ${book.year}`);
  }
  if (book.description.trim()) {
    lines.push(`Description: ${book.description}`);
  }

  lines.push(
    "",
    "Rules:",
    "- Do not invent specific plot details, characters, or events unless directly supported by the provided metadata.",
    "- If metadata is limited, keep output general and conservative.",
    "- Keep quick_summary under 80 words.",
    "- Keep best_for, tone, and themes concise and non-repetitive.",
    "- Return only the structured fields requested.",
    "",
    "Generate:",
    '- quick_summary: A 2-3 sentence summary of what this book is about, based only on the provided metadata.',
    '- best_for: An array of 2-3 short descriptions of who would enjoy this book (e.g., ["Fans of literary fiction", "Readers who enjoy unreliable narrators"]).',
    '- tone: An array of 3-5 single words or short phrases describing the tone/mood (e.g., ["Suspenseful", "Atmospheric", "Thought-provoking"]).',
    '- themes: An array of 3-5 key themes (e.g., ["Identity", "Power", "Redemption"]).',
    "- why_read_it: One compelling sentence about why someone should pick up this book.",
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Method check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Env check
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
    return res.status(500).json({ error: "Server configuration incomplete" });
  }

  // Parse body
  const { bookId } = req.body ?? {};
  if (!bookId || typeof bookId !== "string") {
    return res.status(400).json({ error: "bookId is required" });
  }

  // -----------------------------------------------------------------------
  // Auth — verify JWT via anon client
  // -----------------------------------------------------------------------
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice(7);
  const anon = anonClient();
  const { error: authError } = await anon.auth.getUser(token);

  if (authError) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // -----------------------------------------------------------------------
  // Fetch book (anon client — books are publicly readable via RLS)
  // -----------------------------------------------------------------------
  const { data: book, error: bookError } = await anon
    .from("books")
    .select("id, title, author, genre, year, description, is_archived")
    .eq("id", bookId)
    .single();

  if (bookError || !book) {
    return res.status(404).json({ error: "Book not found" });
  }
  if (book.is_archived) {
    return res.status(404).json({ error: "Book is archived" });
  }

  // -----------------------------------------------------------------------
  // Metadata threshold — require title + author + (description OR genre)
  // -----------------------------------------------------------------------
  const hasDescription = !!(book.description && book.description.trim());
  const hasMeaningfulGenre = !!(book.genre && book.genre !== "General");

  if (!hasDescription && !hasMeaningfulGenre) {
    return res.status(422).json({
      error: "Not enough metadata to generate reliable insights. The book needs a description or a specific genre.",
    });
  }

  // -----------------------------------------------------------------------
  // Cache check — prompt hash determines if metadata has changed
  // -----------------------------------------------------------------------
  const promptHash = computePromptHash([
    book.title,
    book.author,
    book.genre,
    String(book.year ?? ""),
    book.description ?? "",
  ]);

  const { data: cached } = await anon
    .from("book_ai_insights")
    .select("*")
    .eq("book_id", bookId)
    .eq("prompt_hash", promptHash)
    .maybeSingle();

  if (cached) {
    return res.status(200).json({
      insights: {
        quick_summary: cached.quick_summary,
        best_for: cached.best_for,
        tone: cached.tone,
        themes: cached.themes,
        why_read_it: cached.why_read_it,
      },
      cached: true,
    });
  }

  // -----------------------------------------------------------------------
  // Call OpenAI
  // -----------------------------------------------------------------------
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const prompt = buildPrompt(book);

  let insights: BookInsights;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: insightsSchema,
      },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: "No response from AI model" });
    }

    insights = JSON.parse(content) as BookInsights;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({ error: `AI generation failed: ${message}` });
  }

  // -----------------------------------------------------------------------
  // Upsert into DB (service role — only write that bypasses RLS)
  // -----------------------------------------------------------------------
  const svc = serviceClient();
  const { error: upsertError } = await svc
    .from("book_ai_insights")
    .upsert(
      {
        book_id: bookId,
        quick_summary: insights.quick_summary,
        best_for: insights.best_for,
        tone: insights.tone,
        themes: insights.themes,
        why_read_it: insights.why_read_it,
        model_version: MODEL,
        prompt_hash: promptHash,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "book_id" },
    );

  if (upsertError) {
    // Insights were generated but failed to save — still return them
    console.error("Failed to cache insights:", upsertError);
  }

  return res.status(200).json({ insights, cached: false });
}
