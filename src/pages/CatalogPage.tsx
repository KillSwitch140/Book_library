import { useBooks, useGenres } from "@/hooks/useBooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Filter, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCoverImage from "@/components/BookCoverImage";

const CatalogPage = () => {
  const navigate = useNavigate();
  const [activeGenre, setActiveGenre] = useState("All");

  const { data: genreList = [] } = useGenres();
  const allGenres = ["All", ...genreList];

  const {
    data: filtered = [],
    isLoading,
    isError,
    refetch,
  } = useBooks({
    genre: activeGenre === "All" ? undefined : activeGenre,
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Catalog</h1>
        <p className="text-muted-foreground font-body mt-1">Browse our complete collection</p>
      </div>

      {/* Genre Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
              activeGenre === genre
                ? "bg-primary text-primary-foreground"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
              <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-secondary rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-sm font-body text-muted-foreground">
            Failed to load books.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm font-body text-muted-foreground">
            No books found{activeGenre !== "All" ? ` in "${activeGenre}"` : ""}.
          </p>
          {activeGenre !== "All" && (
            <Button variant="outline" size="sm" onClick={() => setActiveGenre("All")}>
              Show all
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filtered.map((book) => (
            <div key={book.id} className="group cursor-pointer" onClick={() => navigate(`/book/${book.id}`)}>
              <div className="relative overflow-hidden rounded-lg shadow-card transition-all duration-300 group-hover:shadow-card-hover group-hover:scale-[1.03]">
                <BookCoverImage
                  src={book.cover}
                  alt={book.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 space-y-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-xs font-body text-foreground">{book.rating}</span>
                  </div>
                  <Badge variant={book.available ? "available" : "unavailable"} className="text-[10px]">
                    {book.available ? `${book.availableCopies} available` : "All borrowed"}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="font-body text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground truncate">{book.author}</p>
                <Badge variant="copper" className="text-[10px]">{book.genre}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
