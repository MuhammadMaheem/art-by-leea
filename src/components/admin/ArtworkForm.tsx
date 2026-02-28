"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import imageCompression from 'browser-image-compression';
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { auth } from "@/lib/firebase/client";
import { ART_CATEGORIES } from "@/utils/constants";
import { cn } from "@/utils/cn";
import type { Artwork } from "@/types";

interface ArtworkFormProps {
  artwork?: Artwork;
  onSuccess: () => void;
}

export default function ArtworkForm({ artwork, onSuccess }: ArtworkFormProps) {
  const toast = useToast();
  const isEdit = Boolean(artwork);

  const [title, setTitle] = useState(artwork?.title || "");
  const [description, setDescription] = useState(artwork?.description || "");
  const [price, setPrice] = useState(artwork?.price?.toString() || "");
  const [category, setCategory] = useState(artwork?.category || "");
  const [medium, setMedium] = useState(artwork?.medium || "");
  const [dimensions, setDimensions] = useState(artwork?.dimensions || "");
  const [isFeatured, setIsFeatured] = useState(artwork?.isFeatured || false);
  const [inStock, setInStock] = useState(artwork?.inStock !== false);
  const [imageUrl, setImageUrl] = useState(artwork?.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1, // Max 1MB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        onProgress: (p) => setProgress(Math.round(p)),
      });

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', 'artwork-images');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();
      setImageUrl(url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price || !category || !imageUrl) {
      toast.error("Please fill in all required fields and upload an image.");
      return;
    }

    if (Number(price) < 1) {
      toast.error("Price must be at least Rs. 1.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error("Authentication required.");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        medium: medium.trim(),
        dimensions: dimensions.trim(),
        isFeatured,
        inStock,
        imageUrl,
      };

      const url = isEdit ? `/api/artworks/${artwork!.id}` : "/api/artworks";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save artwork");

      toast.success(isEdit ? "Artwork updated!" : "Artwork created!");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save artwork.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ART_CATEGORIES.filter((c) => c !== "All");

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-heading font-bold text-foreground">
        {isEdit ? "Edit Artwork" : "Add New Artwork"}
      </h2>

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Artwork title"
        required
      />

      <div className="w-full">
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the artwork..."
          rows={4}
          className="w-full px-4 py-3 rounded-gallery border border-primary/15 bg-secondary/50 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Price (PKR)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          min={1}
          step="0.01"
          required
        />

        <div className="w-full">
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-gallery border border-primary/15 bg-secondary/50 text-foreground min-h-touch cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Medium"
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
          placeholder="e.g. Oil on canvas"
        />
        <Input
          label="Dimensions"
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
          placeholder="e.g. 24 × 36 inches"
        />
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={() => setIsFeatured(!isFeatured)}
            className="sr-only peer"
          />
          <span className={cn(
            "relative w-12 h-6 rounded-full transition-colors duration-200",
            isFeatured ? "bg-primary" : "bg-secondary-warm"
          )}>
            <span className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
              isFeatured ? "translate-x-7" : "translate-x-1"
            )} />
          </span>
          <span className="text-sm font-medium text-foreground">Show on homepage</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => setInStock(!inStock)}
            className="sr-only peer"
          />
          <span className={cn(
            "relative w-12 h-6 rounded-full transition-colors duration-200",
            inStock ? "bg-primary" : "bg-secondary-warm"
          )}>
            <span className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
              inStock ? "translate-x-7" : "translate-x-1"
            )} />
          </span>
          <span className="text-sm font-medium text-foreground">Available for purchase</span>
        </label>
      </div>

      {/* Image upload */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Artwork Image {!isEdit && <span className="text-error">*</span>}
        </label>

        {imageUrl && (
          <div className="relative w-40 h-40 rounded-gallery overflow-hidden border border-secondary-warm mb-3">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="160px" />
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className={cn(
            "cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full transition-colors min-h-touch",
            uploading
              ? "bg-secondary-warm text-muted cursor-wait"
              : "bg-secondary text-foreground hover:bg-secondary-warm"
          )}>
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {progress > 0 && `${progress}%`}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {imageUrl ? "Change Image" : "Upload Image"}
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <Button type="submit" loading={submitting} disabled={uploading} size="lg" className="w-full sm:w-auto">
        {isEdit ? "Save Changes" : "Create Artwork"}
      </Button>
    </form>
  );
}
