/**
 * Profile Page — User account with order and commission history.
 *
 * Protected by AuthGuard — redirects to login if not authenticated.
 * Shows user info, recent orders, and commission requests.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Package, PenTool, User, Lock } from "lucide-react";
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
            <div className="w-18 h-18 bg-primary-light/40 rounded-full flex items-center justify-center ring-2 ring-primary/20">
              <User className="w-9 h-9 text-primary" aria-hidden="true" />
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
          <div className="mb-8 rounded-gallery border border-accent/30 bg-accent/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 rounded-full border border-accent/30 bg-surface text-foreground font-medium hover:bg-accent/10 transition-colors min-h-touch"
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
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="gallery-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
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
                  <Badge status={order.status} />
                </div>
              ))}
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
                  className="gallery-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
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
    </section>
  );
}
