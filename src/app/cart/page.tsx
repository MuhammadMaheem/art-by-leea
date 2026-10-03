import type { Metadata } from "next";
import CartPageContent from "@/components/cart/CartPageContent";

export const metadata: Metadata = {
  title: "Cart | Art By Aleeha",
  description: "Review selected artworks, apply promo codes, and proceed to checkout.",
};

export default function CartPage() {
  return <CartPageContent />;
}
