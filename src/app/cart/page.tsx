/**
 * Cart Page — Shows all items in the shopping cart with summary.
 *
 * Uses Zustand store for cart state. Layout: items list on the left,
 * order summary on the right (stacks on mobile).
 */
"use client";

import Link from "next/link";
import { ShoppingBag, ShieldAlert } from "lucide-react";
import Container from "@/components/layout/Container";
import CartItemComponent from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/providers/AuthProvider";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { isAdmin } = useAuth();

  return (
    <section className="py-14 md:py-20">
      <Container>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
          Shopping Cart
        </h1>
        <p className="text-sm italic text-primary/70 mb-10">
          &ldquo;Art is the only way to run away without leaving home.&rdquo; — Twyla Tharp
        </p>

        {/* Admin warning banner */}
        {isAdmin && (
          <div className="mb-6 rounded-gallery border border-accent/30 bg-accent/10 p-4 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
            <p className="text-sm text-foreground">
              You are in <strong>Admin mode</strong>. Purchasing is disabled. Switch to Customer mode in your profile to shop.
            </p>
          </div>
        )}

        {items.length === 0 ? (
          /* Empty cart state */
          <div className="text-center py-20 bg-secondary/40 rounded-gallery">
            <ShoppingBag
              className="w-16 h-16 text-muted/40 mx-auto mb-4"
              aria-hidden="true"
            />
            <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted mb-6">
              Discover beautiful artworks in our gallery.
            </p>
            <Link href="/shop">
              <Button>Browse Gallery</Button>
            </Link>
          </div>
        ) : (
          /* Cart with items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list (takes 2 columns on desktop) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted">
                  {items.length} item{items.length !== 1 ? "s" : ""} in cart
                </span>
                <button
                  onClick={clearCart}
                  className="text-sm text-error hover:text-error/80 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 rounded-full px-3 py-1"
                >
                  Clear all
                </button>
              </div>

              {items.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))}
            </div>

            {/* Order summary sidebar */}
            <div>
              <CartSummary />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
