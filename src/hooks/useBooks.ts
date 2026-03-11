import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { fetchBooks, fetchGenres, type FetchBooksOpts } from "@/lib/bookQueries";
import { books as mockBooks, genres as mockGenres } from "@/data/mockData";
import type { BookView } from "@/types";

// ---------------------------------------------------------------------------
// Mock-data fallback helpers
// ---------------------------------------------------------------------------

function filterMockBooks(opts: FetchBooksOpts): BookView[] {
  let result: BookView[] = mockBooks.map((b) => ({ ...b, aiSummary: undefined }));

  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q),
    );
  }

  if (opts.genre) {
    result = result.filter((b) => b.genre === opts.genre);
  }

  if (opts.status === "available") result = result.filter((b) => b.available);
  if (opts.status === "unavailable") result = result.filter((b) => !b.available);

  const field = opts.sortField ?? "title";
  const dir = opts.sortDir === "desc" ? -1 : 1;
  result.sort((a, b) => {
    if (field === "title" || field === "author")
      return a[field].localeCompare(b[field]) * dir;
    if (field === "year") return (a.year - b.year) * dir;
    if (field === "rating") return (a.rating - b.rating) * dir;
    return 0;
  });

  if (opts.limit) result = result.slice(0, opts.limit);

  return result;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useBooks(opts: FetchBooksOpts = {}) {
  const { search, genre, status, sortField, sortDir, limit } = opts;

  return useQuery<BookView[]>({
    queryKey: ["books", { search, genre, status, sortField, sortDir, limit }],
    queryFn: () => {
      if (!supabase) return filterMockBooks(opts);
      return fetchBooks(opts);
    },
  });
}

export function useGenres() {
  return useQuery<string[]>({
    queryKey: ["genres"],
    queryFn: () => {
      if (!supabase) return mockGenres.filter((g) => g !== "All");
      return fetchGenres();
    },
    staleTime: 5 * 60 * 1000, // genres change rarely
  });
}
