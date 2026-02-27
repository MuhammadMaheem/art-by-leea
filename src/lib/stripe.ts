/**
 * Stripe Server Instance — Used in API routes only.
 *
 * This creates a single Stripe instance configured with your secret key.
 * Import this in /api/checkout and /api/webhook routes.
 *
 * NEVER import this file in client components — the secret key must
 * stay server-side only.
 *
 * Uses lazy initialisation to avoid build-time errors when env vars
 * are not present.
 */
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}
