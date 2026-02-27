/**
 * POST /api/promo/validate — Validate a promo code and return discount info.
 *
 * Request body: { code: string }
 * Returns: { valid, discountPercent, code } or { valid: false, error }
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Code is required." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const snap = await db
      .collection("promoCodes")
      .where("code", "==", code.toUpperCase().trim())
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ valid: false, error: "Invalid promo code." });
    }

    const promo = snap.docs[0].data();

    if (!promo.isActive) {
      return NextResponse.json({ valid: false, error: "This code is no longer active." });
    }

    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit." });
    }

    if (promo.expiresAt) {
      const expiry = promo.expiresAt.toDate ? promo.expiresAt.toDate() : new Date(promo.expiresAt);
      if (expiry < new Date()) {
        return NextResponse.json({ valid: false, error: "This code has expired." });
      }
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
    });
  } catch (error) {
    console.error("[API] Promo validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate code." },
      { status: 500 }
    );
  }
}
