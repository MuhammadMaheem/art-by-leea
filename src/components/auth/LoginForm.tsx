/**
 * LoginForm — Email/password sign-in form.
 */
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { signIn, resetPassword } from "@/lib/firebase/auth";

export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Sign in failed";
      // Firebase error codes → user-friendly messages
      if (message.includes("user-not-found")) {
        setErrors({ email: "No account found with this email" });
      } else if (message.includes("wrong-password") || message.includes("invalid-credential")) {
        setErrors({ password: "Incorrect password" });
      } else {
        toast.error("Sign in failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors({ email: "Enter your email to reset password" });
      return;
    }
    try {
      await resetPassword(email);
      toast.success("Password reset email sent!");
    } catch {
      toast.error("Failed to send reset email. Check the email address.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
        required
      />

      {/* Forgot password link */}
      <div className="text-right">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:text-primary-dark cursor-pointer transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full">
        <LogIn className="w-5 h-5 mr-2" aria-hidden="true" />
        Sign In
      </Button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-primary hover:text-primary-dark font-medium cursor-pointer"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
