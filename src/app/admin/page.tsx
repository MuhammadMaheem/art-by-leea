/**
 * Admin Dashboard Overview — Displays summary metrics.
 *
 * Shows cards for total orders, total commissions, pending items, and
 * estimated revenue. Data is fetched from Firestore on mount.
 */
"use client";

import { useEffect, useState } from "react";
import { Package, PenTool, Clock, DollarSign } from "lucide-react";
import { getAllOrders, getAllCommissions } from "@/lib/firebase/firestore";
import type { Order, Commission } from "@/types";

interface DashboardMetrics {
  totalOrders: number;
  totalCommissions: number;
  pendingOrders: number;
  pendingCommissions: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Fetch all orders and commissions in parallel
        const [orders, commissions] = await Promise.all([
          getAllOrders(),
          getAllCommissions(),
        ]);

        // Calculate summary metrics
        const pendingOrders = orders.filter(
          (o: Order) => o.status === "pending" || o.status === "paid"
        ).length;
        const pendingCommissions = commissions.filter(
          (c: Commission) =>
            c.status === "pending" || c.status === "in-progress"
        ).length;
        const revenue = orders
          .filter((o: Order) => o.status !== "cancelled")
          .reduce((sum: number, o: Order) => sum + o.total, 0);

        setMetrics({
          totalOrders: orders.length,
          totalCommissions: commissions.length,
          pendingOrders,
          pendingCommissions,
          revenue,
        });
      } catch (err) {
        console.error("Error fetching admin metrics:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-accent">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-secondary rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-accent">Dashboard</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Orders",
      value: metrics?.totalOrders ?? 0,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Total Commissions",
      value: metrics?.totalCommissions ?? 0,
      icon: PenTool,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Pending Items",
      value: (metrics?.pendingOrders ?? 0) + (metrics?.pendingCommissions ?? 0),
      icon: Clock,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Revenue",
      value: `Rs. ${(metrics?.revenue ?? 0).toFixed(0)}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-accent">Dashboard</h1>

      {/* Summary metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-surface border border-secondary rounded-xl p-5 flex items-start gap-4"
            >
              <div
                className={`p-2.5 rounded-lg ${card.color}`}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted">{card.label}</p>
                <p className="text-2xl font-bold text-accent mt-1">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick help text */}
      <div className="bg-primary-light/20 border border-primary/30 rounded-xl p-5">
        <h2 className="font-semibold text-accent mb-2">Quick Actions</h2>
        <p className="text-sm text-muted">
          Use the sidebar to navigate to <strong>Orders</strong> to update order
          statuses and track shipments, or <strong>Commissions</strong> to
          review incoming commission requests and update their progress.
        </p>
      </div>
    </div>
  );
}
