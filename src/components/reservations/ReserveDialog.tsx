import { useAuth } from "@/context/AuthContext";
import { useReserve } from "@/hooks/useReservationMutations";
import { useQueueLength } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Clock, Loader2, Users } from "lucide-react";

interface ReserveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
}

export default function ReserveDialog({
  open,
  onOpenChange,
  bookId,
  bookTitle,
}: ReserveDialogProps) {
  const { session } = useAuth();
  const memberId = session?.user?.id;
  const reserve = useReserve();
  const { data: queueLength = 0 } = useQueueLength(open ? bookId : undefined);

  const handleReserve = () => {
    if (!memberId) return;
    reserve.mutate(
      { bookId, memberId },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Reserve Book</DialogTitle>
          <DialogDescription className="font-body">
            You'll be placed in the queue for{" "}
            <span className="text-foreground font-medium">{bookTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3 text-sm font-body text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>
              {queueLength === 0
                ? "No one is currently waiting — you'll be first in line!"
                : `${queueLength} ${queueLength === 1 ? "person" : "people"} currently in the queue`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm font-body text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>You'll be notified when the book becomes available</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="hero"
            className="gap-2"
            disabled={reserve.isPending || !memberId}
            onClick={handleReserve}
          >
            {reserve.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            Confirm Reservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
