/**
 * HeroSection — Full-width hero banner on the home page.
 *
 * Features a gradient background (lavender → white), headline text,
 * description, and two CTA buttons leading to the shop and commissions.
 */
import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-white to-primary-light/30">
      {/* Decorative background circle */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <Container className="py-20 md:py-32 relative z-10">
        <div className="max-w-3xl">
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-primary/20 mb-6">
            <Palette className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-accent">
              Handcrafted Art, Delivered to You
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent leading-tight mb-6">
            Discover Art That{" "}
            <span className="text-primary">Speaks to You</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted max-w-2xl mb-4 leading-relaxed">
            Browse our curated collection of original paintings, digital
            art, and sculptures — or commission a custom piece tailored
            to your vision.
          </p>

          <p className="text-sm italic text-primary/70 mb-8">
            &ldquo;Every canvas is a journey all its own.&rdquo; — Helen Frankenthaler
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Gallery
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/commission">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Request Commission
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
