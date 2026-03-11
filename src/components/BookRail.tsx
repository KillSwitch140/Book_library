import type { BookView } from "@/types";
import BookCard from "./BookCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface BookRailProps {
  title: string;
  books: BookView[];
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const BookRail = ({ title, books, size = "md", isLoading }: BookRailProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
      >
        {isLoading
          ? Array.from({ length: 5 }, (_, i) => {
              const w = size === "sm" ? "w-32" : size === "lg" ? "w-56" : "w-44";
              return (
                <div key={i} className={`${w} flex-shrink-0 space-y-3`}>
                  <div className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
                  <div className="h-2.5 bg-secondary rounded animate-pulse w-1/2" />
                </div>
              );
            })
          : books.map((book) => (
              <BookCard key={book.id} book={book} size={size} />
            ))}
      </div>
    </section>
  );
};

export default BookRail;
