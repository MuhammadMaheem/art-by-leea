import type { Metadata } from "next";
import ProductDetailPageContent from "@/components/shop/ProductDetailPageContent";

export const metadata: Metadata = {
  title: "Artwork Details | Art By Aleeha",
  description: "View artwork details, pricing, and availability before checkout.",
};

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProductDetailPageContent id={params.id} />;
}
