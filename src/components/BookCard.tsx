import type { BookView } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookCoverImage from "@/components/BookCoverImage";

interface BookCardProps {
  book: BookView;
  size?: "sm" | "md" | "lg";
}

const BookCard = ({ book, size = "md" }: BookCardProps) => {
  const navigate = useNavigate();
  const sizeClasses = {
    sm: "w-32",
    md: "w-44",
    lg: "w-56",
  };

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 group cursor-pointer`} onClick={() => navigate(`/book/${book.id}`)}>
      <div className="relative overflow-hidden rounded-lg shadow-card transition-all duration-300 group-hover:shadow-card-hover group-hover:scale-[1.03]">
        <BookCoverImage
          src={book.cover}
          alt={book.title}
          className="w-full aspect-[2/3] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs font-body text-foreground">{book.rating}</span>
          </div>
          <Badge variant={book.available ? "available" : "unavailable"} className="text-[10px]">
            {book.available ? "Available" : "Borrowed"}
          </Badge>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-body text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="font-body text-xs text-muted-foreground truncate">{book.author}</p>
      </div>
    </div>
  );
};

export default BookCard;
