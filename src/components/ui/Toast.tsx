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
        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-[400px]",
        "animate-in slide-in-from-right",
        toast.type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      )}
      role="alert"
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
      ) : (
        <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
      )}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="cursor-pointer p-1 rounded hover:bg-black/10 transition-colors min-h-touch min-w-[28px] flex items-center justify-center"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
