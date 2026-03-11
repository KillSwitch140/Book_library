import { supabase } from "@/lib/supabase";
import { toBookView, type DbBookWithCopies } from "@/lib/mappers";
import type { BookView, DbBookCopy } from "@/types";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface FetchBooksOpts {
  search?: string;
  genre?: string;
  status?: "available" | "unavailable";
  sortField?: "title" | "author" | "year" | "rating" | "created_at";
  sortDir?: "asc" | "desc";
  limit?: number;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export async function fetchBooks(opts: FetchBooksOpts = {}): Promise<BookView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const {
    search,
    genre,
    sortField = "title",
    sortDir = "asc",
    limit,
  } = opts;

  let query = supabase
    .from("books")
    .select("*, book_copies(*)")
    .eq("is_archived", false);

  if (search) {
    query = query.textSearch("fts", search, { type: "websearch", config: "english" });
  }

  if (genre) {
    query = query.eq("genre", genre);
  }

  query = query.order(sortField, { ascending: sortDir === "asc" });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  let books = (data as DbBookWithCopies[]).map(toBookView);

  // Client-side availability filter (requires copy aggregation)
  if (opts.status === "available") {
    books = books.filter((b) => b.available);
  } else if (opts.status === "unavailable") {
    books = books.filter((b) => !b.available);
  }

  return books;
}

// ---------------------------------------------------------------------------
// Single
// ---------------------------------------------------------------------------

export async function fetchBook(
  id: string,
): Promise<{ book: BookView; copies: DbBookCopy[] } | null> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("books")
    .select("*, book_copies(*)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }

  const row = data as DbBookWithCopies;
  return { book: toBookView(row), copies: row.book_copies };
}

// ---------------------------------------------------------------------------
// Genres
// ---------------------------------------------------------------------------

export async function fetchGenres(): Promise<string[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("books")
    .select("genre")
    .eq("is_archived", false)
    .order("genre");

  if (error) throw error;

  const unique = [...new Set((data as { genre: string }[]).map((r) => r.genre))];
  return unique;
}

// ---------------------------------------------------------------------------
// Related books
// ---------------------------------------------------------------------------

export async function fetchSimilarBooks(
  genre: string,
  excludeId: string,
  limit = 8,
): Promise<BookView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("books")
    .select("*, book_copies(*)")
    .eq("genre", genre)
    .eq("is_archived", false)
    .neq("id", excludeId)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as DbBookWithCopies[]).map(toBookView);
}

export async function fetchAuthorBooks(
  author: string,
  excludeId: string,
): Promise<BookView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("books")
    .select("*, book_copies(*)")
    .eq("author", author)
    .eq("is_archived", false)
    .neq("id", excludeId)
    .order("year", { ascending: false });

  if (error) throw error;
  return (data as DbBookWithCopies[]).map(toBookView);
}

export async function fetchHighRatedBooks(
  excludeId: string,
  minRating = 4.5,
  limit = 8,
): Promise<BookView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("books")
    .select("*, book_copies(*)")
    .gte("rating", minRating)
    .eq("is_archived", false)
    .neq("id", excludeId)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as DbBookWithCopies[]).map(toBookView);
}
