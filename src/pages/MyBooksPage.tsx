import { useAuth } from "@/context/AuthContext";
import { useMyLoans } from "@/hooks/useLoans";
import { useRenew } from "@/hooks/useLoanMutations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookCoverImage from "@/components/BookCoverImage";
import { BookOpen, RotateCcw, Clock, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyBooksPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const memberId = session?.user?.id;

  const { data: myLoans = [], isLoading, isError, refetch } = useMyLoans(memberId);
  const renew = useRenew();

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">My Books</h1>
        <p className="text-muted-foreground font-body mt-1">Your currently borrowed titles</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-4 md:gap-6 p-4 bg-card border border-border rounded-xl">
              <div className="w-20 md:w-24 aspect-[2/3] rounded-lg bg-secondary animate-pulse flex-shrink-0" />
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
          <p className="text-sm font-body text-muted-foreground">Failed to load your books.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && myLoans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm font-body text-muted-foreground">
            You don't have any borrowed books right now.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/catalog")}>
            Browse Catalog
          </Button>
        </div>
      )}

      {/* Loan cards */}
      {!isLoading && !isError && myLoans.length > 0 && (
        <div className="grid gap-4">
          {myLoans.map((loan) => (
            <div
              key={loan.id}
              className="flex gap-4 md:gap-6 p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors"
            >
              <div
                className="w-20 md:w-24 aspect-[2/3] rounded-lg shadow-card flex-shrink-0 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/book/${loan.bookId}`)}
              >
                <BookCoverImage
                  src={loan.bookCover}
                  alt={loan.bookTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <h3
                    className="font-display text-lg font-semibold text-foreground hover:text-primary cursor-pointer transition-colors"
                    onClick={() => navigate(`/book/${loan.bookId}`)}
                  >
                    {loan.bookTitle}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground">{loan.bookAuthor}</p>
                  <p className="text-xs font-body text-muted-foreground mt-2 line-clamp-2">
                    {loan.bookDescription}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Due {new Date(loan.dueDate).toLocaleDateString()}
                  </div>
                  <Badge variant={loan.isOverdue ? "destructive" : "available"}>
                    {loan.isOverdue ? "Overdue" : "On time"}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-2 justify-center flex-shrink-0">
                <Button
                  variant="subtle"
                  size="sm"
                  disabled={renew.isPending}
                  onClick={() => renew.mutate({ loanId: loan.id })}
                >
                  {renew.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden md:inline">Renew</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/book/${loan.bookId}`)}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Details</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBooksPage;
