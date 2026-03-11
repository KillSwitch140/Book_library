/**
 * seed-books.mjs
 * Seeds ~1,000 popular books from goodreads_books.csv into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=eyJ... node scripts/seed-books.mjs
 *
 * Prerequisites:
 *   - Run supabase/migrations/00001_initial_schema.sql in Supabase SQL editor first
 *   - Place goodreads_books.csv in scripts/
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { classifyGenre } from "./genre-map.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TARGET_COUNT = 1000;
const BATCH_SIZE = 50;
const MIN_RATINGS = 500;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY env vars are required.\n" +
    "Usage: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=eyJ... node scripts/seed-books.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── CSV Parser ────────────────────────────────────────────────────────────────

/**
 * Minimal but correct CSV parser that handles:
 * - Quoted fields (may contain commas)
 * - Escaped quotes ("" inside quoted fields)
 * - Newlines inside quoted fields
 */
function parseCsv(text) {
  const rows = [];
  let field = "";
  let inQuotes = false;
  let currentRow = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++; // skip escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        currentRow.push(field);
        field = "";
      } else if (ch === "\n") {
        currentRow.push(field);
        field = "";
        rows.push(currentRow);
        currentRow = [];
      } else if (ch === "\r" && next === "\n") {
        // skip \r in \r\n
      } else {
        field += ch;
      }
    }
  }

  // last field/row
  if (field || currentRow.length > 0) {
    currentRow.push(field);
    rows.push(currentRow);
  }

  return rows;
}

// ── Field Helpers ─────────────────────────────────────────────────────────────

/** Parse Python-style list string "['A', 'B']" → ['A', 'B'] */
function parseList(str) {
  if (!str || str.trim() === "[]") return [];
  // Remove outer brackets, split on ', ' pattern
  const inner = str.replace(/^\[|\]$/g, "").trim();
  if (!inner) return [];
  // Match quoted strings
  const matches = inner.match(/'([^']*)'|"([^"]*)"/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1).trim()).filter(Boolean);
}

