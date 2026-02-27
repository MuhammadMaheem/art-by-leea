/**
 * Login Page — Sign in to your account.
 */
import { Palette } from "lucide-react";
import Container from "@/components/layout/Container";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-4">
              <Palette
                className="w-7 h-7 text-primary-dark"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-2xl font-bold text-accent mb-1">
              Welcome Back
            </h1>
            <p className="text-muted">Sign in to your account</p>
            <p className="text-xs italic text-primary/70 mt-1">
              &ldquo;Art enables us to find ourselves and lose ourselves at the same time.&rdquo;
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-sm">
            <LoginForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
