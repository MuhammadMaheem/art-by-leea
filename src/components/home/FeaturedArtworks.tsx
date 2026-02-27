/**
 * FeaturedArtworks — Grid of featured pieces on the home page.
 *
 * Fetches artworks marked as isFeatured from Firestore and displays
 * them in a responsive grid. Falls back to a placeholder message when
 * Firestore is empty (e.g., before seeding data).
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import { ArtworkCardSkeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/utils/formatPrice";
import { getFeaturedArtworks } from "@/lib/firebase/firestore";
import type { Artwork } from "@/types";

export default function FeaturedArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const data = await getFeaturedArtworks();
        setArtworks(data);
      } catch (error) {
        console.error("Error fetching featured artworks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <Container>
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-2">
              Featured Artworks
            </h2>
            <p className="text-muted text-lg">
              Our most popular and recently added pieces.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium mt-4 sm:mt-0 cursor-pointer transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArtworkCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Artworks grid */}
        {!loading && artworks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/shop/${artwork.id}`}
                className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white"
              >
                {/* Image with aspect ratio container */}
                <div className="aspect-[3/4] relative overflow-hidden bg-secondary">
                  <Image
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                {/* Card text */}
                <div className="p-4">
                  <h3 className="font-semibold text-accent group-hover:text-primary transition-colors">
                    {artwork.title}
                  </h3>
                  <p className="text-primary font-bold mt-1">
                    {formatPrice(artwork.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state — shown before data is seeded */}
        {!loading && artworks.length === 0 && (
          <div className="text-center py-16 bg-secondary/50 rounded-xl">
            <p className="text-muted text-lg mb-4">
              No featured artworks yet. Seed the database to see artwork here.
            </p>
            <Link
              href="/shop"
              className="text-primary hover:text-primary-dark font-medium cursor-pointer"
            >
              Browse the shop instead
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
