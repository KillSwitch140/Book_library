import { useState } from "react";
import { BookOpen } from "lucide-react";

interface BookCoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

const BookCoverImage = ({ src, alt, className }: BookCoverImageProps) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={`bg-secondary flex items-center justify-center ${className}`}>
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
};

export default BookCoverImage;
