/**
 * Checkout Success Page — Shown after successful Stripe payment.
 *
 * Reads the session_id from URL search params to display confirmation.
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutSuccessContent() {
  const clearCart = useCartStore((s) => s.clearCart);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // Clear the cart after successful payment
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle
            className="w-20 h-20 text-green-500 mx-auto mb-6"
            aria-hidden="true"
          />
          <h1 className="text-3xl font-bold text-accent mb-3">
            Payment Successful!
          </h1>
          <p className="text-muted text-lg mb-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {sessionId && (
            <p className="text-sm text-muted mb-8">
              Session ID: {sessionId.slice(0, 20)}...
            </p>
          )}
          <p className="text-muted mb-8">
            A confirmation email will be sent to your registered email address.
            You can view your order history in your profile.
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted">Loading...</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
