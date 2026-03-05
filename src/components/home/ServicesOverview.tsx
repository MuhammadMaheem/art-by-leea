/**
 * ServicesOverview — Three-column feature grid on the home page.
 *
 * Highlights the three main services: Original Art, Custom Commissions,
 * and Art Consultation. Uses Lucide React icons (no emojis).
 */
import { Palette, PenTool, MessageCircle } from "lucide-react";
import Container from "@/components/layout/Container";

const services = [
  {
    icon: Palette,
    title: "Original Art",
    description:
      "Browse our curated gallery of one-of-a-kind paintings, digital art, sculptures, and mixed media pieces. Each work is crafted with care and ready to ship.",
  },
  {
    icon: PenTool,
    title: "Custom Commissions",
    description:
      "Have a vision? Submit a commission request with your ideas, budget, and reference images. We'll bring your dream artwork to life.",
  },
  {
    icon: MessageCircle,
    title: "Art Consultation",
    description:
      "Not sure what you need? Get personalized guidance on art selection, sizing, framing, and placement for your space.",
  },
] as const;

export default function ServicesOverview() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-primary-light/10 via-secondary/30 to-background">
      <Container>
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            Our Services
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            From ready-made masterpieces to fully custom creations, we&apos;ve got
            you covered.
          </p>
          <p className="text-sm italic text-primary/70 mt-3">
            &ldquo;The purpose of art is washing the dust of daily life off our souls.&rdquo; — Pablo Picasso
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="bg-surface border border-primary/20 dark:border-primary/10 rounded-gallery shadow-sm p-5 sm:p-6 md:p-8 text-center"
              >
                {/* Icon container */}
                <div className="w-14 h-14 bg-primary-light/40 dark:bg-secondary-warm rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon
                    className="w-7 h-7 text-primary-dark dark:text-beige"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
