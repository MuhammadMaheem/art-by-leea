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
    <section className="py-16 md:py-24 bg-secondary/50">
      <Container>
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-accent mb-3">
            Our Services
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            From ready-made masterpieces to fully custom creations, we&apos;ve got
            you covered.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                {/* Icon container */}
                <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Icon
                    className="w-7 h-7 text-primary-dark"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-xl font-semibold text-accent mb-3">
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
