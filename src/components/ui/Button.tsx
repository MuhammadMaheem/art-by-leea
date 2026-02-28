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
    "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md transition-all duration-200",
  secondary:
    "bg-secondary text-foreground hover:bg-secondary-warm focus:ring-secondary-deep transition-all duration-200",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary transition-all duration-200",
  ghost:
    "text-primary hover:bg-primary-light/30 focus:ring-primary transition-all duration-200",
  danger:
    "bg-error text-white hover:bg-error/90 focus:ring-error transition-all duration-200",
} as const;

/** Size styles map — all ensure minimum 48x48px touch target */
const sizes = {
  sm: "px-5 py-2 text-sm min-h-touch min-w-touch",
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
          "inline-flex items-center justify-center font-medium rounded-full",
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
