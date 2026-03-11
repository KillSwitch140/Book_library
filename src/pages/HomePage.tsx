import HeroSection from "@/components/HeroSection";
import BookRail from "@/components/BookRail";
import { useBooks } from "@/hooks/useBooks";

const HomePage = () => {
  const { data: trendingBooks = [], isLoading: trendingLoading } = useBooks({
    sortField: "rating",
    sortDir: "desc",
    limit: 8,
  });
  const { data: newArrivals = [], isLoading: newLoading } = useBooks({
    sortField: "created_at",
    sortDir: "desc",
    limit: 8,
  });
  const { data: availableNow = [], isLoading: availLoading } = useBooks({
    status: "available",
    limit: 8,
  });

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto animate-fade-in">
      <HeroSection />

      <BookRail title="Trending Now" books={trendingBooks} size="lg" isLoading={trendingLoading} />
      <BookRail title="New Arrivals" books={newArrivals} isLoading={newLoading} />
      <BookRail title="Available Now" books={availableNow} isLoading={availLoading} />
    </div>
  );
};

export default HomePage;
