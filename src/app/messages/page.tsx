import type { Metadata } from "next";
import CustomerMessagesPageContent from "@/components/messages/CustomerMessagesPageContent";

export const metadata: Metadata = {
  title: "Messages | Art By Aleeha",
  description: "Chat directly with the gallery about artworks, orders, and commissions.",
};

export default function CustomerMessagesPage() {
  return <CustomerMessagesPageContent />;
}
