import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Borrow (staff creates a loan)
// ---------------------------------------------------------------------------

interface BorrowVars {
  copyId: string;
  memberId: string;
  /** ISO date string, defaults to 14 days from now. */
  dueAt?: string;
}

export function useBorrow() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ copyId, memberId, dueAt }: BorrowVars) => {
      if (!supabase) throw new Error("Supabase not configured");

      const due = dueAt ?? new Date(Date.now() + 14 * 86_400_000).toISOString();

      // 1. Verify the copy is available
      const { data: copy, error: copyErr } = await supabase
        .from("book_copies")
        .select("is_available")
        .eq("id", copyId)
        .single();

      if (copyErr) throw copyErr;
      if (!copy.is_available) throw new Error("This copy is not available for borrowing");

      // 2. Create the loan
      const { data: loan, error: loanErr } = await supabase
        .from("loans")
        .insert({
          copy_id: copyId,
          member_id: memberId,
          due_at: due,
        })
        .select()
        .single();

      if (loanErr) throw loanErr;

      // 3. Atomically mark copy as unavailable (only if still available)
      const { data: updated, error: updateErr } = await supabase
        .from("book_copies")
        .update({ is_available: false })
        .eq("id", copyId)
        .eq("is_available", true)
        .select();

      if (updateErr) throw updateErr;

      // Race condition: another borrow got there first
      if (!updated || updated.length === 0) {
        // Roll back the loan we just created
        await supabase.from("loans").delete().eq("id", loan.id);
        throw new Error("This copy was just borrowed by someone else. Please try again.");
      }

      return loan;
    },
    onSuccess: () => {
      toast.success("Book borrowed successfully");
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["book"] });
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (err: Error) => {
      toast.error(`Borrow failed: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Return (staff closes a loan)
// ---------------------------------------------------------------------------

interface ReturnVars {
  loanId: string;
  copyId: string;
}

export function useReturn() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, copyId }: ReturnVars) => {
      if (!supabase) throw new Error("Supabase not configured");

      // 1. Close the loan
      const { error: loanErr } = await supabase
        .from("loans")
        .update({
          status: "returned",
          returned_at: new Date().toISOString(),
        })
        .eq("id", loanId);

      if (loanErr) throw loanErr;

      // 2. Mark copy as available again
      const { error: copyErr } = await supabase
        .from("book_copies")
        .update({ is_available: true })
        .eq("id", copyId);

      if (copyErr) throw copyErr;
    },
    onSuccess: () => {
      toast.success("Book returned successfully");
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["book"] });
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (err: Error) => {
      toast.error(`Return failed: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Renew (extend due date)
// ---------------------------------------------------------------------------

interface RenewVars {
  loanId: string;
  /** New due date (ISO string). Defaults to 14 days from now. */
  newDueAt?: string;
}

export function useRenew() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, newDueAt }: RenewVars) => {
      if (!supabase) throw new Error("Supabase not configured");

      const due = newDueAt ?? new Date(Date.now() + 14 * 86_400_000).toISOString();

      const { error } = await supabase
        .from("loans")
        .update({
          due_at: due,
          status: "active", // renewing clears overdue status
        })
        .eq("id", loanId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Loan renewed");
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err: Error) => {
      toast.error(`Renew failed: ${err.message}`);
    },
  });
}
