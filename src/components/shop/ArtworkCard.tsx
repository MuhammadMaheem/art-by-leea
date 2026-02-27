/**
 * ArtworkCard — Displays a single artwork in the gallery grid.
 *
 * Shows artwork image, title, price, and "Add to Cart" button.
 * Links to the product detail page. Uses aspect-ratio container
 * for images to prevent layout shift.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/providers/AuthProvider";
import type { Artwork } from "@/types";

interface ArtworkCardProps {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();
  const { isAdmin } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    // Prevent the Link navigation when clicking the button
    e.preventDefault();
    e.stopPropagation();
    addItem(artwork);
    toast.success(`"${artwork.title}" added to cart!`);
  };

  return (
    <div className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col">
      {/* Image — links to product detail */}
      <Link
        href={`/shop/${artwork.id}`}
        className="block aspect-[3/4] relative overflow-hidden bg-secondary cursor-pointer"
      >
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      {/* Card content */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/shop/${artwork.id}`} className="cursor-pointer">
          <h3 className="font-semibold text-accent group-hover:text-primary transition-colors line-clamp-1">
            {artwork.title}
          </h3>
          <p className="text-sm text-muted mt-1 line-clamp-1">
            {artwork.medium}
          </p>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-primary font-bold text-lg">
            {formatPrice(artwork.price)}
          </span>
          {isAdmin ? (
            <span className="text-xs text-muted italic">Admin</span>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!artwork.inStock}
              className="cursor-pointer p-2.5 rounded-lg bg-primary hover:bg-primary-dark text-accent transition-colors min-h-touch min-w-touch flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Add ${artwork.title} to cart`}
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
