/**
 * PATCH /api/orders/[id] — Cancel a customer's own pending order.
 *
 * Auth:  Firebase ID token in Authorization: Bearer <token> header.
 * Rules: The requesting user must own the order AND the order must be
 *        in a cancellable state (pending or pending_verification).
 *        Orders that are paid, shipped, delivered, or already cancelled
 *        cannot be cancelled by the customer.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";

const CANCELLABLE_STATUSES = ["pending", "pending_verification"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── 1. Verify Firebase ID token ──────────────────────────
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // ── 2. Fetch the order ───────────────────────────────────
    const { id } = await params;
    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const order = orderDoc.data()!;

    // ── 3. Ownership check ───────────────────────────────────
    if (order.userId !== uid) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    // ── 4. Status check ──────────────────────────────────────
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        {
          error: `Cannot cancel an order with status "${order.status}". Only pending orders can be cancelled.`,
        },
        { status: 400 }
      );
    }

    // ── 5. Parse and validate cancellation reason ────────────
    let reason = "";
    try {
      const body = await request.json();
      reason = typeof body.reason === "string" ? body.reason.trim() : "";
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (reason.length < 10) {
      return NextResponse.json(
        { error: "Cancellation reason must be at least 10 characters." },
        { status: 400 }
      );
    }

    // ── 6. Update status to cancelled with reason ────────────
    await orderRef.update({
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] Order cancel error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
