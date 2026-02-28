/**
 * Admin Orders Page — Lists all orders with status update controls.
 *
 * Admin can update order statuses (processing → shipped → delivered).
 * Status changes trigger email notifications to the customer via the API.
 */
"use client";

import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "@/lib/firebase/firestore";
import { useToast } from "@/components/ui/Toast";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/utils/formatPrice";
import { ORDER_STATUSES } from "@/utils/constants";
import { XCircle } from "lucide-react";
import type { Order } from "@/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        showToast("Failed to load orders.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Updates the status of an order and refreshes local state.
   */
  function handleStatusChange(orderId: string, newStatus: string) {
    if (newStatus === "cancelled") {
      setCancelTargetId(orderId);
      setAdminNote("");
      setShowCancelDialog(true);
      return;
    }
    applyStatusChange(orderId, newStatus);
  }

  async function applyStatusChange(orderId: string, newStatus: string, note?: string) {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus as Order["status"], note);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus as Order["status"],
                ...(newStatus === "cancelled" && note ? { adminCancellationNote: note, cancelledAt: new Date().toISOString() } : {}),
              }
            : order
        )
      );

      showToast(`Order status updated to "${newStatus}".`, "success");
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast("Failed to update order status.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  function confirmAdminCancel() {
    if (!cancelTargetId) return;
    applyStatusChange(cancelTargetId, "cancelled", adminNote.trim() || undefined);
    setShowCancelDialog(false);
    setCancelTargetId(null);
    setAdminNote("");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Orders</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-secondary rounded-gallery animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-foreground">
        Orders ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="gallery-card p-5"
            >
              {/* Order header row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    Order #{order.id?.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {order.userEmail} &middot;{" "}
                    {order.createdAt
                      ? new Date(
                          typeof order.createdAt === "string"
                            ? order.createdAt
                            : order.createdAt.seconds * 1000
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge status={order.status} />
                  <p className="font-semibold text-accent">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              {/* Order items summary */}
              <div className="mb-3">
                <p className="text-xs text-muted">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  :{" "}
                  {order.items
                    .map((item) => `${item.title} ×${item.quantity}`)
                    .join(", ")}
                </p>
              </div>

              {/* Admin cancellation note display */}
              {order.status === "cancelled" && order.adminCancellationNote && (
                <div className="mb-3 text-xs text-muted bg-error/5 dark:bg-error/10 border border-error/15 rounded-lg px-3 py-2">
                  <span className="font-medium text-error">Admin note:</span>{" "}
                  {order.adminCancellationNote}
                </div>
              )}

              {/* Status controls */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor={`status-${order.id}`}
                  className="text-xs font-medium text-muted"
                >
                  Update status:
                </label>
                <select
                  id={`status-${order.id}`}
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.id!, e.target.value)
                  }
                  disabled={updatingId === order.id}
                  className="text-sm border border-primary/15 dark:border-secondary-warm/60 rounded-gallery px-3 py-1.5 bg-secondary/50 dark:bg-secondary-warm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-touch cursor-pointer disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin cancel dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowCancelDialog(false); setCancelTargetId(null); }}
            aria-hidden="true"
          />
          <div className="relative bg-surface border border-secondary-warm dark:border-secondary-deep rounded-gallery shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-1">
              Cancel Order
            </h3>
            <p className="text-sm text-muted mb-4">
              Optionally add a note for the customer explaining why this order is being cancelled.
            </p>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Art piece is no longer available, refund issued..."
              rows={4}
              className="w-full rounded-gallery border border-secondary-warm dark:border-secondary-warm/60 bg-surface dark:bg-secondary-warm text-foreground placeholder:text-muted/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowCancelDialog(false); setCancelTargetId(null); }}
                className="cursor-pointer px-4 py-2 rounded-full text-sm font-medium border border-secondary-warm hover:bg-secondary/60 dark:hover:bg-secondary-warm transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmAdminCancel}
                disabled={!!updatingId}
                className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-error text-white hover:bg-error/90 transition-colors disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
                {updatingId ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
