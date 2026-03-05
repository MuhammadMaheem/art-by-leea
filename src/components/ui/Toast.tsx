/**
 * Toast — Simple notification toast using a portal pattern.
 *
 * A lightweight toast notification system. Shows success/error messages
 * at the bottom-right of the screen.
 *
 * Usage:
 *   import { toast } from "@/components/ui/Toast";
 *   toast.success("Item added to cart!");
 *   toast.error("Something went wrong.");
 */
"use client";

import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ToastMessage {
  id: string;
  type: "success" | "error";
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  showToast: (message: string, type: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error", message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const contextValue: ToastContextValue = {
    success: (message) => addToast("success", message),
    error: (message) => addToast("error", message),
    showToast: (message, type) => addToast(type, message),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container — fixed at bottom-right */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastMessage;
  onClose: () => void;
}) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "flex items-stretch rounded-gallery shadow-lg border min-w-[260px] max-w-[calc(100vw-2rem)] overflow-hidden",
        "animate-in slide-in-from-right",
        toast.type === "success"
          ? "bg-surface border-success/20"
          : "bg-surface border-error/20"
      )}
      role="alert"
    >
      {/* Left accent bar */}
      <div
        className={cn(
          "w-1 shrink-0",
          toast.type === "success" ? "bg-success" : "bg-error"
        )}
      />
      <div className="flex items-center gap-3 px-4 py-3 flex-1">
        {toast.type === "success" ? (
          <CheckCircle className="w-5 h-5 shrink-0 text-success" aria-hidden="true" />
        ) : (
          <XCircle className="w-5 h-5 shrink-0 text-error" aria-hidden="true" />
        )}
        <p className="text-sm font-medium flex-1 text-foreground">{toast.message}</p>
        <button
          onClick={onClose}
          className="cursor-pointer p-1 rounded-full hover:bg-secondary transition-colors min-w-[28px] flex items-center justify-center"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4 text-muted" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
