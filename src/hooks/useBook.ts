import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  fetchBook,
  fetchSimilarBooks,
  fetchAuthorBooks,
  fetchHighRatedBooks,
} from "@/lib/bookQueries";
import { books as mockBooks } from "@/data/mockData";
import type { BookView, DbBookCopy } from "@/types";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function findMockBook(
  id: string,
): { book: BookView; copies: DbBookCopy[] } | null {
  const raw = mockBooks.find((b) => b.id === id);
  if (!raw) return null;
  return {
    book: { ...raw, aiSummary: undefined },
    copies: [], // no copy detail available from mock data
  };
}

function mockSimilar(genre: string, excludeId: string): BookView[] {
  return mockBooks
    .filter((b) => b.genre === genre && b.id !== excludeId)
    .map((b) => ({ ...b, aiSummary: undefined }));
}

function mockAuthor(author: string, excludeId: string): BookView[] {
  return mockBooks
    .filter((b) => b.author === author && b.id !== excludeId)
    .map((b) => ({ ...b, aiSummary: undefined }));
}

function mockStaffPicks(excludeId: string): BookView[] {
  return mockBooks
    .filter((b) => b.rating >= 4.5 && b.id !== excludeId)
    .map((b) => ({ ...b, aiSummary: undefined }));
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useBook(id: string | undefined) {
  return useQuery<{ book: BookView; copies: DbBookCopy[] } | null>({
    queryKey: ["book", id],
    queryFn: () => {
      if (!id) return null;
      if (!supabase) return findMockBook(id);
      return fetchBook(id);
    },
    enabled: !!id,
  });
}

export function useSimilarBooks(genre: string | undefined, excludeId: string | undefined) {
  return useQuery<BookView[]>({
    queryKey: ["books", "similar", genre, excludeId],
    queryFn: () => {
      if (!genre || !excludeId) return [];
      if (!supabase) return mockSimilar(genre, excludeId);
      return fetchSimilarBooks(genre, excludeId);
    },
    enabled: !!genre && !!excludeId,
  });
}

export function useAuthorBooks(author: string | undefined, excludeId: string | undefined) {
  return useQuery<BookView[]>({
    queryKey: ["books", "author", author, excludeId],
    queryFn: () => {
      if (!author || !excludeId) return [];
      if (!supabase) return mockAuthor(author, excludeId);
      return fetchAuthorBooks(author, excludeId);
    },
    enabled: !!author && !!excludeId,
  });
}

export function useStaffPicks(excludeId: string | undefined) {
  return useQuery<BookView[]>({
    queryKey: ["books", "staffPicks", excludeId],
    queryFn: () => {
      if (!excludeId) return [];
      if (!supabase) return mockStaffPicks(excludeId);
      return fetchHighRatedBooks(excludeId);
    },
    enabled: !!excludeId,
  });
}
