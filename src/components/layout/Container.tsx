/**
 * Container — Max-width wrapper for page content.
 *
 * Provides consistent horizontal padding and max-width across all pages.
 */
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
