/**
 * Admin Layout — Wraps all admin pages with AuthGuard + sidebar navigation.
 *
 * Only users with role === "admin" in their Firestore profile can access
 * these pages. Non-admin users see a 403 page. Non-authenticated users
 * are redirected to /auth/login.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PenTool, Palette, Settings, Tag, MessageCircle, ChevronDown } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import Container from "@/components/layout/Container";
import { cn } from "@/utils/cn";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/commissions", label: "Commissions", icon: PenTool },
  { href: "/admin/artworks", label: "Artworks", icon: Palette },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
  { href: "/admin/messages", label: "Messages", icon: MessageCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAdmin>
      <section className="py-10 md:py-14">
        <Container>
          <div className="flex flex-col md:flex-row gap-10">
            {/* Sidebar navigation */}
            <AdminSidebar />

            {/* Main content area */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </Container>
      </section>
    </AuthGuard>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Resolve which link is currently active (exact match first, then prefix for sub-routes)
  const currentLink =
    adminLinks.find((l) => pathname === l.href) ||
    adminLinks.find((l) => l.href !== "/admin" && pathname.startsWith(l.href)) ||
    adminLinks[0];
  const CurrentIcon = currentLink.icon;

  return (
    <nav className="md:w-56 shrink-0" aria-label="Admin navigation">
      <h2 className="text-lg font-heading font-bold text-foreground mb-4">Admin Panel</h2>

      {/* ── Mobile: collapsible dropdown ── */}
      <div className="md:hidden">
        {/* Collapsed trigger — shows current page */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 gallery-card cursor-pointer"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-nav"
        >
          <div className="flex items-center gap-2.5">
            <CurrentIcon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">{currentLink.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Menu</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted transition-transform duration-200",
                mobileOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </div>
        </button>

        {/* Expanded grid of nav items */}
        {mobileOpen && (
          <div
            id="admin-mobile-nav"
            className="mt-2 gallery-card p-3 grid grid-cols-2 gap-2"
          >
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer min-h-touch",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:bg-primary-light/15 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Desktop: vertical pill list (unchanged) ── */}
      <ul className="hidden md:flex md:flex-col gap-1.5">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-touch cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-primary-light/15 hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
