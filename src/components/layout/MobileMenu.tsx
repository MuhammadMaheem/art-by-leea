/**
 * MobileMenu — Slide-out navigation menu for mobile devices.
 *
 * Slides in from the right when the hamburger menu is tapped.
 * Includes navigation links, auth links, and a close button.
 * Uses a backdrop overlay that closes the menu on tap.
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ShoppingCart, User, LogIn, LogOut, MessageCircle } from "lucide-react";
import { NAV_LINKS } from "@/utils/constants";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "@/lib/firebase/auth";
import { useCartStore } from "@/stores/cartStore";
import ThemeToggle from "../ui/ThemeToggle";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, isAdmin } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems);
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <nav
        className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-background shadow-xl flex flex-col animate-in slide-in-from-right duration-300"
        aria-label="Mobile navigation"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-warm">
          <span className="text-lg font-heading font-semibold text-foreground tracking-wide">Menu</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-full hover:bg-primary-light/30 transition-all min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center px-6 py-3 transition-all min-h-touch cursor-pointer text-sm ${
                pathname === link.href ? "bg-primary-light/25 text-primary-dark font-semibold border-r-2 border-primary" : "text-foreground hover:bg-secondary/60"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Cart link — hidden for admin in admin mode */}
          {!isAdmin && (
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-3 px-6 py-3 text-foreground hover:bg-secondary/60 transition-all min-h-touch cursor-pointer text-sm"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              <span>Cart</span>
              {totalItems() > 0 && (
                <span className="ml-auto bg-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </Link>
          )}

          {/* Admin link (if admin user) */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className={`flex items-center gap-3 px-6 py-3 transition-all min-h-touch cursor-pointer font-medium text-sm ${
                pathname.startsWith("/admin") ? "bg-primary-light/25 text-primary-dark border-r-2 border-primary" : "text-primary-dark hover:bg-secondary/60"
              }`}
            >
              Dashboard
            </Link>
          )}

          {/* Messages link (if logged in) */}
          {user && (
            <Link
              href={isAdmin ? "/admin/messages" : "/messages"}
              onClick={onClose}
              className={`flex items-center gap-3 px-6 py-3 transition-all min-h-touch cursor-pointer text-sm ${
                pathname === (isAdmin ? "/admin/messages" : "/messages") ? "bg-primary-light/25 text-primary-dark font-semibold border-r-2 border-primary" : "text-foreground hover:bg-secondary/60"
              }`}
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              <span>Messages</span>
            </Link>
          )}
        </div>

        {/* Auth section */}
        <div className="border-t border-secondary-warm p-4">
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary/60 rounded-gallery transition-all min-h-touch cursor-pointer text-sm"
              >
                <User className="w-5 h-5" aria-hidden="true" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error/10 rounded-gallery transition-all min-h-touch cursor-pointer text-sm"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary/60 rounded-gallery transition-all min-h-touch cursor-pointer text-sm"
            >
              <LogIn className="w-5 h-5" aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
