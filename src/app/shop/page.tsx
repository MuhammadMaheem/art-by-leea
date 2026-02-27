/**
 * Shop Page — Filterable gallery of all artworks.
 *
 * Fetches artworks from Firestore and allows filtering by category
 * and sorting by price or date. Uses client-side state to manage
 * the active filters and sorted results.
 */
"use client";

import { useEffect, useState, useMemo } from "react";
import Container from "@/components/layout/Container";
import FilterBar from "@/components/shop/FilterBar";
import ArtworkGrid from "@/components/shop/ArtworkGrid";
import { ArtworkCardSkeleton } from "@/components/ui/Skeleton";
import { getArtworks } from "@/lib/firebase/firestore";
import type { Artwork } from "@/types";

export default function ShopPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("newest");

  // Fetch all artworks on mount
  useEffect(() => {
    async function fetchArtworks() {
      try {
        const data = await getArtworks();
        setArtworks(data);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtworks();
  }, []);

  // Filter and sort artworks (computed from state, no extra API calls)
  const filteredArtworks = useMemo(() => {
    let result = [...artworks];

    // Apply category filter
    if (activeCategory !== "All") {
      result = result.filter((a) => a.category === activeCategory);
    }

    // Apply sort
    switch (activeSort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        // Already sorted by createdAt desc from Firestore query
        break;
    }

    return result;
  }, [artworks, activeCategory, activeSort]);

  return (
    <section className="py-12 md:py-16">
      <Container>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-accent mb-2">
            Art Gallery
          </h1>
          <p className="text-muted text-lg">
            Browse our collection of original artworks.
          </p>
          <p className="text-sm italic text-primary/70 mt-2">
            &ldquo;Art is not what you see, but what you make others see.&rdquo; — Edgar Degas
          </p>
        </div>

        {/* Filter controls */}
        <FilterBar
          activeCategory={activeCategory}
          activeSort={activeSort}
          onCategoryChange={setActiveCategory}
          onSortChange={setActiveSort}
        />

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ArtworkCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Artworks grid */}
        {!loading && <ArtworkGrid artworks={filteredArtworks} />}
      </Container>
    </section>
  );
}
