/**
 * Product Detail Page — Shows a single artwork with full details.
 *
 * Server component for SEO metadata generation, with client
 * interactions (add to cart, buy now) handled by a client wrapper.
 */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Zap } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { formatPrice } from "@/utils/formatPrice";
import { getArtwork } from "@/lib/firebase/firestore";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/providers/AuthProvider";
import type { Artwork } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();
  const { isAdmin, profile } = useAuth();
  const isAdminAsCustomer = profile?.role === "admin" && !isAdmin;

  const id = params.id as string;

  useEffect(() => {
    async function fetchArtwork() {
      try {
        const data = await getArtwork(id);
        setArtwork(data);
      } catch (error) {
        console.error("Error fetching artwork:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchArtwork();
  }, [id]);

  const handleAddToCart = () => {
    if (!artwork) return;
    if (isAdminAsCustomer) {
      toast.error("You're the artist! You can't buy your own masterpieces.");
      return;
    }
    addItem(artwork);
    toast.success(`"${artwork.title}" added to cart!`);
  };

  const handleBuyNow = () => {
    if (!artwork) return;
    if (isAdminAsCustomer) {
      toast.error("You're the artist! You can't buy your own masterpieces.");
      return;
    }
    addItem(artwork);
    router.push("/cart");
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            <Skeleton className="aspect-[3/4] w-full rounded-gallery" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-full mt-8" />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Not found state
  if (!artwork) {
    return (
      <section className="py-14 md:py-20">
        <Container>
          <div className="text-center py-20">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
              Artwork Not Found
            </h1>
            <p className="text-muted mb-6">
              This artwork may have been removed or doesn&apos;t exist.
            </p>
            <Link href="/shop">
              <Button variant="outline">Back to Gallery</Button>
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-14 md:py-20">
      <Container>
        {/* Back button */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Left: Artwork image */}
          <div className="aspect-[3/4] relative rounded-gallery overflow-hidden bg-gradient-to-br from-secondary to-primary-light/10 shadow-md">
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right: Details panel */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
              {artwork.title}
            </h1>

            <p className="text-2xl font-bold text-accent mb-6">
              {formatPrice(artwork.price)}
            </p>

            {/* Metadata */}
            <div className="space-y-3 mb-6">
              <div className="flex gap-2">
                <span className="text-muted font-medium w-24">Category:</span>
                <span className="text-foreground">{artwork.category}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted font-medium w-24">Medium:</span>
                <span className="text-foreground">{artwork.medium}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted font-medium w-24">Size:</span>
                <span className="text-foreground">{artwork.dimensions}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted font-medium w-24">Status:</span>
                <span
                  className={
                    artwork.inStock ? "text-success" : "text-error"
                  }
                >
                  {artwork.inStock ? "In Stock" : "Sold Out"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-heading font-semibold text-foreground mb-2">
                About This Piece
              </h2>
              <p className="text-muted leading-relaxed">
                {artwork.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              {isAdmin ? (
                <Button disabled className="flex-1 opacity-60">
                  Admin View — Cannot Purchase
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleAddToCart}
                    disabled={!artwork.inStock}
                    className="flex-1"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" aria-hidden="true" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBuyNow}
                    disabled={!artwork.inStock}
                    className="flex-1"
                  >
                    <Zap className="w-5 h-5 mr-2" aria-hidden="true" />
                    Buy Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
