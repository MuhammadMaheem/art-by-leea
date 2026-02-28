/**
 * Skeleton — Loading placeholder component.
 *
 * Renders a pulsing gray rectangle. Use aspect-ratio containers to
 * prevent layout shift when content loads.
 */
import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse bg-secondary-warm/60 rounded-gallery", className)}
      aria-hidden="true"
    />
  );
}

/** Pre-built skeleton for an artwork card */
export function ArtworkCardSkeleton() {
  return (
    <div className="rounded-gallery overflow-hidden border border-primary/10 bg-surface">
      {/* Image placeholder — preserves aspect ratio */}
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      {/* Text placeholders */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-11 w-full mt-2 rounded-full" />
      </div>
    </div>
  );
}
