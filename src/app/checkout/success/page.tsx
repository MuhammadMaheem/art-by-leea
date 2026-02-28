/**
 * Checkout Success Page — Shown after order submission.
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Container from "@/components/layout/Container";
import AuthGuard from "@/components/auth/AuthGuard";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";

function CheckoutSuccessContent() {
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear the cart after successful submission
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="max-w-lg mx-auto text-center gallery-card p-10">
          <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-success/20">
            <CheckCircle
              className="w-12 h-12 text-success"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-3">
            Order Submitted!
          </h1>
          <p className="text-muted text-lg mb-2">
            Thank you for your purchase. Your order is pending payment verification.
          </p>
          <p className="text-muted mb-8">
            The admin will verify your Easypaisa payment receipt and update your
            order status. You&apos;ll receive an email once confirmed. You can
            track your order in your profile.
          </p>
          <p className="text-sm italic text-primary/70 mb-8">
            &ldquo;Art washes away from the soul the dust of everyday life.&rdquo; — Pablo Picasso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profile">
              <Button>View My Orders</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <AuthGuard>
      <CheckoutSuccessContent />
    </AuthGuard>
  );
}
