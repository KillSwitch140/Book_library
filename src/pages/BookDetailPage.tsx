import { useParams, useNavigate } from "react-router-dom";
import { useBook, useSimilarBooks, useAuthorBooks, useStaffPicks } from "@/hooks/useBook";
import { useArchiveBook } from "@/hooks/useBookMutations";
import { useBookLoanHistory } from "@/hooks/useLoans";
import { useBookInsights, useGenerateInsights } from "@/hooks/useBookInsights";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookRail from "@/components/BookRail";
import { RoleGuard } from "@/components/RoleGuard";
import BookFormDialog from "@/components/books/BookFormDialog";
import CopyManagementDialog from "@/components/books/CopyManagementDialog";
import BorrowDialog from "@/components/loans/BorrowDialog";
import ReturnDialog from "@/components/loans/ReturnDialog";
import ReserveDialog from "@/components/reservations/ReserveDialog";
import {
  Star,
  Heart,
  BookOpen,
  CalendarClock,
  ArrowLeft,
  Clock,
  Globe,
  Hash,
  Layers,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Archive,
  History,
  Settings2,
  TrendingUp,
  Loader2,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useBook(id);
  const book = data?.book ?? null;
  const copies = data?.copies ?? [];

  const { data: similarBooks = [], isLoading: similarLoading } = useSimilarBooks(book?.genre, book?.id);
  const { data: authorBooks = [], isLoading: authorLoading } = useAuthorBooks(book?.author, book?.id);
  const { data: staffPicks = [], isLoading: picksLoading } = useStaffPicks(book?.id);

  const { data: loanHistory = [] } = useBookLoanHistory(id);
  const { data: insights, isLoading: insightsLoading } = useBookInsights(id);
  const generateInsights = useGenerateInsights();
  const { role, session } = useAuth();
  const isStaff = role === "librarian" || role === "admin";

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Admin dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [copyMgmtOpen, setCopyMgmtOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const archiveBook = useArchiveBook();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="relative -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-8">
          <div className="relative px-4 md:px-8 pt-6 pb-10">
            <div className="h-5 w-16 bg-secondary rounded animate-pulse mb-8" />
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-[1400px] mx-auto">
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="w-56 md:w-64 lg:w-72 aspect-[2/3] rounded-xl bg-secondary animate-pulse" />
              </div>
              <div className="flex-1 space-y-6">
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-secondary rounded-full animate-pulse" />
                  <div className="h-6 w-16 bg-secondary rounded-full animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-secondary rounded animate-pulse w-3/4" />
                  <div className="h-5 bg-secondary rounded animate-pulse w-1/3" />
                </div>
                <div className="h-4 bg-secondary rounded animate-pulse w-1/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-secondary rounded animate-pulse w-full" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-5/6" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-12 bg-secondary rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground">Book Not Found</h1>
        <p className="text-muted-foreground font-body">The book you're looking for doesn't exist.</p>
        <Button variant="outline" onClick={() => navigate("/catalog")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
        </Button>
      </div>
    );
  }

  const statusConfig = book.available
    ? { label: "Available", variant: "available" as const, icon: CheckCircle2 }
    : { label: "Borrowed", variant: "unavailable" as const, icon: AlertTriangle };

  const StatusIcon = statusConfig.icon;

  const tags = [book.genre, book.year > 2000 ? "Contemporary" : "Classic", book.rating >= 4.5 ? "Highly Rated" : "Popular"];

  return (
    <div className="animate-fade-in">
      {/* Hero Backdrop */}
      <div className="relative -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-8">
        <div className="absolute inset-0 overflow-hidden">
          {book.cover && (
            <img
              src={book.cover}
              alt=""
              className="w-full h-full object-cover scale-110 blur-3xl opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-background/90" />
        </div>

        <div className="relative px-4 md:px-8 pt-6 pb-10">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-[1400px] mx-auto">
            {/* Cover */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="w-56 md:w-64 lg:w-72 rounded-xl overflow-hidden shadow-card-hover ring-1 ring-border/50">
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-secondary flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Status + Genre */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusConfig.variant} className="gap-1.5 text-xs px-3 py-1">
                  <StatusIcon className="w-3 h-3" /> {statusConfig.label}
                </Badge>
                <Badge variant="copper" className="text-xs">{book.genre}</Badge>
                {book.rating >= 4.5 && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </Badge>
                )}
              </div>

              {/* Title & Author */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
                  {book.title}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-body mt-2">
                  by <span className="text-foreground font-medium">{book.author}</span>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(book.rating) ? "fill-primary text-primary" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-body font-semibold text-foreground">{book.rating}</span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-sm font-body text-muted-foreground leading-relaxed">
                  {isDescExpanded ? book.description : book.description.slice(0, 200)}
                  {book.description.length > 200 && !isDescExpanded && "…"}
                </p>
                {book.description.length > 200 && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-xs text-primary font-body font-medium hover:underline"
                  >
                    {isDescExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetaItem icon={CalendarClock} label="Published" value={book.year ? String(book.year) : "—"} />
                <MetaItem icon={Globe} label="Language" value="English" />
                <MetaItem icon={Hash} label="ISBN" value={book.isbn || "—"} />
                <MetaItem icon={Layers} label="Copies" value={`${book.availableCopies} of ${book.copies}`} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-[11px] font-body font-medium bg-secondary text-secondary-foreground border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {isStaff ? (
                  <>
                    <Button
                      variant="hero"
                      size="lg"
                      className="gap-2"
                      disabled={!book.available}
                      onClick={() => setBorrowOpen(true)}
                    >
                      <BookOpen className="w-4 h-4" />
                      {book.available ? "Issue Borrow" : "Unavailable"}
                    </Button>
                    {book.availableCopies < book.copies && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2"
                        onClick={() => setReturnOpen(true)}
                      >
                        <RotateCcw className="w-4 h-4" /> Process Return
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="hero"
                    size="lg"
                    className="gap-2"
                    disabled
                    title="Visit the library desk to borrow this book"
                  >
                    <BookOpen className="w-4 h-4" />
                    {book.available ? "Available to Borrow" : "Unavailable"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  disabled={!session}
                  title={!session ? "Sign in to reserve this book" : undefined}
                  onClick={() => setReserveOpen(true)}
                >
                  <Clock className="w-4 h-4" /> Reserve
                </Button>
                <Button
                  variant={isWishlisted ? "default" : "subtle"}
                  size="lg"
                  className="gap-2"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                  {isWishlisted ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-[1400px] mx-auto space-y-12 pb-12">
        {/* AI Insights */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground">
              AI Insights
            </h2>
            {insights && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI-generated
              </Badge>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            {insightsLoading ? (
              /* Loading skeleton */
              <div className="space-y-3">
                <div className="h-4 bg-secondary rounded animate-pulse w-3/4" />
                <div className="h-4 bg-secondary rounded animate-pulse w-5/6" />
                <div className="h-4 bg-secondary rounded animate-pulse w-1/2" />
              </div>
            ) : insights ? (
              /* Insights exist — render structured fields */
              <div className="space-y-5">
                {/* Quick Summary */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">
                    Summary
                  </p>
                  <p className="text-sm font-body text-foreground/90 leading-relaxed">
                    {insights.quickSummary}
                  </p>
                </div>

                {/* Best For */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">
                    Best For
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {insights.bestFor.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs font-body font-normal">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">
                    Tone
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {insights.tone.map((item) => (
                      <Badge key={item} variant="copper" className="text-xs font-body font-normal">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Themes */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">
                    Themes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {insights.themes.map((theme) => (
                      <Badge key={theme} variant="outline" className="text-xs font-body font-normal">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Why Read It */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">
                    Why Read It
                  </p>
                  <p className="text-sm font-body italic text-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-3">
                    {insights.whyReadIt}
                  </p>
                </div>

                <p className="text-[10px] font-body text-muted-foreground/60 pt-2">
                  Based on catalog metadata. May not reflect all aspects of the book.
                </p>
              </div>
            ) : (
              /* No insights — empty state */
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-body text-muted-foreground text-center">
                  Get AI-powered insights to help you decide
                </p>
                {generateInsights.error?.message?.includes("Not enough metadata") ? (
                  <div className="flex items-start gap-2 max-w-sm text-center">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs font-body text-muted-foreground">
                      This book doesn't have enough metadata for AI insights. Add a description or specific genre to enable this feature.
                    </p>
                  </div>
                ) : session ? (
                  <Button
                    variant="outline"
                    className="gap-2"
                    disabled={generateInsights.isPending}
                    onClick={() => generateInsights.mutate(book.id)}
                  >
                    {generateInsights.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Insights
                      </>
                    )}
                  </Button>
                ) : (
                  <p className="text-xs font-body text-muted-foreground">
                    Sign in to generate AI insights
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Similar Books */}
        {(similarBooks.length > 0 || similarLoading) && (
          <BookRail title={`More in ${book.genre}`} books={similarBooks} isLoading={similarLoading} />
        )}

        {/* More from Author */}
        {(authorBooks.length > 0 || authorLoading) && (
          <BookRail title={`More by ${book.author}`} books={authorBooks} isLoading={authorLoading} />
        )}

        {/* Staff Picks */}
        {(staffPicks.length > 0 || picksLoading) && (
          <BookRail title="Staff Recommendations" books={staffPicks} isLoading={picksLoading} />
        )}

        {/* Availability */}
        <section id="loan-history" className="space-y-4">
          <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground px-1">
            Availability & History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Availability Card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-body font-medium">
                <Copy className="w-4 h-4 text-primary" /> Copy Availability
              </div>
              <div className="space-y-3">
                {copies.length > 0 ? (
                  copies.map((copy) => (
                    <div key={copy.id} className="flex items-center justify-between text-sm font-body">
                      <span className="text-muted-foreground">
                        Copy #{copy.id.slice(0, 6)}
                        <span className="ml-2 text-xs capitalize text-muted-foreground/70">{copy.condition}</span>
                      </span>
                      <Badge variant={copy.is_available ? "available" : "unavailable"} className="text-[10px]">
                        {copy.is_available ? "On Shelf" : "Borrowed"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground font-body">
                    {book.copies > 0
                      ? `${book.availableCopies} of ${book.copies} copies available`
                      : "No copies registered"}
                  </p>
                )}
              </div>
            </div>

            {/* Recent Activity — staff only (shows borrower names) */}
            <RoleGuard
              allow={["librarian", "admin"]}
              fallback={
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2 text-foreground font-body font-medium">
                    <History className="w-4 h-4 text-primary" /> Recent Activity
                  </div>
                  <p className="text-sm text-muted-foreground font-body">
                    Circulation history is only visible to library staff.
                  </p>
                </div>
              }
            >
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2 text-foreground font-body font-medium">
                  <History className="w-4 h-4 text-primary" /> Recent Activity
                </div>
                {loanHistory.length > 0 ? (
                  <div className="space-y-3">
                    {loanHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm font-body">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-24">{entry.borrowDate}</span>
                          <span className={`${
                            entry.status === "returned"
                              ? "text-emerald-400"
                              : entry.status === "overdue"
                                ? "text-red-400"
                                : "text-foreground"
                          }`}>
                            {entry.status === "returned" ? "Returned" : entry.status === "overdue" ? "Overdue" : "Borrowed"}
                          </span>
                        </div>
                        <span className="text-muted-foreground">{entry.memberName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground font-body">
                    No loan history yet.
                  </p>
                )}
              </div>
            </RoleGuard>
          </div>
        </section>

        {/* Admin Panel */}
        <RoleGuard allow={["librarian", "admin"]}>
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground px-1">
              Admin Controls
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <AdminAction icon={Pencil} label="Edit Book" onClick={() => setEditOpen(true)} />
                <RoleGuard allow="admin">
                  <AdminAction icon={Archive} label="Archive Book" onClick={() => setArchiveOpen(true)} />
                </RoleGuard>
                <AdminAction icon={Settings2} label="Manage Copies" onClick={() => setCopyMgmtOpen(true)} />
                <AdminAction icon={History} label="Loan History" onClick={() => {
                  // Scroll to the activity section
                  document.getElementById("loan-history")?.scrollIntoView({ behavior: "smooth" });
                }} />
              </div>
            </div>
          </section>
        </RoleGuard>
      </div>

      {/* Admin Dialogs */}
      <BookFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        book={book}
      />

      {id && (
        <CopyManagementDialog
          open={copyMgmtOpen}
          onOpenChange={setCopyMgmtOpen}
          bookId={id}
          bookTitle={book.title}
        />
      )}

      {/* Borrow / Return Dialogs */}
      {id && (
        <BorrowDialog
          open={borrowOpen}
          onOpenChange={setBorrowOpen}
          bookTitle={book.title}
          copies={copies}
        />
      )}

      {id && (
        <ReturnDialog
          open={returnOpen}
          onOpenChange={setReturnOpen}
          bookId={id}
          bookTitle={book.title}
        />
      )}

      {/* Reserve Dialog */}
      {id && (
        <ReserveDialog
          open={reserveOpen}
          onOpenChange={setReserveOpen}
          bookId={id}
          bookTitle={book.title}
        />
      )}

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Archive Book</DialogTitle>
            <DialogDescription className="font-body">
              Are you sure you want to archive{" "}
              <span className="text-foreground font-medium">{book.title}</span>?
              This will remove it from the public catalog. You can restore it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={archiveBook.isPending}
              onClick={() => {
                archiveBook.mutate(book.id, {
                  onSuccess: () => {
                    setArchiveOpen(false);
                    navigate("/catalog");
                  },
                });
              }}
            >
              {archiveBook.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MetaItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[11px] font-body uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-body font-medium text-foreground truncate">{value}</p>
  </div>
);

const AdminAction = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-secondary/50 hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors group"
  >
    <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
    <span className="text-xs font-body font-medium">{label}</span>
  </button>
);

export default BookDetailPage;
