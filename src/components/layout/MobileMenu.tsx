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
import { X, ShoppingCart, User, LogIn, LogOut, MessageCircle } from "lucide-react";
import { NAV_LINKS } from "@/utils/constants";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "@/lib/firebase/auth";
import { useCartStore } from "@/stores/cartStore";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, isAdmin } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems);

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
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <nav
        className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col"
        aria-label="Mobile navigation"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="text-lg font-semibold text-accent">Menu</span>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors min-h-touch min-w-touch flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center px-6 py-3 text-accent hover:bg-primary-light transition-colors min-h-touch cursor-pointer"
            >
              {link.label}
            </Link>
          ))}

          {/* Cart link */}
          <Link
            href="/cart"
            onClick={onClose}
            className="flex items-center gap-3 px-6 py-3 text-accent hover:bg-primary-light transition-colors min-h-touch cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            <span>Cart</span>
            {totalItems() > 0 && (
              <span className="ml-auto bg-primary text-accent text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalItems()}
              </span>
            )}
          </Link>

          {/* Admin link (if admin user) */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 px-6 py-3 text-primary-dark hover:bg-primary-light transition-colors min-h-touch cursor-pointer font-medium"
            >
              Admin Dashboard
            </Link>
          )}

          {/* Messages link (if logged in) */}
          {user && (
            <Link
              href={isAdmin ? "/admin/messages" : "/messages"}
              onClick={onClose}
              className="flex items-center gap-3 px-6 py-3 text-accent hover:bg-primary-light transition-colors min-h-touch cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              <span>Messages</span>
            </Link>
          )}
        </div>

        {/* Auth section */}
        <div className="border-t border-gray-100 p-4">
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-accent hover:bg-secondary rounded-lg transition-colors min-h-touch cursor-pointer"
              >
                <User className="w-5 h-5" aria-hidden="true" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-touch cursor-pointer"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-accent hover:bg-secondary rounded-lg transition-colors min-h-touch cursor-pointer"
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
