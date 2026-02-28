/**
 * Input — Reusable form input with label and error message.
 *
 * Features:
 * - Accessible: label linked via htmlFor, error via aria-describedby
 * - Error styling with red border and message
 * - Supports all standard <input> attributes
 */
"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    // Generate a stable ID from the label if none provided
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {/* Label */}
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1.5 tracking-wide"
        >
          {label}
        </label>

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={cn(
            "w-full px-4 py-3 rounded-gallery border bg-secondary/50 text-foreground",
            "placeholder:text-muted/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white dark:focus:bg-secondary-deep",
            "transition-all duration-200",
            "min-h-touch",
            error
              ? "border-error focus:ring-error/40"
              : "border-secondary-deep/50 hover:border-primary/40",
            className
          )}
          {...props}
        />

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