/** Take the first credited author, strip role annotations like "(Illustrator)" */
function parseAuthor(str) {
  if (!str) return "Unknown";
  // Split on comma — first segment is primary author (e.g. "J.K. Rowling, Mary GrandPré (Illustrator)")
  // But be careful: "Rowling, J.K." is a single author in "Last, First" format
  // Heuristic: if the part after the first comma contains "(", it's a role annotation → split
  const parenIdx = str.indexOf("(");
  const commaIdx = str.indexOf(",");

  let name = str;
  if (parenIdx !== -1 && (commaIdx === -1 || parenIdx < commaIdx)) {
    // "(Illustrator)" comes before any comma → strip from here
    name = str.slice(0, parenIdx).trim();
  } else if (commaIdx !== -1) {
    const afterComma = str.slice(commaIdx + 1).trim();
    if (afterComma.startsWith("(") || afterComma.match(/^\s*[A-Z][a-z]+ \(/)) {
      // Role annotation after comma → strip
      name = str.slice(0, commaIdx).trim();
    }
    // Otherwise keep full string (could be "Last, First" format)
  }

  return name.trim() || "Unknown";
}

/** Validate ISBN: must be 10 or 13 digits, not all same digit */
function validateIsbn(str) {
  if (!str) return null;
  const digits = str.replace(/[^0-9X]/gi, "");
  if (digits.length !== 10 && digits.length !== 13) return null;
  // Reject obvious dummies (all same digit: 0000000000, 9999999999999, etc.)
  if (/^(.)\1+$/.test(digits)) return null;
  return digits;
}

/**
 * Parse year from "MM/DD/YY" or "MM/DD/YYYY" format.
 * Falls back to secondDate if firstDate fails.
 */
function parseYear(publishDate, firstPublishDate) {
  for (const dateStr of [publishDate, firstPublishDate]) {
    if (!dateStr) continue;
    const parts = dateStr.trim().split("/");
    if (parts.length >= 3) {
      const yy = parseInt(parts[2], 10);
      if (isNaN(yy)) continue;
      if (yy > 100) return yy; // already 4-digit year
      return yy <= 25 ? 2000 + yy : 1900 + yy;
    }
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Reading goodreads_books.csv...");
  const csvPath = join(__dirname, "goodreads_books.csv");
  const text = readFileSync(csvPath, "utf-8");

  console.log("Parsing CSV...");
  const rows = parseCsv(text);
  if (rows.length < 2) {
    console.error("CSV appears empty or malformed.");
    process.exit(1);
  }

  // Build column index from header row
  const header = rows[0];
  const col = {};
  header.forEach((name, i) => { col[name.trim()] = i; });

  const required = ["title", "author", "rating", "language", "isbn", "genres", "publishDate", "coverImg", "numRatings", "bbeScore"];
  for (const field of required) {
    if (col[field] === undefined) {
      console.error(`Missing expected column: "${field}". Found columns: ${header.join(", ")}`);
      process.exit(1);
    }
  }

  console.log(`Total rows in CSV: ${rows.length - 1}`);

  // Parse and filter data rows
  const parsed = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < header.length - 2) continue; // skip malformed rows

    const language = (row[col["language"]] || "").trim();
    if (!["English", "en-US", "en-GB", "en"].includes(language) && language !== "") {
      // Skip non-English; also allow empty language (assume English)
      if (language && !language.toLowerCase().startsWith("en")) continue;
    }

    const title = (row[col["title"]] || "").trim();
    const author = (row[col["author"]] || "").trim();
    if (!title || !author) continue;

    const numRatingsRaw = parseInt(row[col["numRatings"]] || "0", 10);
    if (numRatingsRaw < MIN_RATINGS) continue;

    const ratingRaw = parseFloat(row[col["rating"]] || "0");
    if (isNaN(ratingRaw) || ratingRaw <= 0) continue;

    const bbeScoreRaw = parseInt(row[col["bbeScore"]] || "0", 10);
    const year = parseYear(row[col["publishDate"]], row[col["firstPublishDate"]]);
    const genres = parseList(row[col["genres"]]);

    parsed.push({
      title,
      author: parseAuthor(author),
      isbn: validateIsbn(row[col["isbn"]]),
      genre: classifyGenre(genres, year),
      year,
      description: (row[col["description"]] || "").trim(),
      cover_url: (row[col["coverImg"]] || "").trim() || null,
      rating: Math.min(5, Math.max(0, ratingRaw)),
      numRatings: numRatingsRaw,
      bbeScore: bbeScoreRaw,
    });
  }

  console.log(`After filtering: ${parsed.length} English books with ≥${MIN_RATINGS} ratings`);

  // Sort by bbeScore descending
  parsed.sort((a, b) => b.bbeScore - a.bbeScore);

  // Deduplicate by lowercase title, then by isbn
  const seenTitles = new Set();
  const seenIsbns = new Set();
  const deduped = [];
  for (const book of parsed) {
    const titleKey = book.title.toLowerCase();
    if (seenTitles.has(titleKey)) continue;
    seenTitles.add(titleKey);

    if (book.isbn) {
      if (seenIsbns.has(book.isbn)) {
        book.isbn = null; // duplicate ISBN — clear it to avoid unique constraint violation
      } else {
        seenIsbns.add(book.isbn);
      }
    }

    deduped.push(book);
    if (deduped.length >= TARGET_COUNT) break;
  }

  console.log(`After deduplication: ${deduped.length} books selected`);

  // Insert books in batches
  const insertedIds = [];
  for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
    const batch = deduped.slice(i, i + BATCH_SIZE).map(({ title, author, isbn, genre, year, description, cover_url, rating }) => ({
      title,
      author,
      isbn: isbn || null,
      genre,
      year: year || null,
      description,
      cover_url,
      rating: parseFloat(rating.toFixed(1)),
    }));

    const { data, error } = await supabase
      .from("books")
      .insert(batch)
      .select("id");

    if (error) {
      console.error(`Error inserting batch at index ${i}:`, error.message);
      // Continue with next batch rather than aborting
      continue;
    }

    insertedIds.push(...data.map((r) => r.id));
    console.log(`✓ ${Math.min(i + BATCH_SIZE, deduped.length)}/${deduped.length} books inserted`);
  }

  console.log(`\nInserted ${insertedIds.length} books. Now inserting copies...`);

  // Insert 3 copies per book
  const copies = insertedIds.flatMap((bookId) => [
    { book_id: bookId, condition: "good", is_available: true },
    { book_id: bookId, condition: "good", is_available: true },
    { book_id: bookId, condition: "good", is_available: true },
  ]);

  const COPY_BATCH = 150; // 50 books × 3 copies
  let copiesInserted = 0;
  for (let i = 0; i < copies.length; i += COPY_BATCH) {
    const batch = copies.slice(i, i + COPY_BATCH);
    const { error } = await supabase.from("book_copies").insert(batch);
    if (error) {
      console.error(`Error inserting copies batch at index ${i}:`, error.message);
      continue;
    }
    copiesInserted += batch.length;
  }

  console.log(`\n✅ Done!`);
  console.log(`   Books inserted: ${insertedIds.length}`);
  console.log(`   Copies inserted: ${copiesInserted}`);
  console.log(`   Books without cover: ${insertedIds.length - deduped.slice(0, insertedIds.length).filter((b) => b.cover_url).length}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
