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
      className={cn("animate-pulse bg-gray-200 rounded-lg", className)}
      aria-hidden="true"
    />
  );
}

/** Pre-built skeleton for an artwork card */
export function ArtworkCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100">
      {/* Image placeholder — preserves aspect ratio */}
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      {/* Text placeholders */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}
