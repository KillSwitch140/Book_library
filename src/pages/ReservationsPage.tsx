import { useAuth } from "@/context/AuthContext";
import { useMyReservations } from "@/hooks/useReservations";
import { useCancelReservation } from "@/hooks/useReservationMutations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookCoverImage from "@/components/BookCoverImage";
import { X, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function statusBadge(status: string) {
  switch (status) {
    case "ready":
      return <Badge variant="available">Ready for pickup</Badge>;
    case "waiting":
      return <Badge variant="waiting">Waiting</Badge>;
    case "fulfilled":
      return <Badge variant="secondary">Fulfilled</Badge>;
    case "cancelled":
      return <Badge variant="secondary">Cancelled</Badge>;
    case "expired":
      return <Badge variant="unavailable">Expired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

const ReservationsPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const memberId = session?.user?.id;

  const { data: reservations = [], isLoading, isError, refetch } = useMyReservations(memberId);
  const cancel = useCancelReservation();

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Reservations</h1>
        <p className="text-muted-foreground font-body mt-1">Books you've reserved</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-4 md:gap-6 p-4 bg-card border border-border rounded-xl">
              <div className="w-16 md:w-20 aspect-[2/3] rounded-lg bg-secondary animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-5 bg-secondary rounded animate-pulse w-1/3" />
                <div className="h-3 bg-secondary rounded animate-pulse w-1/5" />
                <div className="h-3 bg-secondary rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-sm font-body text-muted-foreground">Failed to load reservations.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && reservations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm font-body text-muted-foreground">
            You don't have any active reservations.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/catalog")}>
            Browse Catalog
          </Button>
        </div>
      )}

      {/* Reservation cards */}
      {!isLoading && !isError && reservations.length > 0 && (
        <div className="grid gap-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="flex gap-4 md:gap-6 p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors"
            >
              <div
                className="w-16 md:w-20 aspect-[2/3] rounded-lg shadow-card flex-shrink-0 overflow-hidden cursor-pointer"
                onClick={() => res.bookId && navigate(`/book/${res.bookId}`)}
              >
                <BookCoverImage
                  src={res.bookCover}
                  alt={res.bookTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <h3
                    className="font-display text-lg font-semibold text-foreground hover:text-primary cursor-pointer transition-colors"
                    onClick={() => res.bookId && navigate(`/book/${res.bookId}`)}
                  >
                    {res.bookTitle}
                  </h3>
                  <p className="text-xs font-body text-muted-foreground mt-1">
                    Reserved on {new Date(res.reservedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs font-body text-muted-foreground">
                    Queue position: <span className="text-foreground font-medium">#{res.position}</span>
                  </span>
                  <span className="text-xs font-body text-muted-foreground">
                    Est. available:{" "}
                    <span className="text-foreground font-medium">
                      {new Date(res.estimatedAvailable).toLocaleDateString()}
                    </span>
                  </span>
                  {statusBadge(res.status)}
                </div>
              </div>
              <div className="flex items-center flex-shrink-0">
                {(res.status === "waiting" || res.status === "ready") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={cancel.isPending}
                    onClick={() => cancel.mutate({ reservationId: res.id })}
                  >
                    {cancel.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
