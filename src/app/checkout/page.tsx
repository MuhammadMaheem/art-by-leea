/**
 * Checkout Page — Easypaisa payment with receipt upload.
 *
 * Shows Easypaisa number, lets customer upload payment screenshot,
 * then submits order for admin verification.
 */
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Loader2, Copy, Check } from "lucide-react";
import imageCompression from "browser-image-compression";
import Container from "@/components/layout/Container";
import AuthGuard from "@/components/auth/AuthGuard";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/utils/formatPrice";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";

function CheckoutContent() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);

  const [easypaisaNumber, setEasypaisaNumber] = useState("03404677899");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Promo from session storage
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    const code = sessionStorage.getItem("promoCode");
    const pct = sessionStorage.getItem("discountPercent");
    if (code) setPromoCode(code);
    if (pct) setDiscountPercent(Number(pct));
  }, []);

  // Fetch Easypaisa number from admin settings
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.config?.easypaisaNumber) {
          setEasypaisaNumber(data.config.easypaisaNumber);
        }
      })
      .catch(() => {});
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items, router]);

  const subtotal = totalPrice();
  const discount = promoCode ? subtotal * (discountPercent / 100) : 0;
  const total = subtotal - discount;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(easypaisaNumber);
    setCopied(true);
    toast.success("Number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReceiptUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }

    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("folder", "receipts");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json();
      setReceiptUrl(url);
      toast.success("Receipt uploaded!");
    } catch {
      toast.error("Failed to upload receipt. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!receiptUrl) {
      toast.error("Please upload your payment receipt.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
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
          userId: user!.uid,
          userEmail: user!.email,
          receiptImageUrl: receiptUrl,
          promoCode: promoCode || null,
          discountPercent: discountPercent || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit order");
      }

      // Clear promo from session storage
      sessionStorage.removeItem("promoCode");
      sessionStorage.removeItem("discountPercent");

      router.push("/checkout/success");
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted mb-10">
            Complete your payment via Easypaisa and upload the receipt.
          </p>

          {/* Order Summary */}
          <div className="gallery-card p-6 mb-8">
            <h2 className="font-heading font-semibold text-foreground mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="text-foreground font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {promoCode && (
                <div className="flex justify-between text-success">
                  <span>Promo: {promoCode} (-{discountPercent}%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <hr className="border-secondary-warm" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Easypaisa Instructions */}
          <div className="bg-success/10 border border-success/20 rounded-gallery p-6 mb-8">
            <h2 className="font-heading font-semibold text-foreground mb-3">
              Payment via Easypaisa
            </h2>
            <p className="text-sm text-muted mb-3">
              Send <strong className="text-foreground">{formatPrice(total)}</strong> to the following
              Easypaisa number:
            </p>
            <div className="flex items-center gap-3 bg-surface rounded-gallery px-4 py-3 border border-success/20">
              <span className="text-xl font-bold text-foreground tracking-wider">
                {easypaisaNumber}
              </span>
              <button
                onClick={handleCopy}
                className="ml-auto p-2 rounded-full hover:bg-secondary transition-all cursor-pointer"
                aria-label="Copy Easypaisa number"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <Copy className="w-5 h-5 text-muted" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted mt-2">
              After sending payment, take a screenshot of the confirmation and
              upload it below.
            </p>
          </div>

          {/* Receipt Upload */}
          <div className="mb-8">
            <h2 className="font-heading font-semibold text-foreground mb-3">
              Upload Payment Receipt
            </h2>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-gallery p-8 cursor-pointer transition-all ${
                receiptUrl
                  ? "border-success bg-success/5"
                  : "border-primary/20 hover:border-primary hover:bg-secondary/30"
              }`}
            >
              {uploading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : receiptUrl ? (
                <div className="text-center">
                  <Image
                    src={receiptUrl}
                    alt="Payment receipt"
                    width={200}
                    height={300}
                    className="mx-auto rounded-gallery mb-3 object-contain max-h-60"
                  />
                  <p className="text-sm text-success">
                    Receipt uploaded — click to replace
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload
                    className="w-10 h-10 text-muted mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-muted">
                    Click to upload payment screenshot
                  </p>
                  <p className="text-xs text-muted mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="hidden"
              />
            </label>
          </div>

          <Button
            onClick={handleSubmitOrder}
            loading={submitting}
            disabled={!receiptUrl || uploading}
            size="lg"
            className="w-full"
          >
            {submitting ? "Submitting Order..." : "Submit Order"}
          </Button>

          <p className="text-xs text-muted text-center mt-4">
            Your order will be verified by the admin after receipt confirmation.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  );
}
