"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { auth } from "@/lib/firebase/client";
import { ART_CATEGORIES, BUDGET_RANGES } from "@/utils/constants";

const DEFAULT_CATEGORIES = ART_CATEGORIES.filter((c) => c !== "All") as unknown as string[];
const DEFAULT_BUDGET_RANGES = [...BUDGET_RANGES] as unknown as string[];

export default function AdminSettingsPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [budgetRanges, setBudgetRanges] = useState<string[]>([]);
  const [easypaisaNumber, setEasypaisaNumber] = useState("03404677899");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dupError, setDupError] = useState<{ section: string; index: number } | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.config) {
          setCategories(data.config.categories?.length ? data.config.categories : DEFAULT_CATEGORIES);
          setBudgetRanges(data.config.budgetRanges?.length ? data.config.budgetRanges : DEFAULT_BUDGET_RANGES);
          setEasypaisaNumber(data.config.easypaisaNumber || "03404677899");
        } else {
          // No config saved yet — use defaults
          setCategories(DEFAULT_CATEGORIES);
          setBudgetRanges(DEFAULT_BUDGET_RANGES);
        }
      } catch {
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkDuplicate = (arr: string[], value: string, index: number, section: string): boolean => {
    const trimmed = value.trim().toLowerCase();
    const hasDup = arr.some(
      (item, i) => i !== index && item.trim().toLowerCase() === trimmed && trimmed !== ""
    );
    if (hasDup) {
      setDupError({ section, index });
      return true;
    }
    if (dupError?.section === section && dupError?.index === index) {
      setDupError(null);
    }
    return false;
  };

  const handleSave = async () => {
    const cleanCats = categories.map((c) => c.trim()).filter(Boolean);
    const cleanRanges = budgetRanges.map((r) => r.trim()).filter(Boolean);

    if (cleanCats.length === 0 || cleanRanges.length === 0) {
      toast.error("Both sections need at least one item.");
      return;
    }

    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categories: cleanCats, budgetRanges: cleanRanges, easypaisaNumber }),
      });

      if (res.ok) {
        setCategories(cleanCats);
        setBudgetRanges(cleanRanges);
        toast.success("Commission form updated. Changes are live immediately.");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Commission Form Settings</h1>

      {/* Easypaisa Number */}
      <div className="mb-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-3">Easypaisa Payment Number</h3>
        <p className="text-sm text-muted mb-2">
          Customers will send payments to this number during checkout.
        </p>
        <input
          type="text"
          value={easypaisaNumber}
          onChange={(e) => setEasypaisaNumber(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded-gallery border border-primary/15 dark:border-secondary-warm/60 bg-secondary/50 dark:bg-secondary-warm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white dark:focus:bg-secondary-deep transition-colors"
          placeholder="03XXXXXXXXX"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground mb-3">Art Categories</h3>
          <div className="space-y-2">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={cat}
                  onChange={(e) => {
                    const updated = [...categories];
                    updated[i] = e.target.value;
                    setCategories(updated);
                    checkDuplicate(updated, e.target.value, i, "categories");
                  }}
                  className="flex-1 px-3 py-2 rounded-gallery border border-primary/15 dark:border-secondary-warm/60 bg-secondary/50 dark:bg-secondary-warm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white dark:focus:bg-secondary-deep transition-colors"
                  placeholder="Category name"
                />
                <button
                  onClick={() => {
                    setCategories(categories.filter((_, idx) => idx !== i));
                    setDupError(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-error/10 transition-colors cursor-pointer"
                  aria-label={`Remove category ${cat}`}
                >
                  <X className="w-4 h-4 text-error" />
                </button>
                {dupError?.section === "categories" && dupError.index === i && (
                  <span className="text-xs text-error">Duplicate</span>
                )}
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategories([...categories, ""])}
            className="mt-3"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </Button>
        </div>

        {/* Budget Ranges */}
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground mb-3">Budget Ranges</h3>
          <div className="space-y-2">
            {budgetRanges.map((range, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={range}
                  onChange={(e) => {
                    const updated = [...budgetRanges];
                    updated[i] = e.target.value;
                    setBudgetRanges(updated);
                    checkDuplicate(updated, e.target.value, i, "budgetRanges");
                  }}
                  className="flex-1 px-3 py-2 rounded-gallery border border-primary/15 dark:border-secondary-warm/60 bg-secondary/50 dark:bg-secondary-warm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white dark:focus:bg-secondary-deep transition-colors"
                  placeholder="Budget range"
                />
                <button
                  onClick={() => {
                    setBudgetRanges(budgetRanges.filter((_, idx) => idx !== i));
                    setDupError(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-error/10 transition-colors cursor-pointer"
                  aria-label={`Remove budget range ${range}`}
                >
                  <X className="w-4 h-4 text-error" />
                </button>
                {dupError?.section === "budgetRanges" && dupError.index === i && (
                  <span className="text-xs text-error">Duplicate</span>
                )}
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBudgetRanges([...budgetRanges, ""])}
            className="mt-3"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Budget Range
          </Button>
        </div>
      </div>

      <Button onClick={handleSave} loading={saving} size="lg">
        Save Settings
      </Button>
    </div>
  );
}
