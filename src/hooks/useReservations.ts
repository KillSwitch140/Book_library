import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  fetchReservations,
  fetchMyReservations,
  getQueueLength,
  type FetchReservationsOpts,
} from "@/lib/reservationQueries";
import { reservations as mockReservations } from "@/data/mockData";
import type { ReservationView } from "@/types";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function mockToView(r: (typeof mockReservations)[number]): ReservationView {
  return { ...r, bookId: r.id };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useReservations(opts: FetchReservationsOpts = {}) {
  const { memberId, bookId, status } = opts;
  return useQuery<ReservationView[]>({
    queryKey: ["reservations", { memberId, bookId, status }],
    queryFn: () => {
      if (!supabase) return mockReservations.map(mockToView);
      return fetchReservations(opts);
    },
  });
}

export function useMyReservations(memberId: string | undefined) {
  return useQuery<ReservationView[]>({
    queryKey: ["reservations", "my", memberId],
    queryFn: () => {
      if (!memberId) return [];
      if (!supabase) return mockReservations.map(mockToView);
      return fetchMyReservations(memberId);
    },
    enabled: !!memberId,
  });
}

export function useQueueLength(bookId: string | undefined) {
  return useQuery<number>({
    queryKey: ["reservations", "queue", bookId],
    queryFn: () => {
      if (!bookId) return 0;
      if (!supabase) return 0;
      return getQueueLength(bookId);
    },
    enabled: !!bookId,
  });
}
