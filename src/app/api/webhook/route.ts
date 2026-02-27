/**
 * POST /api/webhook — Stripe Webhook Handler.
 *
 * Listens for `checkout.session.completed` events from Stripe.
 * When a payment succeeds:
 *   1. Retrieves session line items from Stripe
 *   2. Creates an Order document in Firestore
 *   3. Sends an order confirmation email via Resend
 *
 * The webhook secret is used to verify the event signature so
 * nobody can fake a successful payment.
 *
 * IMPORTANT: This route MUST receive the raw body (not parsed JSON)
 * for signature verification, so we disable Next.js body parsing.
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendOrderConfirmation } from "@/lib/resend";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Retrieve the line items for this session
      const lineItems = await getStripe().checkout.sessions.listLineItems(
        session.id,
        { limit: 100 }
      );

      // Build order items from line items
      const orderItems = lineItems.data.map((item) => ({
        title: item.description || "Artwork",
        price: (item.amount_total || 0) / 100, // Cents → dollars
        quantity: item.quantity || 1,
        artworkId: "", // Can be enriched from metadata if needed
        imageUrl: "",
      }));

      // Create the Order in Firestore
      const adminDb = getAdminDb();
      const orderData: Record<string, unknown> = {
        userId: session.metadata?.userId || "",
        userEmail: session.customer_email || session.customer_details?.email || "",
        items: orderItems,
        total: (session.amount_total || 0) / 100,
        status: "paid",
        stripeSessionId: session.id,
        createdAt: new Date(),
      };

      // Add promo code info if it was used
      if (session.metadata?.promoCode) {
        orderData.promoCode = session.metadata.promoCode;
        const subtotal = (session.amount_subtotal || 0) / 100;
        orderData.discountAmount = subtotal - (session.amount_total || 0) / 100;

        // Increment usage counter
        const promoSnap = await adminDb
          .collection("promoCodes")
          .where("code", "==", session.metadata.promoCode)
          .limit(1)
          .get();
        if (!promoSnap.empty) {
          const promoRef = promoSnap.docs[0].ref;
          const { FieldValue } = await import("firebase-admin/firestore");
          await promoRef.update({ currentUses: FieldValue.increment(1) });
        }
      }

      const orderRef = await adminDb.collection("orders").add(orderData);

      // Notify the customer about their order
      if (orderData.userId) {
        createNotification({
          userId: orderData.userId as string,
          type: "order",
          title: "Order Confirmed",
          body: `Your order #${orderRef.id.slice(0, 8)} has been confirmed.`,
          link: "/profile",
        }).catch((err) => console.error("[Webhook] Notification error:", err));
      }

      // Send confirmation email (fire and forget — don't block the webhook)
      const customerEmail = orderData.userEmail as string;
      if (customerEmail) {
        sendOrderConfirmation({
          to: customerEmail,
          orderId: orderRef.id,
          items: orderItems,
          total: orderData.total as number,
        }).catch((emailErr) => {
          console.error("[Webhook] Failed to send confirmation email:", emailErr);
        });
      }

      console.log(
        `[Webhook] Order ${orderRef.id} created for session ${session.id}`
      );
    } catch (err) {
      console.error("[Webhook] Error processing completed checkout:", err);
      // Return 200 anyway so Stripe doesn't retry endlessly
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
