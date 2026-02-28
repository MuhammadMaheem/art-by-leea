/**
 * Navbar — Responsive navigation header.
 *
 * Desktop: Full horizontal nav bar with links and auth buttons.
 * Mobile: Collapses to logo + cart icon + hamburger menu button.
 *
 * The cart badge shows the total number of items from the Zustand store.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, User, LogIn, MessageCircle, Bell } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { NAV_LINKS, SITE_NAME } from "@/utils/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useCartStore } from "@/stores/cartStore";
import { useNotifications } from "@/hooks/useNotifications";
import { db } from "@/lib/firebase/client";
import Container from "./Container";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, viewMode, profile } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems);
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Subscribe to unread message count
  useEffect(() => {
    if (!user || !profile) return;

    if (profile.role === "admin") {
      // Admin: sum unreadByAdmin across all threads
      const q = query(collection(db, "messages"));
      const unsub = onSnapshot(q, (snap) => {
        let total = 0;
        snap.docs.forEach((d) => { total += d.data().unreadByAdmin || 0; });
        setUnreadMessages(total);
      });
      return () => unsub();
    } else {
      // Customer: unreadByCustomer on their thread
      const q = query(collection(db, "messages"), where("customerId", "==", user.uid));
      const unsub = onSnapshot(q, (snap) => {
        let total = 0;
        snap.docs.forEach((d) => { total += d.data().unreadByCustomer || 0; });
        setUnreadMessages(total);
      });
      return () => unsub();
    }
  }, [user, profile]);

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* ── Logo / Art Brand Wordmark ── */}
          <Link
            href="/"
            className="text-xl font-heading font-bold text-primary-dark hover:text-primary transition-colors cursor-pointer tracking-wide"
          >
            {SITE_NAME}
          </Link>

          {/* ── Desktop Navigation (hidden on mobile) ── */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full hover:bg-primary-light/30 transition-all min-h-touch flex items-center cursor-pointer text-sm ${
                  pathname === link.href ? "text-primary-dark font-semibold bg-primary-light/20" : "text-foreground hover:text-primary-dark"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin link visible only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-full hover:bg-primary-light/30 transition-all min-h-touch flex items-center cursor-pointer text-sm font-medium ${
                  pathname.startsWith("/admin") ? "text-primary-dark bg-primary-light/20" : "text-primary-dark hover:text-primary"
                }`}
              >
                Dashboard
              </Link>
            )}

            {/* Messages link for logged-in users */}
            {user && (
              <Link
                href={isAdmin ? "/admin/messages" : "/messages"}
                className={`relative px-4 py-2 rounded-full hover:bg-primary-light/30 transition-all min-h-touch flex items-center gap-1.5 cursor-pointer text-sm ${
                  pathname === (isAdmin ? "/admin/messages" : "/messages") ? "text-primary-dark font-semibold bg-primary-light/20" : "text-foreground hover:text-primary-dark"
                }`}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Messages
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 right-0.5 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* ── Right section: Cart + Auth + Mobile Toggle ── */}
          <div className="flex items-center gap-2">
            {/* Customer Mode pill for admins */}
            {profile?.role === "admin" && viewMode === "customer" && (
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-light/20 text-primary-dark border border-primary/25 dark:bg-secondary-warm dark:text-beige dark:border-secondary-deep tracking-wide">
                Customer Mode
              </span>
            )}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications && unreadCount > 0) markAllRead();
                  }}
                  className="relative p-2 rounded-full hover:bg-primary-light/30 transition-all min-h-touch min-w-touch flex items-center justify-center cursor-pointer"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                >
                  <Bell className="w-5 h-5 text-foreground" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface rounded-gallery shadow-lg border border-primary/10 z-50">
                    <div className="px-4 py-3 border-b border-secondary">
                      <h3 className="font-heading font-semibold text-foreground text-sm">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-muted text-sm">All caught up — no new brushstrokes to report.</p>
                    ) : (
                      <div className="divide-y divide-secondary">
                        {notifications.slice(0, 20).map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || "#"}
                            onClick={() => setShowNotifications(false)}
                            className="block px-4 py-3 hover:bg-secondary/50 transition-colors"
                          >
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            <p className="text-xs text-muted mt-0.5">{n.body}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cart icon with badge — hidden for admin in admin mode */}
            {!isAdmin && (
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-primary-light/30 transition-all min-h-touch min-w-touch flex items-center justify-center cursor-pointer"
                aria-label={`Shopping cart with ${totalItems()} items`}
              >
                <ShoppingCart className="w-5 h-5 text-foreground" aria-hidden="true" />
                {totalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop auth buttons (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <Link
                  href="/profile"
                  className="p-2 rounded-full hover:bg-primary-light/30 transition-all min-h-touch min-w-touch flex items-center justify-center cursor-pointer"
                  aria-label="Your profile"
                >
                  <User className="w-5 h-5 text-foreground" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-all shadow-sm hover:shadow-md min-h-touch cursor-pointer"
                >
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile hamburger menu button (visible only on mobile) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors min-h-touch min-w-touch flex items-center justify-center cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6 text-foreground" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile slide-out menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
