/**
 * Button — Reusable, accessible button component.
 *
 * Features:
 * - Multiple variants: primary (lavender), secondary, outline, ghost
 * - Multiple sizes: sm, md, lg — all meet 44x44px minimum touch target
 * - Focus ring for keyboard accessibility
 * - Loading state with spinner
 * - Works as <button> or wraps with onClick
 */
"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/** Variant styles map */
const variants = {
  primary:
    "bg-primary text-accent hover:bg-primary-dark focus:ring-primary transition-colors duration-200",
  secondary:
    "bg-secondary text-accent hover:bg-gray-200 focus:ring-gray-400 transition-colors duration-200",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-accent focus:ring-primary transition-colors duration-200",
  ghost:
    "text-accent hover:bg-secondary focus:ring-gray-400 transition-colors duration-200",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 transition-colors duration-200",
} as const;

/** Size styles map — all ensure minimum 44x44px touch target */
const sizes = {
  sm: "px-4 py-2 text-sm min-h-touch min-w-touch",
  md: "px-6 py-3 text-base min-h-touch min-w-touch",
  lg: "px-8 py-4 text-lg min-h-touch min-w-touch",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium rounded-lg",
          "cursor-pointer select-none",
          // Focus ring for accessibility
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Apply variant and size
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
