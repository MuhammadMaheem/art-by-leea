/**
 * Global Loading State — Shown during page navigations.
 *
 * Art-themed loading with lavender spinner and gallery micro-copy.
 */
import Container from "@/components/layout/Container";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <section className="py-24">
      <Container>
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2
            className="w-10 h-10 text-primary animate-spin"
            aria-label="Loading page"
          />
          <p className="text-muted text-sm font-medium tracking-wide">
            Curating your experience&hellip;
          </p>
        </div>
      </Container>
    </section>
  );
}
