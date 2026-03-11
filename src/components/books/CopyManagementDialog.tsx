import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useBook } from "@/hooks/useBook";
import { useAddCopy, useRemoveCopy } from "@/hooks/useBookMutations";
import type { CopyCondition } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CopyManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
}

const CONDITIONS: CopyCondition[] = ["new", "good", "fair", "poor"];

const conditionColor: Record<CopyCondition, string> = {
  new: "text-emerald-400",
  good: "text-blue-400",
  fair: "text-amber-400",
  poor: "text-red-400",
};

export default function CopyManagementDialog({
  open,
  onOpenChange,
  bookId,
  bookTitle,
}: CopyManagementDialogProps) {
  const { data, isLoading } = useBook(open ? bookId : undefined);
  const copies = data?.copies ?? [];

  const addCopy = useAddCopy();
  const removeCopy = useRemoveCopy();

  const [newCondition, setNewCondition] = useState<CopyCondition>("new");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Manage Copies</DialogTitle>
          <DialogDescription className="font-body">
            Physical copies of "{bookTitle}"
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Copy list */}
            {copies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 font-body">
                No copies registered.
              </p>
            ) : (
              <div className="space-y-2">
                {copies.map((copy) => (
                  <div
                    key={copy.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-elevated border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{copy.id.slice(0, 6)}
                      </span>
                      <span
                        className={`text-xs font-body font-medium capitalize ${conditionColor[copy.condition]}`}
                      >
                        {copy.condition}
                      </span>
                      <Badge
                        variant={copy.is_available ? "available" : "unavailable"}
                        className="text-[10px]"
                      >
                        {copy.is_available ? "On Shelf" : "Borrowed"}
                      </Badge>
                    </div>

                    {confirmDelete === copy.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={removeCopy.isPending}
                          onClick={() => {
                            removeCopy.mutate(
                              { copyId: copy.id, bookId },
                              { onSuccess: () => setConfirmDelete(null) },
                            );
                          }}
                        >
                          {removeCopy.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Confirm"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setConfirmDelete(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirmDelete(copy.id)}
                        disabled={!copy.is_available}
                        title={
                          copy.is_available
                            ? "Remove copy"
                            : "Cannot remove — currently borrowed"
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add copy */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Select
                value={newCondition}
                onValueChange={(v) => setNewCondition(v as CopyCondition)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="hero"
                size="sm"
                className="gap-1"
                disabled={addCopy.isPending}
                onClick={() => addCopy.mutate({ bookId, condition: newCondition })}
              >
                {addCopy.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Add Copy
              </Button>
            </div>

            {/* Summary */}
            <p className="text-xs text-muted-foreground font-body text-center">
              {copies.length} total · {copies.filter((c) => c.is_available).length}{" "}
              available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
