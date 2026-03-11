import type { BookView } from "@/types";
import { useBooks, useGenres } from "@/hooks/useBooks";
import { useArchiveBook } from "@/hooks/useBookMutations";
import BookFormDialog from "@/components/books/BookFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Pencil,
  BookOpen,
  RotateCcw,
  Archive,
  MoreHorizontal,
  ChevronDown,
  BookX,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type ViewMode = "grid" | "table";
type SortField = "title" | "author" | "year" | "rating";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "available" | "unavailable";

const CatalogManagementPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editTarget, setEditTarget] = useState<BookView | null>(null);

  // Archive state
  const [archiveTarget, setArchiveTarget] = useState<BookView | null>(null);
  const archiveBook = useArchiveBook();

  const { data: genreList = [] } = useGenres();
  const allGenres = ["All", ...genreList];

  const { data: filtered = [], isLoading } = useBooks({
    search: search || undefined,
    genre: genre === "All" ? undefined : genre,
    status: status === "all" ? undefined : status,
    sortField,
    sortDir,
  });

  const totalCopies = filtered.reduce((s, b) => s + b.copies, 0);
  const activeFilterCount = [genre !== "All", status !== "all"].filter(Boolean).length;

  function openEdit(book: BookView) {
    setEditTarget(book);
    setFormMode("edit");
    setFormOpen(true);
  }

  function openAdd() {
    setEditTarget(null);
    setFormMode("add");
    setFormOpen(true);
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Catalog Management
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            {filtered.length} titles · {totalCopies} total copies
          </p>
        </div>
        <Button variant="hero" className="gap-2 self-start" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Book
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Genre */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" /> Genre
                {genre !== "All" && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">
                    1
                  </span>
                )}
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {allGenres.map((g) => (
                <DropdownMenuItem
                  key={g}
                  onClick={() => setGenre(g)}
                  className={genre === g ? "text-primary font-medium" : ""}
                >
                  {g}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                Status
                {status !== "all" && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">
                    1
                  </span>
                )}
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setStatus("all")} className={status === "all" ? "text-primary font-medium" : ""}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("available")} className={status === "available" ? "text-primary font-medium" : ""}>
                Available
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("unavailable")} className={status === "unavailable" ? "text-primary font-medium" : ""}>
                Unavailable
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                {sortDir === "asc" ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
                Sort
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {(["title", "author", "year", "rating"] as SortField[]).map((f) => (
                <DropdownMenuItem
                  key={f}
                  onClick={() => {
                    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    else { setSortField(f); setSortDir("asc"); }
                  }}
                  className={sortField === f ? "text-primary font-medium" : ""}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {sortField === f && (sortDir === "asc" ? " ↑" : " ↓")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setGenre("All"); setStatus("all"); setSearch(""); }}
            >
              Clear all
            </Button>
          )}

          {/* View Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden ml-auto">
            <button
              onClick={() => setView("grid")}
              className={`px-2.5 py-1.5 transition-colors ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-2.5 py-1.5 transition-colors ${
                view === "table"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState view={view} />
      ) : filtered.length === 0 ? (
        <EmptyState search={search} onClear={() => { setSearch(""); setGenre("All"); setStatus("all"); }} />
      ) : view === "grid" ? (
        <GridView books={filtered} onArchive={setArchiveTarget} onEdit={openEdit} onNavigate={(id) => navigate(`/book/${id}`)} />
      ) : (
        <TableView books={filtered} onArchive={setArchiveTarget} onEdit={openEdit} onNavigate={(id) => navigate(`/book/${id}`)} />
      )}

      {/* Book Form Dialog */}
      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        book={editTarget}
      />

      {/* Archive Confirmation */}
      <Dialog open={!!archiveTarget} onOpenChange={() => setArchiveTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Archive Book</DialogTitle>
            <DialogDescription className="font-body">
              Are you sure you want to archive{" "}
              <span className="text-foreground font-medium">{archiveTarget?.title}</span>?
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
                if (!archiveTarget) return;
                archiveBook.mutate(archiveTarget.id, {
                  onSuccess: () => setArchiveTarget(null),
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

/* ─── Grid View ─── */
const GridView = ({
  books,
  onArchive,
  onEdit,
  onNavigate,
}: {
  books: BookView[];
  onArchive: (b: BookView) => void;
  onEdit: (b: BookView) => void;
  onNavigate: (id: string) => void;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
    {books.map((book) => (
      <div key={book.id} className="group">
        <div
          className="relative overflow-hidden rounded-lg shadow-card transition-all duration-300 group-hover:shadow-card-hover group-hover:scale-[1.02] cursor-pointer"
          onClick={() => onNavigate(book.id)}
        >
          <img src={book.cover} alt={book.title} className="w-full aspect-[2/3] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 space-y-2">
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-7 gap-1 bg-card/80 backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); onEdit(book); }}
              >
                <Pencil className="w-3 h-3" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-7 gap-1 bg-card/80 backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); onNavigate(book.id); }}
              >
                {book.available ? (
                  <><BookOpen className="w-3 h-3" /> Borrow</>
                ) : (
                  <><RotateCcw className="w-3 h-3" /> Return</>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[10px] h-6 text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onArchive(book); }}
            >
              <Archive className="w-3 h-3 mr-1" /> Archive
            </Button>
          </div>
        </div>
        <div className="mt-2.5 space-y-1 px-0.5">
          <h3 className="font-body text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate(book.id)}>
            {book.title}
          </h3>
          <p className="font-body text-xs text-muted-foreground truncate">{book.author}</p>
          <div className="flex items-center justify-between">
            <Badge variant="copper" className="text-[10px]">{book.genre}</Badge>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-body text-muted-foreground">
                {book.availableCopies}/{book.copies}
              </span>
              <Badge variant={book.available ? "available" : "unavailable"} className="text-[9px] px-1.5">
                {book.available ? "Available" : "Borrowed"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ─── Table View ─── */
const TableView = ({
  books,
  onArchive,
  onEdit,
  onNavigate,
}: {
  books: BookView[];
  onArchive: (b: BookView) => void;
  onEdit: (b: BookView) => void;
  onNavigate: (id: string) => void;
}) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["Title", "Author", "ISBN", "Category", "Available", "Total", "Status", "Actions"].map(
              (h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-body font-medium text-muted-foreground uppercase tracking-wider px-4 py-3"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr
              key={book.id}
              className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-8 h-12 rounded object-cover flex-shrink-0"
                  />
                  <span
                    className="text-sm font-body font-medium text-foreground hover:text-primary cursor-pointer transition-colors truncate max-w-[200px]"
                    onClick={() => onNavigate(book.id)}
                  >
                    {book.title}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-body text-muted-foreground whitespace-nowrap">
                {book.author}
              </td>
              <td className="px-4 py-3 text-xs font-body text-muted-foreground font-mono">
                {book.isbn}
              </td>
              <td className="px-4 py-3">
                <Badge variant="copper" className="text-[10px]">{book.genre}</Badge>
              </td>
              <td className="px-4 py-3 text-sm font-body text-foreground text-center">
                {book.availableCopies}
              </td>
              <td className="px-4 py-3 text-sm font-body text-muted-foreground text-center">
                {book.copies}
              </td>
              <td className="px-4 py-3">
                <Badge variant={book.available ? "available" : "unavailable"} className="text-[10px]">
                  {book.available ? "Available" : "Borrowed"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2 text-xs" onClick={() => onEdit(book)}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-xs" onClick={() => onNavigate(book.id)}>
                      {book.available ? (
                        <><BookOpen className="w-3.5 h-3.5" /> Borrow</>
                      ) : (
                        <><RotateCcw className="w-3.5 h-3.5" /> Return</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 text-xs text-destructive focus:text-destructive"
                      onClick={() => onArchive(book)}
                    >
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ─── Empty State ─── */
const EmptyState = ({ search, onClear }: { search: string; onClear: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
      <BookX className="w-8 h-8 text-muted-foreground" />
    </div>
    <div className="text-center space-y-1">
      <h3 className="font-display text-lg font-semibold text-foreground">No books found</h3>
      <p className="text-sm font-body text-muted-foreground max-w-sm">
        {search
          ? `No results for "${search}". Try adjusting your filters.`
          : "No books match the current filters."}
      </p>
    </div>
    <Button variant="outline" size="sm" onClick={onClear}>
      Clear filters
    </Button>
  </div>
);

/* ─── Loading State ─── */
const LoadingState = ({ view }: { view: ViewMode }) => (
  <div className="animate-fade-in">
    {view === "grid" ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2.5">
            <div className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
            <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
            <div className="h-2.5 bg-secondary rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-8 h-12 rounded bg-secondary animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-secondary rounded animate-pulse w-1/3" />
              <div className="h-2.5 bg-secondary rounded animate-pulse w-1/5" />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default CatalogManagementPage;
