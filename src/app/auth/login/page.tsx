/**
 * Login Page — Sign in to your account.
 */
import { Palette } from "lucide-react";
import Container from "@/components/layout/Container";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <section className="py-8 sm:py-14 md:py-24">
      <Container>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-light/40 dark:bg-secondary-warm rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette
                className="w-7 h-7 text-primary-dark dark:text-beige"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">
              Welcome Back
            </h1>
            <p className="text-muted">Sign in to your account</p>
            <p className="text-xs italic text-primary/70 mt-1">
              &ldquo;Art enables us to find ourselves and lose ourselves at the same time.&rdquo;
            </p>
          </div>

          {/* Form card */}
          <div className="gallery-card p-6 md:p-8">
            <LoginForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
