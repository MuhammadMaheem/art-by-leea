/**
 * Custom 404 Page — Shown when a route doesn't match any page.
 */
import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { Home, Palette } from "lucide-react";

export default function NotFound() {
  return (
    <section className="py-20 md:py-32">
      <Container>
        <div className="text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-primary-light/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <Palette className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>
          <p className="text-7xl font-heading font-bold text-primary/30 mb-4">404</p>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
            This masterpiece hasn&apos;t been painted yet
          </h1>
          <p className="text-muted mb-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved to another gallery.
          </p>
          <p className="text-sm italic text-primary/70 mb-8">
            &ldquo;Not all who wander are lost — but this page definitely is!&rdquo;
          </p>
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              Return to Gallery
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
