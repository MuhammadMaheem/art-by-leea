/**
 * POST /api/checkout — Creates an order with Easypaisa payment (pending verification).
 *
 * Receives cart items, receipt image URL, and user info from the client.
 * Creates a Firestore order with status "pending_verification" and
 * emails the admin with the receipt for manual verification.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendOrderConfirmation, sendOrderReceiptToAdmin } from "@/lib/resend";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, userId, userEmail, receiptImageUrl, promoCode, discountPercent } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty or invalid." },
        { status: 400 }
      );
    }

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "User information is required." },
        { status: 400 }
      );
    }

    if (!receiptImageUrl) {
      return NextResponse.json(
        { error: "Payment receipt screenshot is required." },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const discount = promoCode && discountPercent > 0
      ? subtotal * (discountPercent / 100)
      : 0;
    const total = subtotal - discount;

    // Fetch Easypaisa number from settings
    const adminDb = getAdminDb();
    const settingsSnap = await adminDb
      .collection("settings")
      .doc("commissionConfig")
      .get();
    const easypaisaNumber = settingsSnap.exists
      ? settingsSnap.data()?.easypaisaNumber || "03404677899"
      : "03404677899";

    // Create the Order in Firestore
    const { FieldValue: FV } = await import("firebase-admin/firestore");
    const orderData: Record<string, unknown> = {
      userId,
      userEmail,
      items: items.map((item: { id: string; title: string; price: number; quantity: number; imageUrl?: string }) => ({
        artworkId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || "",
      })),
      total,
      status: "pending_verification",
      receiptImageUrl,
      easypaisaNumber,
      createdAt: FV.serverTimestamp(),
    };

    if (promoCode) {
      orderData.promoCode = promoCode;
      orderData.discountAmount = discount;

      // Increment promo usage counter
      const promoSnap = await adminDb
        .collection("promoCodes")
        .where("code", "==", promoCode)
        .limit(1)
        .get();
      if (!promoSnap.empty) {
        const { FieldValue } = await import("firebase-admin/firestore");
        await promoSnap.docs[0].ref.update({ currentUses: FieldValue.increment(1) });
      }
    }

    const orderRef = await adminDb.collection("orders").add(orderData);

    // Create in-app notification for the user
    createNotification({
      userId,
      type: "order",
      title: "Order Submitted",
      body: `Your order #${orderRef.id.slice(0, 8)} has been submitted and is pending payment verification.`,
      link: "/profile",
    }).catch((err) => console.error("[Checkout] Notification error:", err));

    // Send confirmation email to customer (fire and forget)
    sendOrderConfirmation({
      to: userEmail,
      orderId: orderRef.id,
      items: items.map((i: { title: string; price: number; quantity: number }) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
      total,
    }).catch((err) => console.error("[Checkout] Customer email error:", err));

    // Send receipt to admin for verification (fire and forget)
    sendOrderReceiptToAdmin({
      orderId: orderRef.id,
      userEmail,
      receiptImageUrl,
      items: items.map((i: { title: string; price: number; quantity: number }) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
      total,
    }).catch((err) => console.error("[Checkout] Admin email error:", err));

    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (error) {
    console.error("[API] Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}
