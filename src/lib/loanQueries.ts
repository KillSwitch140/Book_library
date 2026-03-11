import { supabase } from "@/lib/supabase";
import type { LoanView } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Raw loan row joined with book (via copy) and member profile. */
interface LoanJoinRow {
  id: string;
  copy_id: string;
  member_id: string;
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  status: "active" | "overdue" | "returned";
  created_at: string;
  book_copies: {
    id: string;
    book_id: string;
    books: { title: string } | null;
  } | null;
  profiles: { full_name: string } | null;
}

export interface FetchLoansOpts {
  memberId?: string;
  bookId?: string;
  status?: "active" | "overdue" | "returned";
  limit?: number;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toLoanView(row: LoanJoinRow, now: Date): LoanView {
  // Compute effective status: if not returned and past due, treat as overdue
  // regardless of what the DB status column says (no DB trigger auto-updates it).
  let effectiveStatus = row.status;
  if (row.status !== "returned" && new Date(row.due_at) < now) {
    effectiveStatus = "overdue";
  } else if (row.status === "overdue" && new Date(row.due_at) >= now) {
    // Edge case: DB says overdue but due_at was extended (renewal) — treat as active
    effectiveStatus = "active";
  }

  return {
    id: row.id,
    bookId: row.book_copies?.book_id ?? "",
    copyId: row.copy_id,
    bookTitle: row.book_copies?.books?.title ?? "Unknown",
    memberName: row.profiles?.full_name ?? "Unknown",
    borrowDate: row.borrowed_at.slice(0, 10),
    dueDate: row.due_at.slice(0, 10),
    returnDate: row.returned_at?.slice(0, 10) ?? null,
    status: effectiveStatus,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function fetchLoans(opts: FetchLoansOpts = {}): Promise<LoanView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  let query = supabase
    .from("loans")
    .select(`
      *,
      book_copies!inner ( id, book_id, books!inner ( title ) ),
      profiles!inner ( full_name )
    `)
    .order("borrowed_at", { ascending: false });

  if (opts.memberId) {
    query = query.eq("member_id", opts.memberId);
  }

  if (opts.bookId) {
    query = query.eq("book_copies.book_id", opts.bookId);
  }

  // For overdue/active: fetch all non-returned loans and filter client-side
  // because the DB status column isn't auto-updated when due_at passes.
  if (opts.status === "returned") {
    query = query.eq("status", "returned");
  } else if (opts.status === "overdue" || opts.status === "active") {
    query = query.neq("status", "returned");
  }

  if (opts.limit && !opts.status) {
    // Only apply DB-level limit when we don't need client-side filtering
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  const now = new Date();
  let results = (data as unknown as LoanJoinRow[]).map((row) => toLoanView(row, now));

  // Client-side filter for overdue/active (computed from due_at, not DB status)
  if (opts.status === "overdue") {
    results = results.filter((l) => l.status === "overdue");
  } else if (opts.status === "active") {
    results = results.filter((l) => l.status === "active");
  }

  if (opts.limit) {
    results = results.slice(0, opts.limit);
  }

  return results;
}

/** Fetch loan history for a specific book (all copies). */
export async function fetchBookLoanHistory(
  bookId: string,
  limit = 10,
): Promise<LoanView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  // Get all copy IDs for this book first, then fetch loans
  const { data: copies, error: copyErr } = await supabase
    .from("book_copies")
    .select("id")
    .eq("book_id", bookId);

  if (copyErr) throw copyErr;
  if (!copies || copies.length === 0) return [];

  const copyIds = copies.map((c) => c.id);

  const { data, error } = await supabase
    .from("loans")
    .select(`
      *,
      book_copies ( id, book_id, books ( title ) ),
      profiles ( full_name )
    `)
    .in("copy_id", copyIds)
    .order("borrowed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as unknown as LoanJoinRow[]).map((row) => toLoanView(row, new Date()));
}

/** Fetch active loans for the current member (for MyBooks page). */
export interface MyLoanView {
  id: string;
  copyId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  bookDescription: string;
  borrowDate: string;
  dueDate: string;
  isOverdue: boolean;
}

interface MyLoanJoinRow {
  id: string;
  copy_id: string;
  borrowed_at: string;
  due_at: string;
  status: "active" | "overdue" | "returned";
  book_copies: {
    id: string;
    book_id: string;
    books: {
      title: string;
      author: string;
      cover_url: string | null;
      description: string;
    } | null;
  } | null;
}

export async function fetchMyLoans(memberId: string): Promise<MyLoanView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("loans")
    .select(`
      id, copy_id, borrowed_at, due_at, status,
      book_copies ( id, book_id, books ( title, author, cover_url, description ) )
    `)
    .eq("member_id", memberId)
    .in("status", ["active", "overdue"])
    .order("due_at", { ascending: true });

  if (error) throw error;

  const now = new Date();
  return (data as unknown as MyLoanJoinRow[]).map((row) => ({
    id: row.id,
    copyId: row.copy_id,
    bookId: row.book_copies?.book_id ?? "",
    bookTitle: row.book_copies?.books?.title ?? "Unknown",
    bookAuthor: row.book_copies?.books?.author ?? "Unknown",
    bookCover: row.book_copies?.books?.cover_url ?? "",
    bookDescription: row.book_copies?.books?.description ?? "",
    borrowDate: row.borrowed_at.slice(0, 10),
    dueDate: row.due_at.slice(0, 10),
    isOverdue: row.status === "overdue" || new Date(row.due_at) < now,
  }));
}
