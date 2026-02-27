/**
 * ArtworkGrid — Responsive grid of ArtworkCards.
 *
 * Grid layout:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px+):  2 columns
 * - Desktop (1024px+): 3 columns
 * - Large (1280px+):  4 columns
 */
import ArtworkCard from "./ArtworkCard";
import type { Artwork } from "@/types";

interface ArtworkGridProps {
  artworks: Artwork[];
}

export default function ArtworkGrid({ artworks }: ArtworkGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="text-center py-16 bg-secondary/50 rounded-xl">
        <p className="text-muted text-lg">
          No artworks found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
