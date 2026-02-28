/**
 * AuthGuard — Protects pages that require authentication.
 *
 * Wrap any page content with <AuthGuard> and if the user is not logged in,
 * they'll be redirected to /auth/login. Shows a loading spinner while
 * checking auth state.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({
  children,
  requireAdmin = false,
}: AuthGuardProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in — redirect to login
        router.push("/auth/login");
      } else if (requireAdmin && !isAdmin) {
        // Logged in but not an admin — redirect to home
        router.push("/");
      }
    }
  }, [user, loading, isAdmin, requireAdmin, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 text-primary animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  // Not authenticated
  if (!user) return null;

  // Not admin when admin is required
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
