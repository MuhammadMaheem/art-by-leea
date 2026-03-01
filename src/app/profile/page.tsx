/**
 * Profile Page — User account with order and commission history.
 *
 * Protected by AuthGuard — redirects to login if not authenticated.
 * Shows user info, recent orders, and commission requests.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Package, PenTool, User, Lock, XCircle, MessageCircle } from "lucide-react";
import Container from "@/components/layout/Container";
import AuthGuard from "@/components/auth/AuthGuard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/utils/formatPrice";
import { useAuth } from "@/providers/AuthProvider";
import { signOut, changePassword } from "@/lib/firebase/auth";
import { getUserOrders, getUserCommissions } from "@/lib/firebase/firestore";
import type { Order, Commission } from "@/types";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user, profile, viewMode, setViewMode } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;
      try {
        const [userOrders, userCommissions] = await Promise.all([
          getUserOrders(user.uid),
          getUserCommissions(user.uid),
        ]);
        setOrders(userOrders);
        setCommissions(userCommissions);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const openCancelDialog = (orderId: string) => {
    setCancelTargetId(orderId);
    setCancelReason("");
    setCancelReasonError("");
    setShowCancelDialog(true);
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
    setCancelTargetId(null);
    setCancelReason("");
    setCancelReasonError("");
  };

  const handleCancelOrder = async () => {
    if (!user || !cancelTargetId) return;

    const trimmed = cancelReason.trim();
    if (trimmed.length < 10) {
      setCancelReasonError("Please provide at least 10 characters.");
      return;
    }

    setCancellingId(cancelTargetId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/orders/${cancelTargetId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel order.");
        return;
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelTargetId
            ? { ...o, status: "cancelled", cancellationReason: trimmed, cancelledAt: new Date().toISOString() }
            : o
        )
      );
      toast.success("Order cancelled successfully.");
      closeCancelDialog();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = "Current password is required";
    if (!newPassword) errors.newPassword = "New password is required";
    if (newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
    if (newPassword !== confirmNewPassword) errors.confirmNewPassword = "Passwords do not match";
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update password";
      if (message.includes("wrong-password") || message.includes("invalid-credential")) {
        setPasswordErrors({ currentPassword: "Current password is incorrect" });
      } else {
        toast.error("Failed to update password. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <section className="py-14 md:py-20">
      <Container>
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 bg-primary-light/40 dark:bg-secondary-warm rounded-full flex items-center justify-center ring-2 ring-primary/20 dark:ring-secondary-deep">
              <User className="w-9 h-9 text-primary dark:text-beige" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {profile?.displayName || user?.displayName || "User"}
              </h1>
              <p className="text-muted text-sm tracking-wide">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="mt-4 sm:mt-0 text-error hover:bg-error/10"
          >
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
            Sign Out
          </Button>
        </div>

        {/* Admin view-mode toggle */}
        {profile?.role === "admin" && (
          <div className="mb-8 rounded-gallery border border-primary/20 bg-primary-light/10 dark:bg-primary/10 dark:border-primary/15 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-heading font-medium text-foreground">Admin View Mode</p>
              <p className="text-sm text-muted">
                {viewMode === "admin"
                  ? "You are viewing the site as an admin. Purchasing is disabled."
                  : "You are viewing the site as a customer. You can browse and purchase."}
              </p>
            </div>
            <button
              onClick={() => setViewMode(viewMode === "admin" ? "customer" : "admin")}
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/25 bg-surface text-foreground font-medium hover:bg-primary-light/15 dark:hover:bg-primary/10 transition-colors min-h-touch"
            >
              Switch to {viewMode === "admin" ? "Customer" : "Admin"} View
            </button>
          </div>
        )}

        {/* Orders section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-heading font-bold text-foreground">My Orders</h2>
            <span className="text-xs text-muted ml-auto">Permanent history</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted bg-secondary/50 rounded-gallery p-6 text-center">
              No orders yet. Start browsing our gallery!
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isCancellable =
                  order.status === "pending" || order.status === "pending_verification";
                const isCancelling = cancellingId === order.id;

                return (
                  <div
                    key={order.id}
                    className="gallery-card p-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""} &middot;{" "}
                          <span className="text-accent font-medium">{formatPrice(order.total)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                        <Badge status={order.status} />

                        {isCancellable && (
                          <button
                            onClick={() => openCancelDialog(order.id)}
                            disabled={isCancelling}
                            className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-error border border-error/30 hover:bg-error/10 transition-colors disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            {isCancelling ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>

                    {order.status === "cancelled" && order.cancellationReason && (
                      <div className="text-xs text-muted bg-error/5 dark:bg-error/10 border border-error/15 rounded-lg px-3 py-2">
                        <span className="font-medium text-error">Your reason:</span>{" "}
                        {order.cancellationReason}
                      </div>
                    )}

                    {order.status === "cancelled" && order.adminCancellationNote && (
                      <div className="text-xs text-muted bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-lg px-3 py-2">
                        <span className="font-medium text-primary">Admin note:</span>{" "}
                        {order.adminCancellationNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Commissions section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-heading font-bold text-foreground">
              My Commission Requests
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : commissions.length === 0 ? (
            <p className="text-muted bg-secondary/50 rounded-gallery p-6 text-center">
              No commission requests yet. Request a custom piece!
            </p>
          ) : (
            <div className="space-y-3">
              {commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="gallery-card p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {commission.category} — {commission.budget}
                      </p>
                      <p className="text-sm text-muted line-clamp-1">
                        {commission.description}
                      </p>
                    </div>
                    <Badge status={commission.status} />
                  </div>

                  {/* Quoted price & estimated delivery */}
                  {(commission.quotedPrice || commission.estimatedDelivery) && (
                    <div className="flex flex-wrap gap-3 text-xs">
                      {commission.quotedPrice && (
                        <span className="bg-success/10 text-success px-2.5 py-1 rounded-full font-medium">
                          Quoted: {formatPrice(commission.quotedPrice)}
                        </span>
                      )}
                      {commission.estimatedDelivery && (
                        <span className="bg-primary/10 text-primary-dark px-2.5 py-1 rounded-full">
                          Delivery: {commission.estimatedDelivery}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rejection reason */}
                  {commission.status === "rejected" && commission.rejectionReason && (
                    <div className="text-xs text-muted bg-error/5 dark:bg-error/10 border border-error/15 rounded-lg px-3 py-2">
                      <span className="font-medium text-error">Reason:</span>{" "}
                      {commission.rejectionReason}
                    </div>
                  )}

                  {/* Message thread link */}
                  {commission.messageThreadId && (
                    <button
                      onClick={() => router.push("/messages")}
                      className="cursor-pointer inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-xs font-medium border border-primary/25 text-primary-dark hover:bg-primary/10 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      View Messages
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password section */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-heading font-bold text-foreground">Change Password</h2>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="gallery-card p-6 max-w-md space-y-4"
          >
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={passwordErrors.currentPassword}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordErrors.newPassword}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={passwordErrors.confirmNewPassword}
              required
            />
            <Button type="submit" loading={passwordLoading}>
              <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
              Update Password
            </Button>
          </form>
        </div>
      </Container>

      {/* Cancel order dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCancelDialog}
            aria-hidden="true"
          />
          <div className="relative bg-surface border border-secondary-warm dark:border-secondary-deep rounded-gallery shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-1">
              Cancel Order
            </h3>
            <p className="text-sm text-muted mb-4">
              Please provide a reason for cancelling this order. This action cannot be undone.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                if (cancelReasonError) setCancelReasonError("");
              }}
              placeholder="Why are you cancelling this order? (min. 10 characters)"
              rows={4}
              className="w-full rounded-gallery border border-secondary-warm dark:border-secondary-warm/60 bg-surface dark:bg-secondary-warm text-foreground placeholder:text-muted/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <div className="flex items-center justify-between mt-1.5 mb-4">
              {cancelReasonError ? (
                <p className="text-xs text-error">{cancelReasonError}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${cancelReason.trim().length < 10 ? "text-muted" : "text-success"}`}>
                {cancelReason.trim().length}/10
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={!!cancellingId}
                className="cursor-pointer px-4 py-2 rounded-full text-sm font-medium border border-secondary-warm hover:bg-secondary/60 dark:hover:bg-secondary-warm transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!!cancellingId || cancelReason.trim().length < 10}
                className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-error text-white hover:bg-error/90 transition-colors disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
                {cancellingId ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
