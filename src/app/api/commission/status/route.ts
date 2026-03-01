/**
 * POST /api/commission/status — Sends commission status update email.
 *
 * Called by the admin commissions page when a commission status changes.
 * Sends an email to the customer informing them of the update.
 *
 * Request body:
 *   { commissionId, status, userEmail, userName }
 */

import { NextRequest, NextResponse } from "next/server";
import { sendCommissionStatusUpdate } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commissionId, status, userEmail, userName, quotedPrice, estimatedDelivery, rejectionReason } = body;

    if (!commissionId || !status || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    await sendCommissionStatusUpdate({
      to: userEmail,
      commissionId,
      status,
      userName: userName || "Customer",
      quotedPrice: quotedPrice || undefined,
      estimatedDelivery: estimatedDelivery || undefined,
      rejectionReason: rejectionReason || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Commission status email error:", error);
    return NextResponse.json(
      { error: "Failed to send status notification." },
      { status: 500 }
    );
  }
}
