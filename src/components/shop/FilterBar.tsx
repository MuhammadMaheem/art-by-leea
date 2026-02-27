/**
 * FilterBar — Category filter buttons and sort dropdown for the shop.
 *
 * Allows users to filter artworks by category and sort by price/date.
 * All buttons meet the 44px minimum touch target requirement.
 */
"use client";

import { ART_CATEGORIES, SORT_OPTIONS } from "@/utils/constants";
import { cn } from "@/utils/cn";

interface FilterBarProps {
  activeCategory: string;
  activeSort: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
}

export default function FilterBar({
  activeCategory,
  activeSort,
  onCategoryChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      {/* Category filter buttons — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
        {ART_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              "min-h-touch cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              activeCategory === cat
                ? "bg-primary text-accent"
                : "bg-secondary text-muted hover:bg-gray-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <select
        value={activeSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-accent bg-white min-h-touch cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        aria-label="Sort artworks"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
