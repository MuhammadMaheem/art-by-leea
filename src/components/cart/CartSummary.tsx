/**
 * CartSummary — Order summary sidebar showing totals and checkout button.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Tag, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/utils/formatPrice";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";

export default function CartSummary() {
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);
  const items = useCartStore((s) => s.items);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo({ code: data.code, discountPercent: data.discountPercent });
        toast.success(`Promo code "${data.code}" applied — ${data.discountPercent}% off!`);
      } else {
        setPromoError(data.error || "Invalid code.");
      }
    } catch {
      setPromoError("Failed to validate code.");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  };

  const handleCheckout = async () => {
    // Must be logged in to checkout
    if (!user) {
      toast.error("Please sign in to continue checkout.");
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      // Call our API route to create a Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
          userId: user.uid,
          userEmail: user.email,
          promoCode: appliedPromo?.code || null,
          discountPercent: appliedPromo?.discountPercent || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe's hosted checkout page
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = totalPrice();
  const discount = appliedPromo ? subtotal * (appliedPromo.discountPercent / 100) : 0;
  const afterDiscount = subtotal - discount;
  // Simple tax calculation (for display only — Stripe handles actual tax)
  const estimatedTax = afterDiscount * 0.08;
  const total = afterDiscount + estimatedTax;

  return (
    <div className="bg-secondary/50 rounded-xl p-6 sticky top-24">
      <h2 className="text-xl font-bold text-accent mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            Subtotal ({totalItems()} item{totalItems() !== 1 ? "s" : ""})
          </span>
          <span className="text-accent font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Estimated Tax</span>
          <span className="text-accent font-medium">
            {formatPrice(estimatedTax)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        {appliedPromo && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" aria-hidden="true" />
              {appliedPromo.code} (-{appliedPromo.discountPercent}%)
            </span>
            <span className="text-green-600 font-medium">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
        <hr className="border-gray-200" />
        <div className="flex justify-between">
          <span className="text-accent font-bold text-lg">Total</span>
          <span className="text-primary font-bold text-lg">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Promo code input */}
      <div className="mb-4">
        {appliedPromo ? (
          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 border border-green-200">
            <span className="text-sm text-green-700 font-medium">
              <Tag className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
              {appliedPromo.code}
            </span>
            <button
              onClick={removePromo}
              className="text-green-600 hover:text-green-800 cursor-pointer"
              aria-label="Remove promo code"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              label="Promo Code"
              placeholder="Promo code"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              error={promoError}
            />
            <Button
              variant="outline"
              onClick={handleApplyPromo}
              loading={promoLoading}
              disabled={!promoInput.trim()}
              className="shrink-0"
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={handleCheckout}
        loading={loading}
        disabled={items.length === 0}
        className="w-full"
        size="lg"
      >
        {loading ? "Processing..." : "Proceed to Checkout"}
      </Button>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted">
        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        <span>Secure checkout powered by Stripe</span>
      </div>
    </div>
  );
}
