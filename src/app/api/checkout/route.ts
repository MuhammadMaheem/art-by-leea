/**
 * POST /api/checkout — Creates a Stripe Checkout Session.
 *
 * Receives cart items from the client, builds Stripe line_items, and
 * returns the session URL for redirect. The customer is sent to
 * /checkout/success?session_id={id} on completion.
 *
 * Request body shape:
 *   { items: Array<{ id, title, price, quantity, imageUrl }> }
 */

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, userEmail, promoCode, discountPercent } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty or invalid." },
        { status: 400 }
      );
    }

    // Build Stripe line items from cart
    const lineItems = items.map(
      (item: {
        id: string;
        title: string;
        price: number;
        quantity: number;
        imageUrl?: string;
      }) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
            metadata: { artworkId: item.id },
          },
          unit_amount: Math.round(item.price * 100), // Convert dollars → cents
        },
        quantity: item.quantity,
      })
    );

    // Create a Stripe coupon if promo code is applied
    let discounts: { coupon: string }[] | undefined;
    if (promoCode && discountPercent > 0) {
      const coupon = await getStripe().coupons.create({
        percent_off: discountPercent,
        duration: "once",
        name: promoCode,
      });
      discounts = [{ coupon: coupon.id }];
    }

    // Create the Checkout Session
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      ...(discounts ? { discounts } : {}),
      ...(userEmail ? { customer_email: userEmail } : {}),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        // Store item IDs so webhook can create the order in Firestore
        itemIds: items.map((i: { id: string }) => i.id).join(","),
        ...(promoCode ? { promoCode, discountPercent: String(discountPercent) } : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[API] Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
