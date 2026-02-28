/**
 * CommissionForm — Multi-field form for requesting custom art commissions.
 *
 * Fields: name, email, category, budget, description, reference images.
 * Uploads images to Firebase Storage, then submits data to /api/commission.
 */
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Upload, X, Send, ImagePlus } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/lib/firebase/client";
import { ART_CATEGORIES, BUDGET_RANGES } from "@/utils/constants";

export default function CommissionForm() {
  const { user, isAdmin, profile } = useAuth();
  const toast = useToast();
  const isAdminAsCustomer = profile?.role === "admin" && !isAdmin;

  // Dynamic config from Firestore (falls back to constants)
  const [categories, setCategories] = useState<string[]>([...ART_CATEGORIES.filter((c) => c !== "All")]);
  const [budgetRanges, setBudgetRanges] = useState<string[]>([...BUDGET_RANGES]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const snap = await getDoc(doc(db, "settings", "commissionConfig"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.categories?.length) setCategories(data.categories);
          if (data.budgetRanges?.length) setBudgetRanges(data.budgetRanges);
        }
      } catch {
        // Silently fall back to constants
      }
    }
    fetchConfig();
  }, []);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle file selection (max 3 images)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles = Array.from(selected);
    const total = files.length + newFiles.length;

    if (total > 3) {
      toast.error("Maximum 3 reference images allowed.");
      return;
    }

    // Validate file types and sizes (max 5MB each)
    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit.`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  // Remove a selected file
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form fields
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";
    if (!category) newErrors.category = "Please select a category";
    if (!budget) newErrors.budget = "Please select a budget range";
    if (!description.trim())
      newErrors.description = "Please describe your vision";
    if (description.trim().length < 20)
      newErrors.description = "Description must be at least 20 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isAdminAsCustomer) {
      toast.error("You're the artist! You can't commission yourself.");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      // Step 1: Upload reference images to Vercel Blob
      const imageUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', `commission-images/${user?.uid || "anonymous"}`);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const { url } = await response.json();
        imageUrls.push(url);
      }

      // Step 2: Submit commission data to our API
      const response = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "anonymous",
          name,
          email,
          category,
          budget,
          description,
          referenceImageUrls: imageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit commission");
      }

      // Success — reset form
      toast.success("Commission request submitted successfully!");
      setName("");
      setEmail("");
      setCategory("");
      setBudget("");
      setDescription("");
      setFiles([]);
      setErrors({});
    } catch (error) {
      console.error("Commission submission error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isAdmin && (
        <div className="rounded-gallery bg-accent/10 border border-accent/25 p-4 text-sm text-foreground">
          You are logged in as an admin. Commission submissions are disabled.
        </div>
      )}
      {/* Name and Email — side by side on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
      </div>

      {/* Category and Budget — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category select */}
        <div className="w-full">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-foreground mb-1.5 tracking-wide"
          >
            Art Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-gallery border border-primary/15 bg-secondary/50 text-foreground min-h-touch cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1.5 text-sm text-error" role="alert">
              {errors.category}
            </p>
          )}
        </div>

        {/* Budget select */}
        <div className="w-full">
          <label
            htmlFor="budget"
            className="block text-sm font-medium text-foreground mb-1.5 tracking-wide"
          >
            Budget Range
          </label>
          <select
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-3 rounded-gallery border border-primary/15 bg-secondary/50 text-foreground min-h-touch cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            required
          >
            <option value="">Select budget</option>
            {budgetRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          {errors.budget && (
            <p className="mt-1.5 text-sm text-error" role="alert">
              {errors.budget}
            </p>
          )}
        </div>
      </div>

      {/* Description textarea */}
      <div className="w-full">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground mb-1.5 tracking-wide"
        >
          Describe Your Vision
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about the artwork you'd like — style, colors, mood, subject, size preferences, and any other details..."
          rows={5}
          className="w-full px-4 py-3 rounded-gallery border border-primary/15 bg-secondary/50 text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white dark:focus:bg-secondary-deep transition-colors resize-y"
          required
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-error" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      {/* Reference image upload */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-1.5 tracking-wide">
          Reference Images (optional, max 3)
        </label>
        <div className="border-2 border-dashed border-primary/15 rounded-gallery p-6 text-center hover:border-primary transition-all">
          <ImagePlus
            className="w-10 h-10 text-muted/40 mx-auto mb-2"
            aria-hidden="true"
          />
          <p className="text-sm text-muted mb-3">
            Upload images for inspiration or reference
          </p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-full hover:bg-secondary-warm transition-all min-h-touch">
            <Upload className="w-4 h-4" aria-hidden="true" />
            Choose Files
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* File previews */}
        {files.length > 0 && (
          <div className="flex gap-3 mt-3 flex-wrap">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group w-20 h-20 rounded-gallery overflow-hidden border border-primary/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-0.5 right-0.5 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" loading={loading} disabled={isAdmin || isAdminAsCustomer} size="lg" className="w-full">
        <Send className="w-5 h-5 mr-2" aria-hidden="true" />
        {isAdmin ? "Admin Cannot Submit" : "Submit Commission Request"}
      </Button>
    </form>
  );
}
