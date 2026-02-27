/**
 * Admin Layout — Wraps all admin pages with AuthGuard + sidebar navigation.
 *
 * Only users with role === "admin" in their Firestore profile can access
 * these pages. Non-admin users see a 403 page. Non-authenticated users
 * are redirected to /auth/login.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PenTool, Palette, Settings, Tag, MessageCircle } from "lucide-react";
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
      <section className="py-8 md:py-12">
        <Container>
          <div className="flex flex-col md:flex-row gap-8">
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

  return (
    <nav
      className="md:w-56 shrink-0"
      aria-label="Admin navigation"
    >
      <h2 className="text-lg font-bold text-accent mb-4">Admin Panel</h2>
      <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-touch cursor-pointer",
                  isActive
                    ? "bg-primary text-accent"
                    : "text-muted hover:bg-secondary hover:text-accent"
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
