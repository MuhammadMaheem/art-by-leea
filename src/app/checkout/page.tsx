import type { Metadata } from "next";
import CheckoutPageContent from "@/components/checkout/CheckoutPageContent";

export const metadata: Metadata = {
  title: "Checkout | Art By Aleeha",
  description: "Complete your purchase by submitting payment details and your receipt.",
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
