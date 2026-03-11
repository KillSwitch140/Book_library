import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden shadow-card">
      <img
        src={heroBg}
        alt="Library hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />
      <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12 max-w-2xl">
        <p className="text-primary font-body text-sm font-semibold tracking-wider uppercase mb-3">
          Your Digital Library
        </p>
        <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight mb-4">
          Discover Your Next <span className="text-gradient-warm">Great Read</span>
        </h1>
        <p className="text-muted-foreground font-body text-base md:text-lg mb-6 max-w-lg">
          Browse our collection, borrow instantly, and manage your reading life — all in one place.
        </p>
        <div className="flex gap-3">
          <Button variant="hero" size="lg" onClick={() => navigate("/catalog")}>
            <Search className="w-4 h-4" />
            Explore Catalog
          </Button>
          <Button variant="subtle" size="lg" onClick={() => navigate("/my-books")}>
            My Books
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
