/**
 * Cart Page — Shows all items in the shopping cart with summary.
 *
 * Uses Zustand store for cart state. Layout: items list on the left,
 * order summary on the right (stacks on mobile).
 */
"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Container from "@/components/layout/Container";
import CartItemComponent from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <section className="py-12 md:py-16">
      <Container>
        <h1 className="text-3xl md:text-4xl font-bold text-accent mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          /* Empty cart state */
          <div className="text-center py-20 bg-secondary/50 rounded-xl">
            <ShoppingBag
              className="w-16 h-16 text-muted mx-auto mb-4"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold text-accent mb-2">
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
                  className="text-sm text-red-500 hover:text-red-700 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
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
