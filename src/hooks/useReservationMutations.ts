import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getNextPosition } from "@/lib/reservationQueries";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Reserve (member places a reservation)
// ---------------------------------------------------------------------------

interface ReserveVars {
  bookId: string;
  memberId: string;
}

export function useReserve() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, memberId }: ReserveVars) => {
      if (!supabase) throw new Error("Supabase not configured");

      // Prevent duplicate reservations for the same book
      const { data: existing, error: checkErr } = await supabase
        .from("reservations")
        .select("id")
        .eq("book_id", bookId)
        .eq("member_id", memberId)
        .in("status", ["waiting", "ready"]);

      if (checkErr) throw checkErr;
      if (existing && existing.length > 0) {
        throw new Error("You already have an active reservation for this book");
      }

      const position = await getNextPosition(bookId);

      const { data, error } = await supabase
        .from("reservations")
        .insert({
          book_id: bookId,
          member_id: memberId,
          position,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Reservation placed successfully");
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (err: Error) => {
      toast.error(`Reservation failed: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Cancel reservation
// ---------------------------------------------------------------------------

interface CancelVars {
  reservationId: string;
}

export function useCancelReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ reservationId }: CancelVars) => {
      if (!supabase) throw new Error("Supabase not configured");

      const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reservation cancelled");
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (err: Error) => {
      toast.error(`Cancel failed: ${err.message}`);
    },
  });
}
