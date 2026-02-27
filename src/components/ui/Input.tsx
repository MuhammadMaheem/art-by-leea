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
          className="block text-sm font-medium text-accent mb-1.5"
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
            "w-full px-4 py-3 rounded-lg border bg-white text-accent",
            "placeholder:text-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-colors duration-200",
            "min-h-touch", // 44px minimum touch target
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 hover:border-gray-400",
            className
          )}
          {...props}
        />

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
