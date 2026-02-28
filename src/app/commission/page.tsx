/**
 * Commission Page — Request custom art commissions.
 */
import Container from "@/components/layout/Container";
import CommissionForm from "@/components/commission/CommissionForm";
import { PenTool, Clock, MessageCircle, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Describe Your Vision",
    description: "Fill out the form with your ideas, preferences, and budget.",
  },
  {
    icon: Clock,
    title: "We Review & Quote",
    description:
      "Our artist reviews your request and provides a timeline and detailed quote.",
  },
  {
    icon: PenTool,
    title: "Creation Begins",
    description:
      "Once approved, we start crafting your custom piece with regular updates.",
  },
  {
    icon: CheckCircle,
    title: "Delivery",
    description:
      "Your finished artwork is carefully packaged and delivered to your door.",
  },
] as const;

export default function CommissionPage() {
  return (
    <section className="py-14 md:py-20">
      <Container>
        {/* Page header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            Custom Art Commissions
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Have a unique vision? Let us bring it to life. Fill out the form
            below and we&apos;ll get back to you within 48 hours.
          </p>
          <p className="text-sm italic text-primary/70 mt-3">
            &ldquo;Creativity takes courage.&rdquo; — Henri Matisse
          </p>
        </div>

        {/* How it works — 4-step process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="text-center p-6 gallery-card"
              >
                <div className="w-12 h-12 bg-primary-light/40 dark:bg-secondary-warm rounded-full flex items-center justify-center mx-auto mb-3 ring-1 ring-primary-light/30 dark:ring-secondary-deep">
                  <Icon
                    className="w-6 h-6 text-primary-dark dark:text-beige"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-xs font-bold text-primary-dark dark:text-beige mb-1 tracking-wider">
                  Step {index + 1}
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Commission form */}
        <div className="max-w-2xl mx-auto gallery-card p-6 md:p-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
            Request a Commission
          </h2>
          <CommissionForm />
        </div>
      </Container>
    </section>
  );
}
