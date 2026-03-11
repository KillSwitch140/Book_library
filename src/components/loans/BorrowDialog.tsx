import { useState, useEffect } from "react";
import { Loader2, Search, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useBorrow } from "@/hooks/useLoanMutations";
import type { DbBookCopy } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface BorrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  copies: DbBookCopy[];
}

interface MemberResult {
  id: string;
  full_name: string;
  email: string;
  is_suspended: boolean;
}

export default function BorrowDialog({
  open,
  onOpenChange,
  bookTitle,
  copies,
}: BorrowDialogProps) {
  const borrow = useBorrow();
  const availableCopies = copies.filter((c) => c.is_available);

  const [selectedCopyId, setSelectedCopyId] = useState<string>("");
  const [selectedMember, setSelectedMember] = useState<MemberResult | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [daysLoan, setDaysLoan] = useState(14);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedCopyId(availableCopies[0]?.id ?? "");
      setSelectedMember(null);
      setMemberSearch("");
      setMemberResults([]);
      setDaysLoan(14);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when dialog opens, not on every render
  }, [open]);

  // Member search with debounce
  useEffect(() => {
    if (!memberSearch || memberSearch.length < 2 || !supabase) {
      setMemberResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const q = `%${memberSearch}%`;
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_suspended")
        .or(`full_name.ilike.${q},email.ilike.${q}`)
        .eq("role", "member")
        .limit(5);

      setMemberResults((data as MemberResult[]) ?? []);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [memberSearch]);

  async function handleBorrow() {
    if (!selectedCopyId || !selectedMember) return;

    const dueAt = new Date(Date.now() + daysLoan * 86_400_000).toISOString();
    await borrow.mutateAsync({
      copyId: selectedCopyId,
      memberId: selectedMember.id,
      dueAt,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Borrow Book</DialogTitle>
          <DialogDescription className="font-body">
            Issue "{bookTitle}" to a member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy selection */}
          <div className="space-y-1.5">
            <Label className="font-body text-sm">Select Copy</Label>
            {availableCopies.length === 0 ? (
              <p className="text-sm text-destructive font-body">No copies available.</p>
            ) : (
              <div className="space-y-1.5">
                {availableCopies.map((copy) => (
                  <button
                    key={copy.id}
                    type="button"
                    onClick={() => setSelectedCopyId(copy.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-body transition-colors ${
                      selectedCopyId === copy.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span>#{copy.id.slice(0, 6)}</span>
                    <Badge variant="copper" className="text-[10px] capitalize">
                      {copy.condition}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Member search */}
          <div className="space-y-1.5">
            <Label className="font-body text-sm">Member</Label>
            {selectedMember ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary bg-primary/10">
                <div>
                  <p className="text-sm font-body font-medium text-foreground">
                    {selectedMember.full_name}
                  </p>
                  <p className="text-xs font-body text-muted-foreground">
                    {selectedMember.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberSearch("");
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email…"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-9"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  )}
                </div>
                {memberResults.length > 0 && (
                  <div className="border border-border rounded-lg divide-y divide-border bg-card">
                    {memberResults.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        disabled={m.is_suspended}
                        onClick={() => setSelectedMember(m)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-body hover:bg-surface-elevated/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-left">
                          <p className="text-foreground">{m.full_name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                        {m.is_suspended && (
                          <Badge variant="destructive" className="text-[10px]">
                            Suspended
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loan duration */}
          <div className="space-y-1.5">
            <Label className="font-body text-sm">Loan Period (days)</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={daysLoan}
              onChange={(e) => setDaysLoan(Number(e.target.value) || 14)}
            />
            <p className="text-xs text-muted-foreground font-body">
              Due: {new Date(Date.now() + daysLoan * 86_400_000).toLocaleDateString()}
            </p>
          </div>
        </div>

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
            disabled={!selectedCopyId || !selectedMember || borrow.isPending}
            onClick={handleBorrow}
          >
            {borrow.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            Issue Loan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
