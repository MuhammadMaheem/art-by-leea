/**
 * Global Loading State — Shown during page navigations.
 *
 * Uses a simple spinner matching the lavender color palette.
 */
import Container from "@/components/layout/Container";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <section className="py-20">
      <Container>
        <div className="flex items-center justify-center">
          <Loader2
            className="w-8 h-8 text-primary animate-spin"
            aria-label="Loading page"
          />
        </div>
      </Container>
    </section>
  );
}
