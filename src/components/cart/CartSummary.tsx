/**
 * CartSummary — Order summary sidebar showing totals and checkout button.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, X } from "lucide-react";
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
  const { user, isAdmin, profile } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const isAdminAsCustomer = profile?.role === "admin" && !isAdmin;

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

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to continue checkout.");
      router.push("/auth/login");
      return;
    }

    // Store promo info in sessionStorage for the checkout page
    if (appliedPromo) {
      sessionStorage.setItem("promoCode", appliedPromo.code);
      sessionStorage.setItem("discountPercent", String(appliedPromo.discountPercent));
    } else {
      sessionStorage.removeItem("promoCode");
      sessionStorage.removeItem("discountPercent");
    }

    router.push("/checkout");
  };

  const subtotal = totalPrice();
  const discount = appliedPromo ? subtotal * (appliedPromo.discountPercent / 100) : 0;
  const total = subtotal - discount;

  return (
    <div className="gallery-card p-6 sticky top-24">
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            Subtotal ({totalItems()} item{totalItems() !== 1 ? "s" : ""})
          </span>
          <span className="text-foreground font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Shipping</span>
          <span className="text-success font-medium">Free</span>
        </div>
        {appliedPromo && (
          <div className="flex justify-between text-sm">
            <span className="text-success flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" aria-hidden="true" />
              {appliedPromo.code} (-{appliedPromo.discountPercent}%)
            </span>
            <span className="text-success font-medium">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
        <hr className="border-secondary-warm" />
        <div className="flex justify-between">
          <span className="text-foreground font-bold text-lg">Total</span>
          <span className="text-accent font-bold text-lg">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Promo code input */}
      <div className="mb-4">
        {appliedPromo ? (
          <div className="flex items-center justify-between bg-success/10 rounded-gallery px-3 py-2 border border-success/20">
            <span className="text-sm text-success font-medium">
              <Tag className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
              {appliedPromo.code}
            </span>
            <button
              onClick={removePromo}
              className="text-success hover:text-success/80 cursor-pointer"
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
        disabled={items.length === 0 || isAdmin || isAdminAsCustomer}
        className="w-full"
        size="lg"
      >
        {isAdmin || isAdminAsCustomer ? "Purchasing Disabled (Admin)" : "Proceed to Checkout"}
      </Button>
    </div>
  );
}
