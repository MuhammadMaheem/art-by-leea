"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Pencil, Archive } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/utils/formatPrice";
import { auth } from "@/lib/firebase/client";
import { cn } from "@/utils/cn";
import ArtworkForm from "@/components/admin/ArtworkForm";
import type { Artwork } from "@/types";

type ViewMode = "artworks" | "add" | "edit";

export default function AdminArtworksPage() {
  const toast = useToast();
  const [view, setView] = useState<ViewMode>("artworks");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<string | null>(null);

  const fetchArtworks = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/artworks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setArtworks(
          (data.artworks || []).filter((a: Artwork) => !a.archived)
        );
      }
    } catch {
      toast.error("Failed to load artworks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleArchive = async (artwork: Artwork) => {
    if (!window.confirm(`Archive "${artwork.title}"? It will be hidden from the shop.`)) return;

    setArchiving(artwork.id);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/artworks/${artwork.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ archived: true, inStock: false }),
      });

      if (res.ok) {
        setArtworks((prev) => prev.filter((a) => a.id !== artwork.id));
        toast.success(`"${artwork.title}" archived.`);
      } else {
        toast.error("Failed to archive artwork.");
      }
    } catch {
      toast.error("Failed to archive artwork.");
    } finally {
      setArchiving(null);
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setView("edit");
  };

  const handleSuccess = () => {
    setView("artworks");
    setSelectedArtwork(null);
    setLoading(true);
    fetchArtworks();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-accent mb-6">Artworks</h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => { setView("artworks"); setSelectedArtwork(null); }}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px",
            view === "artworks"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-accent"
          )}
        >
          All Artworks
        </button>
        <button
          onClick={() => { setView("add"); setSelectedArtwork(null); }}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5",
            view === "add"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-accent"
          )}
        >
          <Plus className="w-4 h-4" />
          Add New Artwork
        </button>
      </div>

      {/* Views */}
      {view === "add" && <ArtworkForm onSuccess={handleSuccess} />}

      {view === "edit" && selectedArtwork && (
        <ArtworkForm artwork={selectedArtwork} onSuccess={handleSuccess} />
      )}

      {view === "artworks" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-12 bg-secondary/50 rounded-xl">
              <p className="text-muted">No artworks yet. Add your first artwork!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-3 px-2 font-medium text-muted w-12"></th>
                    <th className="py-3 px-2 font-medium text-muted">Title</th>
                    <th className="py-3 px-2 font-medium text-muted hidden sm:table-cell">Category</th>
                    <th className="py-3 px-2 font-medium text-muted">Price</th>
                    <th className="py-3 px-2 font-medium text-muted hidden md:table-cell">Stock</th>
                    <th className="py-3 px-2 font-medium text-muted hidden md:table-cell">Featured</th>
                    <th className="py-3 px-2 font-medium text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.map((artwork) => (
                    <tr key={artwork.id} className="border-b border-gray-100 hover:bg-secondary/30">
                      <td className="py-2 px-2">
                        <div className="w-10 h-10 relative rounded overflow-hidden bg-secondary">
                          <Image
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-2 font-medium text-accent max-w-[200px] truncate">
                        {artwork.title}
                      </td>
                      <td className="py-2 px-2 text-muted hidden sm:table-cell">{artwork.category}</td>
                      <td className="py-2 px-2 text-accent">{formatPrice(artwork.price)}</td>
                      <td className="py-2 px-2 hidden md:table-cell">
                        <Badge status={artwork.inStock ? "paid" : "cancelled"} className="text-xs">
                          {artwork.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 hidden md:table-cell">
                        {artwork.isFeatured && (
                          <Badge status="in-progress" className="text-xs">Featured</Badge>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(artwork)}
                            className="p-1.5 rounded hover:bg-secondary transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-muted" />
                          </button>
                          <button
                            onClick={() => handleArchive(artwork)}
                            disabled={archiving === artwork.id}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Archive"
                          >
                            {archiving === artwork.id ? (
                              <Loader2 className="w-4 h-4 text-muted animate-spin" />
                            ) : (
                              <Archive className="w-4 h-4 text-red-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
