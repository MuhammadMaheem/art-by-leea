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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-light/15 via-background to-secondary/40">
      {/* Decorative background elements */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light/15 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <Container className="py-24 md:py-36 relative z-10">
        <div className="max-w-3xl">
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface/80 rounded-full border border-primary/15 mb-8 backdrop-blur-sm">
            <Palette className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground tracking-wide">
              Handcrafted Art, Delivered to You
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-6">
            Discover Art That{" "}
            <span className="text-primary">Speaks to You</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted max-w-2xl mb-4 leading-relaxed">
            Browse our curated collection of original paintings, digital
            art, and sculptures — or commission a custom piece tailored
            to your vision.
          </p>

          <p className="text-sm italic text-primary/70 mb-10">
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
