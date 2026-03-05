/**
 * Admin Promo Codes Page — Manage promotional discount codes.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/providers/AuthProvider";
import { auth } from "@/lib/firebase/client";
import type { PromoCode } from "@/types";

export default function AdminPromoCodesPage() {
  return (
    <AuthGuard requireAdmin>
      <PromoCodesContent />
    </AuthGuard>
  );
}

function PromoCodesContent() {
  const { user } = useAuth();
  const toast = useToast();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const getToken = async () => {
    const token = await auth.currentUser?.getIdToken();
    return token || "";
  };

  const fetchCodes = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/promo-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (error) {
      console.error("Failed to fetch promo codes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchCodes();
  }, [user, fetchCodes]);

  const handleCreate = async () => {
    if (!code.trim() || !discountPercent) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code.trim(),
          discountPercent: Number(discountPercent),
          maxUses: maxUses ? Number(maxUses) : 0,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Promo code "${data.code}" created!`);
      setCode("");
      setDiscountPercent("");
      setMaxUses("");
      setExpiresAt("");
      setShowForm(false);
      fetchCodes();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create code.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promo: PromoCode) => {
    try {
      const token = await getToken();
      await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      fetchCodes();
    } catch {
      toast.error("Failed to update promo code.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      await fetch(`/api/admin/promo-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Promo code deleted.");
      fetchCodes();
    } catch {
      toast.error("Failed to delete promo code.");
    }
  };

  return (
    <Container>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">Promo Codes</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          {showForm ? "Cancel" : "New Code"}
        </Button>
      </div>

      {showForm && (
        <div className="gallery-card p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Code"
              placeholder="SUMMER25"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <Input
              label="Discount %"
              type="number"
              placeholder="25"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
            <Input
              label="Max Uses (0 = unlimited)"
              type="number"
              placeholder="100"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
            <Input
              label="Expires At (optional)"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} loading={saving} disabled={!code.trim() || !discountPercent}>
            Create Promo Code
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-secondary rounded-gallery animate-pulse" />
          ))}
        </div>
      ) : codes.length === 0 ? (
        <p className="text-muted">No promo codes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Promo codes">
            <thead>
              <tr className="border-b border-secondary-warm">
                <th scope="col" className="pb-3 text-sm font-semibold text-muted">Code</th>
                <th scope="col" className="pb-3 text-sm font-semibold text-muted">Discount</th>
                <th scope="col" className="pb-3 text-sm font-semibold text-muted">Uses</th>
                <th scope="col" className="pb-3 text-sm font-semibold text-muted">Status</th>
                <th scope="col" className="pb-3 text-sm font-semibold text-muted">Expires</th>
                <th scope="col" className="pb-3 text-sm font-semibold text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((promo) => (
                <tr key={promo.id} className="border-b border-secondary/60">
                  <td className="py-3 font-mono font-semibold text-foreground">{promo.code}</td>
                  <td className="py-3 text-foreground">{promo.discountPercent}%</td>
                  <td className="py-3 text-muted">
                    {promo.currentUses}{promo.maxUses > 0 ? ` / ${promo.maxUses}` : " / ∞"}
                  </td>
                  <td className="py-3">
                    <Badge status={promo.isActive ? "paid" : "cancelled"}>
                      {promo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted text-sm">
                    {promo.expiresAt
                      ? new Date(
                          typeof promo.expiresAt === "string"
                            ? promo.expiresAt
                            : promo.expiresAt.toDate()
                        ).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="py-3 text-right">
                    {deleteTargetId === promo.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted">Delete?</span>
                        <button
                          onClick={() => { handleDelete(promo.id); setDeleteTargetId(null); }}
                          className="px-3 py-1.5 rounded-full bg-error text-white text-xs font-semibold hover:bg-error/90 transition-colors min-h-touch min-w-touch flex items-center justify-center cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(null)}
                          className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-semibold hover:bg-secondary-warm transition-colors min-h-touch min-w-touch flex items-center justify-center cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(promo)}
                        className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer min-h-touch min-w-touch flex items-center justify-center"
                        aria-label={promo.isActive ? "Deactivate" : "Activate"}
                      >
                        {promo.isActive ? (
                          <ToggleRight className="w-5 h-5 text-success" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(promo.id)}
                        className="p-2 rounded-full hover:bg-error/10 text-error transition-colors cursor-pointer min-h-touch min-w-touch flex items-center justify-center"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
