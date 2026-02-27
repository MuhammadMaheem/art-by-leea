/**
 * Home Page — Landing page with hero, featured artworks, and services.
 */
import HeroSection from "@/components/home/HeroSection";
import FeaturedArtworks from "@/components/home/FeaturedArtworks";
import ServicesOverview from "@/components/home/ServicesOverview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedArtworks />
      <ServicesOverview />
    </>
  );
}
