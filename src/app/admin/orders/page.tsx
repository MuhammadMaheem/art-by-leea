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
import type { Order } from "@/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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
  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus as Order["status"]);

      // Update local state to reflect change without re-fetching
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus as Order["status"] }
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
                  className="text-sm border border-primary/15 rounded-gallery px-3 py-1.5 bg-secondary/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-touch cursor-pointer disabled:opacity-50"
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
    </div>
  );
}
