/**
 * cn() — Merge Tailwind CSS classes safely.
 *
 * Combines clsx (conditional classes) with tailwind-merge (deduplication)
 * so you can pass conditional classes without worrying about conflicts.
 *
 * Example: cn("px-4 py-2", isActive && "bg-primary", className)
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
