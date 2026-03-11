import { supabase } from "@/lib/supabase";
import type { BookInsightsView, DbBookAiInsights } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Trim, remove empties, and deduplicate an array of strings. */
function cleanArray(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr
    .map((s) => s.trim())
    .filter((s) => {
      if (!s || seen.has(s.toLowerCase())) return false;
      seen.add(s.toLowerCase());
      return true;
    });
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toBookInsightsView(row: DbBookAiInsights): BookInsightsView {
  return {
    bookId: row.book_id,
    quickSummary: row.quick_summary.trim(),
    bestFor: cleanArray(row.best_for),
    tone: cleanArray(row.tone),
    themes: cleanArray(row.themes),
    whyReadIt: row.why_read_it.trim(),
    modelVersion: row.model_version,
    generatedAt: row.generated_at,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch cached insights from the DB. Does NOT trigger generation. */
export async function fetchBookInsights(
  bookId: string,
): Promise<BookInsightsView | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("book_ai_insights")
    .select("*")
    .eq("book_id", bookId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toBookInsightsView(data);
}

/** Call the serverless function to generate insights. Requires auth. */
export async function generateBookInsights(
  bookId: string,
  accessToken: string,
): Promise<{ insights: BookInsightsView; cached: boolean }> {
  const res = await fetch("/api/generate-insights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ bookId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ??
        `Failed to generate insights (${res.status})`,
    );
  }

  const data = await res.json();

  // Map the snake_case API response to the camelCase view type + sanitize
  const insights: BookInsightsView = {
    bookId,
    quickSummary: (data.insights.quick_summary ?? "").trim(),
    bestFor: cleanArray(data.insights.best_for ?? []),
    tone: cleanArray(data.insights.tone ?? []),
    themes: cleanArray(data.insights.themes ?? []),
    whyReadIt: (data.insights.why_read_it ?? "").trim(),
    modelVersion: "",
    generatedAt: new Date().toISOString(),
  };

  return { insights, cached: data.cached };
}
