/**
 * Custom 404 Page — Shown when a route doesn't match any page.
 */
import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <section className="py-20 md:py-32">
      <Container>
        <div className="text-center max-w-md mx-auto">
          <p className="text-7xl font-bold text-primary mb-4">404</p>
          <h1 className="text-2xl font-bold text-accent mb-2">
            Page Not Found
          </h1>
          <p className="text-muted mb-2">
            The page you are looking for does not exist or has been moved.
          </p>
          <p className="text-sm italic text-primary/70 mb-8">
            &ldquo;Not all who wander are lost — but this page definitely is!&rdquo;
          </p>
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
