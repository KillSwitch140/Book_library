import { supabase } from "@/lib/supabase";
import type { ReservationView } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FetchReservationsOpts {
  memberId?: string;
  bookId?: string;
  status?: ReservationView["status"];
}

interface ReservationJoinRow {
  id: string;
  book_id: string;
  member_id: string;
  position: number;
  status: ReservationView["status"];
  reserved_at: string;
  expires_at: string | null;
  books: {
    title: string;
    cover_url: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toReservationView(row: ReservationJoinRow): ReservationView {
  // Estimate availability ~2 weeks from reservation date as a simple placeholder
  const reserved = new Date(row.reserved_at);
  const estimated = new Date(reserved.getTime() + row.position * 14 * 86_400_000);

  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.books?.title ?? "Unknown",
    bookCover: row.books?.cover_url ?? "",
    reservedDate: row.reserved_at.slice(0, 10),
    position: row.position,
    estimatedAvailable: estimated.toISOString().slice(0, 10),
    status: row.status,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function fetchReservations(
  opts: FetchReservationsOpts = {},
): Promise<ReservationView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  let query = supabase
    .from("reservations")
    .select("*, books!inner ( title, cover_url )")
    .order("reserved_at", { ascending: false });

  if (opts.memberId) {
    query = query.eq("member_id", opts.memberId);
  }
  if (opts.bookId) {
    query = query.eq("book_id", opts.bookId);
  }
  if (opts.status) {
    query = query.eq("status", opts.status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data as unknown as ReservationJoinRow[]).map(toReservationView);
}

export async function fetchMyReservations(
  memberId: string,
): Promise<ReservationView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("reservations")
    .select("*, books!inner ( title, cover_url )")
    .eq("member_id", memberId)
    .not("status", "in", '("fulfilled","cancelled")')
    .order("reserved_at", { ascending: false });

  if (error) throw error;

  return (data as unknown as ReservationJoinRow[]).map(toReservationView);
}

export async function getNextPosition(bookId: string): Promise<number> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("reservations")
    .select("position")
    .eq("book_id", bookId)
    .eq("status", "waiting")
    .order("position", { ascending: false })
    .limit(1);

  if (error) throw error;

  return (data && data.length > 0 ? data[0].position : 0) + 1;
}

export async function getQueueLength(bookId: string): Promise<number> {
  if (!supabase) throw new Error("Supabase not configured");

  const { count, error } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("book_id", bookId)
    .eq("status", "waiting");

  if (error) throw error;
  return count ?? 0;
}
