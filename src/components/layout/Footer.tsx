/**
 * Footer — Site-wide footer with navigation and copyright.
 */
import Link from "next/link";
import { Palette } from "lucide-react";
import Container from "./Container";
import { SITE_NAME, NAV_LINKS } from "@/utils/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-accent text-gray-300 mt-auto">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-bold text-lg mb-3 cursor-pointer"
            >
              <Palette className="w-6 h-6 text-primary" aria-hidden="true" />
              {SITE_NAME}
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              Original art pieces and custom commissions crafted with passion.
              Every piece tells a story.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-3">Navigate</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account / Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
