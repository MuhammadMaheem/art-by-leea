/**
 * Admin Commissions Page — Lists all commission requests with status controls.
 *
 * Admin can review commission details and update their status. Status
 * changes trigger email notifications to the customer.
 */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  getAllCommissions,
  updateCommissionStatus,
} from "@/lib/firebase/firestore";
import { useToast } from "@/components/ui/Toast";
import Badge from "@/components/ui/Badge";
import { COMMISSION_STATUSES } from "@/utils/constants";
import type { Commission } from "@/types";

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchCommissions() {
      try {
        const data = await getAllCommissions();
        setCommissions(data);
      } catch (err) {
        console.error("Error fetching commissions:", err);
        showToast("Failed to load commissions.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Updates commission status and triggers email notification via API.
   */
  async function handleStatusChange(
    commissionId: string,
    newStatus: string,
    userEmail: string,
    userName: string
  ) {
    setUpdatingId(commissionId);
    try {
      await updateCommissionStatus(
        commissionId,
        newStatus as Commission["status"]
      );

      // Trigger email notification for status update
      try {
        await fetch("/api/commission/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commissionId,
            status: newStatus,
            userEmail,
            userName,
          }),
        });
      } catch {
        // Email failure shouldn't block status update
        console.warn("Failed to send status notification email.");
      }

      // Update local state
      setCommissions((prev) =>
        prev.map((c) =>
          c.id === commissionId
            ? { ...c, status: newStatus as Commission["status"] }
            : c
        )
      );

      showToast(`Commission status updated to "${newStatus}".`, "success");
    } catch (err) {
      console.error("Error updating commission status:", err);
      showToast("Failed to update commission status.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Commissions</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-secondary rounded-gallery animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-foreground">
        Commissions ({commissions.length})
      </h1>

      {commissions.length === 0 ? (
        <p className="text-muted">No commission requests yet.</p>
      ) : (
        <div className="space-y-4">
          {commissions.map((commission) => (
            <div
              key={commission.id}
              className="gallery-card p-5"
            >
              {/* Commission header */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{commission.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {commission.email} &middot;{" "}
                    {commission.createdAt
                      ? new Date(
                          typeof commission.createdAt === "string"
                            ? commission.createdAt
                            : commission.createdAt.seconds * 1000
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge status={commission.status} />
                  <p className="font-semibold text-accent">
                    {commission.budget}
                  </p>
                </div>
              </div>

              {/* Commission details */}
              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-secondary dark:bg-secondary-warm px-2.5 py-1 rounded-full text-muted">
                    {commission.category}
                  </span>
                </div>

                <p className="text-sm text-muted leading-relaxed">
                  {commission.description}
                </p>

                {/* Reference images */}
                {commission.referenceImageUrls &&
                  commission.referenceImageUrls.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {commission.referenceImageUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-gallery overflow-hidden border border-secondary-warm"
                        >
                          <Image
                            src={url}
                            alt={`Reference ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Status controls */}
              <div className="flex items-center gap-3 pt-3 border-t border-secondary-warm">
                <label
                  htmlFor={`commission-status-${commission.id}`}
                  className="text-xs font-medium text-muted"
                >
                  Update status:
                </label>
                <select
                  id={`commission-status-${commission.id}`}
                  value={commission.status}
                  onChange={(e) =>
                    handleStatusChange(
                      commission.id!,
                      e.target.value,
                      commission.email,
                      commission.name
                    )
                  }
                  disabled={updatingId === commission.id}
                  className="text-sm border border-primary/15 dark:border-secondary-warm/60 rounded-gallery px-3 py-1.5 bg-secondary/50 dark:bg-secondary-warm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-touch cursor-pointer disabled:opacity-50"
                >
                  {COMMISSION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
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
