/**
 * SignupForm — Email/password account creation form.
 */
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { signUp } from "@/lib/firebase/auth";

export default function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName);
      toast.success("Account created! Welcome aboard.");
      router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Sign up failed";
      if (message.includes("email-already-in-use")) {
        setErrors({ email: "An account with this email already exists" });
      } else if (message.includes("weak-password")) {
        setErrors({ password: "Password is too weak" });
      } else {
        toast.error("Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Full Name"
        placeholder="Jane Smith"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        error={errors.displayName}
        autoComplete="name"
        required
      />

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
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="new-password"
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
        required
      />

      <Button type="submit" loading={loading} size="lg" className="w-full">
        <UserPlus className="w-5 h-5 mr-2" aria-hidden="true" />
        Create Account
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:text-primary-dark font-medium cursor-pointer"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
