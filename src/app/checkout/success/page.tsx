import type { Metadata } from "next";
import CheckoutSuccessPageContent from "@/components/checkout/CheckoutSuccessPageContent";

export const metadata: Metadata = {
  title: "Order Submitted | Art By Aleeha",
  description: "Your order has been submitted and is pending payment verification.",
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessPageContent />;
}
