/**
 * Home Page — Landing page with hero, featured artworks, and services.
 */
import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import FeaturedArtworks from "@/components/home/FeaturedArtworks";
import ServicesOverview from "@/components/home/ServicesOverview";

export const metadata: Metadata = {
  title: "Art By Aleeha | Original Art & Custom Commissions",
  description: "Discover handcrafted artwork, browse featured pieces, and request a custom commission.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedArtworks />
      <ServicesOverview />
    </>
  );
}
