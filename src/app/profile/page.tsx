/**
 * Profile Page — User account with order and commission history.
 *
 * Protected by AuthGuard — redirects to login if not authenticated.
 * Shows user info, recent orders, and commission requests.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Package, PenTool, User } from "lucide-react";
import Container from "@/components/layout/Container";
import AuthGuard from "@/components/auth/AuthGuard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { formatPrice } from "@/utils/formatPrice";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "@/lib/firebase/auth";
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="py-12 md:py-16">
      <Container>
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-dark" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-accent">
                {profile?.displayName || user?.displayName || "User"}
              </h1>
              <p className="text-muted">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="mt-4 sm:mt-0 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
            Sign Out
          </Button>
        </div>

        {/* Admin view-mode toggle */}
        {profile?.role === "admin" && (
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium text-yellow-800">Admin View Mode</p>
              <p className="text-sm text-yellow-700">
                {viewMode === "admin"
                  ? "You are viewing the site as an admin. Purchasing is disabled."
                  : "You are viewing the site as a customer. You can browse and purchase."}
              </p>
            </div>
            <button
              onClick={() => setViewMode(viewMode === "admin" ? "customer" : "admin")}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-300 bg-white text-yellow-800 font-medium hover:bg-yellow-100 transition-colors min-h-touch"
            >
              Switch to {viewMode === "admin" ? "Customer" : "Admin"} View
            </button>
          </div>
        )}

        {/* Orders section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold text-accent">My Orders</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted bg-secondary/50 rounded-xl p-6 text-center">
              No orders yet. Start browsing our gallery!
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-accent">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""} &middot;{" "}
                      {formatPrice(order.total)}
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
            <h2 className="text-xl font-bold text-accent">
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
            <p className="text-muted bg-secondary/50 rounded-xl p-6 text-center">
              No commission requests yet. Request a custom piece!
            </p>
          ) : (
            <div className="space-y-3">
              {commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-accent">
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
      </Container>
    </section>
  );
}
