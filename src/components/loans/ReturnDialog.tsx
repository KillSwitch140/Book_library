import { useState, useEffect } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useReturn } from "@/hooks/useLoanMutations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
}

interface ActiveLoanRow {
  id: string;
  copy_id: string;
  member_id: string;
  borrowed_at: string;
  due_at: string;
  status: "active" | "overdue";
  book_copies: { id: string; condition: string } | null;
  profiles: { full_name: string; email: string } | null;
}

export default function ReturnDialog({
  open,
  onOpenChange,
  bookId,
  bookTitle,
}: ReturnDialogProps) {
  const returnBook = useReturn();
  const [activeLoans, setActiveLoans] = useState<ActiveLoanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");

  // Fetch active loans for this book's copies when dialog opens
  useEffect(() => {
    if (!open || !supabase) {
      setActiveLoans([]);
      setSelectedLoanId("");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);

      // Get copy IDs for this book
      const { data: copies } = await supabase
        .from("book_copies")
        .select("id")
        .eq("book_id", bookId);

      if (cancelled || !copies?.length) {
        setLoading(false);
        return;
      }

      const copyIds = copies.map((c) => c.id);

      const { data: loans } = await supabase
        .from("loans")
        .select(`
          id, copy_id, member_id, borrowed_at, due_at, status,
          book_copies ( id, condition ),
          profiles ( full_name, email )
        `)
        .in("copy_id", copyIds)
        .in("status", ["active", "overdue"])
        .order("borrowed_at", { ascending: false });

      if (!cancelled) {
        const rows = (loans as unknown as ActiveLoanRow[]) ?? [];
        setActiveLoans(rows);
        if (rows.length === 1) setSelectedLoanId(rows[0].id);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, bookId]);

  const selectedLoan = activeLoans.find((l) => l.id === selectedLoanId);

  async function handleReturn() {
    if (!selectedLoan) return;
    await returnBook.mutateAsync({
      loanId: selectedLoan.id,
      copyId: selectedLoan.copy_id,
    });
    onOpenChange(false);
  }

  const now = new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Return Book</DialogTitle>
          <DialogDescription className="font-body">
            Process a return for "{bookTitle}".
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeLoans.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body py-4 text-center">
            No active loans found for this book.
          </p>
        ) : (
          <div className="space-y-2">
            {activeLoans.map((loan) => {
              const isOverdue = loan.status === "overdue" || new Date(loan.due_at) < now;
              return (
                <button
                  key={loan.id}
                  type="button"
                  onClick={() => setSelectedLoanId(loan.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg border text-sm font-body transition-colors ${
                    selectedLoanId === loan.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="text-left space-y-0.5">
                    <p className="text-foreground font-medium">
                      {loan.profiles?.full_name ?? "Unknown member"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Copy #{loan.copy_id.slice(0, 6)} · Borrowed{" "}
                      {new Date(loan.borrowed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(loan.due_at).toLocaleDateString()}
                    </span>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-[10px]">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            className="gap-2"
            disabled={!selectedLoan || returnBook.isPending}
            onClick={handleReturn}
          >
            {returnBook.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Confirm Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
