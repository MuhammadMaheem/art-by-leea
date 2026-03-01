/**
 * Admin Commissions Page — Lists all commission requests with full management.
 *
 * Admin can review details, update status, set quoted price & delivery,
 * add notes, reject with reason, and message the customer directly.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getAllCommissions,
  updateCommissionStatus,
} from "@/lib/firebase/firestore";
import { useToast } from "@/components/ui/Toast";
import Badge from "@/components/ui/Badge";
import { COMMISSION_STATUSES } from "@/utils/constants";
import { auth } from "@/lib/firebase/client";
import { MessageCircle, ChevronDown, ChevronUp, Save } from "lucide-react";
import type { Commission } from "@/types";

export default function AdminCommissionsPage() {
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Editable fields per commission (keyed by commission id)
  const [editState, setEditState] = useState<
    Record<
      string,
      {
        adminNotes: string;
        quotedPrice: string;
        estimatedDelivery: string;
        rejectionReason: string;
      }
    >
  >({});

  useEffect(() => {
    async function fetchCommissions() {
      try {
        const data = await getAllCommissions();
        setCommissions(data);
        // Initialize edit state from fetched data
        const initial: typeof editState = {};
        for (const c of data) {
          initial[c.id] = {
            adminNotes: c.adminNotes || "",
            quotedPrice: c.quotedPrice ? String(c.quotedPrice) : "",
            estimatedDelivery: c.estimatedDelivery || "",
            rejectionReason: c.rejectionReason || "",
          };
        }
        setEditState(initial);
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

  function getEdit(id: string) {
    return (
      editState[id] || {
        adminNotes: "",
        quotedPrice: "",
        estimatedDelivery: "",
        rejectionReason: "",
      }
    );
  }

  function setEdit(id: string, patch: Partial<(typeof editState)[string]>) {
    setEditState((prev) => ({
      ...prev,
      [id]: { ...getEdit(id), ...patch },
    }));
  }

  /**
   * Saves admin notes, quoted price, estimated delivery, and rejection reason.
   */
  async function handleSaveDetails(commission: Commission) {
    const edit = getEdit(commission.id);
    setUpdatingId(commission.id);
    try {
      const extras: Parameters<typeof updateCommissionStatus>[2] = {
        adminNotes: edit.adminNotes,
      };
      const price = parseFloat(edit.quotedPrice);
      if (!isNaN(price) && price > 0) extras.quotedPrice = price;
      if (edit.estimatedDelivery) extras.estimatedDelivery = edit.estimatedDelivery;
      if (commission.status === "rejected" && edit.rejectionReason)
        extras.rejectionReason = edit.rejectionReason;

      await updateCommissionStatus(commission.id, commission.status, extras);

      setCommissions((prev) =>
        prev.map((c) =>
          c.id === commission.id
            ? {
                ...c,
                adminNotes: edit.adminNotes,
                quotedPrice: !isNaN(price) && price > 0 ? price : c.quotedPrice,
                estimatedDelivery: edit.estimatedDelivery || c.estimatedDelivery,
                rejectionReason: edit.rejectionReason || c.rejectionReason,
              }
            : c
        )
      );

      showToast("Commission details saved.", "success");
    } catch (err) {
      console.error("Error saving commission details:", err);
      showToast("Failed to save details.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  /**
   * Updates commission status and triggers email notification via API.
   */
  async function handleStatusChange(
    commissionId: string,
    newStatus: string,
    userEmail: string,
    userName: string
  ) {
    const edit = getEdit(commissionId);

    // Require rejection reason for "rejected" status
    if (newStatus === "rejected" && !edit.rejectionReason.trim()) {
      setExpandedId(commissionId);
      showToast("Please add a rejection reason before rejecting.", "error");
      return;
    }

    setUpdatingId(commissionId);
    try {
      const extras: Parameters<typeof updateCommissionStatus>[2] = {};
      if (newStatus === "rejected") extras.rejectionReason = edit.rejectionReason;

      const price = parseFloat(edit.quotedPrice);
      if (newStatus === "quoted" && !isNaN(price) && price > 0) {
        extras.quotedPrice = price;
        if (edit.estimatedDelivery) extras.estimatedDelivery = edit.estimatedDelivery;
      }

      await updateCommissionStatus(
        commissionId,
        newStatus as Commission["status"],
        Object.keys(extras).length > 0 ? extras : undefined
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
            quotedPrice: newStatus === "quoted" && !isNaN(price) ? price : undefined,
            estimatedDelivery: newStatus === "quoted" ? edit.estimatedDelivery : undefined,
            rejectionReason: newStatus === "rejected" ? edit.rejectionReason : undefined,
          }),
        });
      } catch {
        console.warn("Failed to send status notification email.");
      }

      // Update local state
      setCommissions((prev) =>
        prev.map((c) =>
          c.id === commissionId
            ? {
                ...c,
                status: newStatus as Commission["status"],
                ...(newStatus === "rejected" ? { rejectionReason: edit.rejectionReason } : {}),
                ...(newStatus === "quoted" && !isNaN(price) ? { quotedPrice: price } : {}),
                ...(newStatus === "quoted" && edit.estimatedDelivery ? { estimatedDelivery: edit.estimatedDelivery } : {}),
              }
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

  /**
   * Opens or creates a message thread linked to this commission.
   */
  async function handleMessageCustomer(commission: Commission) {
    // If thread already exists, navigate to it
    if (commission.messageThreadId) {
      router.push(`/admin/messages?thread=${commission.messageThreadId}`);
      return;
    }

    setMessagingId(commission.id);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        showToast("Authentication required.", "error");
        return;
      }

      // Create a new thread via the messages API
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: `Hi ${commission.name}, I'd like to discuss your ${commission.category} commission request (#${commission.id.slice(0, 8)}). Let me know your thoughts!`,
          commissionId: commission.id,
          customerId: commission.userId,
          customerName: commission.name,
          customerEmail: commission.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to create message thread.", "error");
        return;
      }

      const threadId = data.threadId;

      // Save the thread ID on the commission
      await updateCommissionStatus(commission.id, commission.status, {
        messageThreadId: threadId,
      });

      setCommissions((prev) =>
        prev.map((c) =>
          c.id === commission.id ? { ...c, messageThreadId: threadId } : c
        )
      );

      router.push(`/admin/messages?thread=${threadId}`);
    } catch (err) {
      console.error("Error creating message thread:", err);
      showToast("Failed to start conversation.", "error");
    } finally {
      setMessagingId(null);
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
          {commissions.map((commission) => {
            const isExpanded = expandedId === commission.id;
            const edit = getEdit(commission.id);

            return (
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
                    {commission.quotedPrice && (
                      <span className="bg-success/10 text-success px-2.5 py-1 rounded-full font-medium">
                        Quoted: Rs. {commission.quotedPrice.toLocaleString()}
                      </span>
                    )}
                    {commission.estimatedDelivery && (
                      <span className="bg-primary/10 text-primary-dark px-2.5 py-1 rounded-full">
                        Delivery: {commission.estimatedDelivery}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted leading-relaxed">
                    {commission.description}
                  </p>

                  {/* Rejection reason display */}
                  {commission.status === "rejected" && commission.rejectionReason && (
                    <div className="text-xs text-muted bg-error/5 dark:bg-error/10 border border-error/15 rounded-lg px-3 py-2">
                      <span className="font-medium text-error">Rejection reason:</span>{" "}
                      {commission.rejectionReason}
                    </div>
                  )}

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

                {/* Action bar: Status + Message + Expand */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-secondary-warm">
                  <label
                    htmlFor={`commission-status-${commission.id}`}
                    className="text-xs font-medium text-muted"
                  >
                    Status:
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
                          .split(/[-_]/)
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleMessageCustomer(commission)}
                    disabled={messagingId === commission.id}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-primary/25 text-primary-dark hover:bg-primary/10 transition-colors disabled:opacity-60"
                  >
                    <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    {messagingId === commission.id
                      ? "Opening…"
                      : commission.messageThreadId
                        ? "View Messages"
                        : "Message Customer"}
                  </button>

                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : commission.id)
                    }
                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-secondary-warm text-muted hover:bg-secondary/60 dark:hover:bg-secondary-warm transition-colors ml-auto"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        Details
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded details panel */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-secondary-warm/50 space-y-4">
                    {/* Admin Notes */}
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">
                        Admin Notes (internal)
                      </label>
                      <textarea
                        value={edit.adminNotes}
                        onChange={(e) =>
                          setEdit(commission.id, { adminNotes: e.target.value })
                        }
                        rows={3}
                        placeholder="Internal notes about this commission…"
                        className="w-full rounded-gallery border border-secondary-warm dark:border-secondary-warm/60 bg-surface dark:bg-secondary-warm text-foreground placeholder:text-muted/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Quoted Price */}
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                          Quoted Price (Rs.)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={edit.quotedPrice}
                          onChange={(e) =>
                            setEdit(commission.id, {
                              quotedPrice: e.target.value,
                            })
                          }
                          placeholder="e.g. 25000"
                          className="w-full px-3 py-2 rounded-gallery border border-primary/15 dark:border-secondary-warm/60 bg-secondary/50 dark:bg-secondary-warm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white dark:focus:bg-secondary-deep transition-colors"
                        />
                      </div>

                      {/* Estimated Delivery */}
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                          Estimated Delivery
                        </label>
                        <input
                          type="text"
                          value={edit.estimatedDelivery}
                          onChange={(e) =>
                            setEdit(commission.id, {
                              estimatedDelivery: e.target.value,
                            })
                          }
                          placeholder="e.g. 2-3 weeks, March 15"
                          className="w-full px-3 py-2 rounded-gallery border border-primary/15 dark:border-secondary-warm/60 bg-secondary/50 dark:bg-secondary-warm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white dark:focus:bg-secondary-deep transition-colors"
                        />
                      </div>
                    </div>

                    {/* Rejection Reason (always visible so admin can fill before rejecting) */}
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">
                        Rejection Reason {commission.status !== "rejected" && <span className="text-muted/50">(fill before setting status to Rejected)</span>}
                      </label>
                      <textarea
                        value={edit.rejectionReason}
                        onChange={(e) =>
                          setEdit(commission.id, {
                            rejectionReason: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="Reason for declining this commission…"
                        className="w-full rounded-gallery border border-error/20 dark:border-error/30 bg-surface dark:bg-secondary-warm text-foreground placeholder:text-muted/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-error/40 resize-none"
                      />
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => handleSaveDetails(commission)}
                      disabled={updatingId === commission.id}
                      className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" aria-hidden="true" />
                      {updatingId === commission.id ? "Saving…" : "Save Details"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
