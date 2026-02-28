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
    <footer className="bg-secondary dark:bg-secondary-deep text-foreground mt-auto border-t-2 border-primary-light/25 dark:border-primary/15">
      <Container className="py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 font-heading font-bold text-lg text-primary-dark mb-4 cursor-pointer tracking-wide"
            >
              <Palette className="w-6 h-6 text-primary" aria-hidden="true" />
              {SITE_NAME}
            </Link>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Original art pieces and custom commissions crafted with passion.
              Every piece tells a story.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4 tracking-wide">Navigate</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account / Legal */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4 tracking-wide">Account</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Brushstroke divider + Copyright */}
        <div className="mt-12 pt-6 text-center">
          <div className="brushstroke-divider mb-6" />
          <p className="text-sm text-muted">
            &copy; {currentYear} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
