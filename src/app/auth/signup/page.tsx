/**
 * Signup Page — Create a new account.
 */
import { UserPlus } from "lucide-react";
import Container from "@/components/layout/Container";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus
                className="w-7 h-7 text-primary-dark"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-2xl font-bold text-accent mb-1">
              Create Account
            </h1>
            <p className="text-muted">Join to start collecting art</p>
            <p className="text-xs italic text-primary/70 mt-1">
              &ldquo;Every artist was first an amateur.&rdquo; — Ralph Waldo Emerson
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-sm">
            <SignupForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
