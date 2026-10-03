"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import FilterBar from "@/components/shop/FilterBar";
import ArtworkGrid from "@/components/shop/ArtworkGrid";
import { ArtworkCardSkeleton } from "@/components/ui/Skeleton";
import { getArtworks } from "@/lib/firebase/firestore";
import type { Artwork } from "@/types";

export default function ShopPageContent() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("newest");

  useEffect(() => {
    async function fetchArtworks() {
      try {
        const data = await getArtworks();
        setArtworks(data);
      } catch {
        setError("We couldn't load the gallery right now.");
      } finally {
        setLoading(false);
      }
    }
    fetchArtworks();
  }, []);

  const filteredArtworks = useMemo(() => {
    let result = [...artworks];

    if (activeCategory !== "All") {
      result = result.filter((a) => a.category === activeCategory);
    }

    switch (activeSort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        break;
    }

    return result;
  }, [artworks, activeCategory, activeSort]);

  return (
    <section className="py-14 md:py-20">
      <Container>
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Art Gallery
          </h1>
          <p className="text-muted text-lg">
            Browse our collection of original artworks.
          </p>
          <p className="text-sm italic text-primary/70 mt-2">
            &ldquo;Art is not what you see, but what you make others see.&rdquo; — Edgar Degas
          </p>
        </div>

        <FilterBar
          activeCategory={activeCategory}
          activeSort={activeSort}
          onCategoryChange={setActiveCategory}
          onSortChange={setActiveSort}
        />

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ArtworkCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20 bg-error/10 border border-error/20 rounded-gallery">
            <p className="text-foreground font-medium mb-2">Gallery is temporarily unavailable.</p>
            <p className="text-sm text-muted">Please refresh in a moment.</p>
          </div>
        )}

        {!loading && !error && <ArtworkGrid artworks={filteredArtworks} />}
      </Container>
    </section>
  );
}
