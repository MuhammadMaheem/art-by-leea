import type { Metadata } from "next";
import ShopPageContent from "@/components/shop/ShopPageContent";

export const metadata: Metadata = {
  title: "Art Gallery | Art By Aleeha",
  description: "Browse original paintings, digital art, sculptures, and mixed media artworks.",
};

export default function ShopPage() {
  return <ShopPageContent />;
}
