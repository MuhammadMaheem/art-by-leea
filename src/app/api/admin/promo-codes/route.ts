/**
 * GET  /api/admin/promo-codes — List all promo codes (admin only).
 * POST /api/admin/promo-codes — Create a new promo code (admin only).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdmin } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);
    const db = getAdminDb();
    const snap = await db
      .collection("promoCodes")
      .orderBy("createdAt", "desc")
      .get();

    const codes = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(codes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Unauthorized" || message.includes("No token") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request);
    const body = await request.json();
    const { code, discountPercent, maxUses, expiresAt } = body;

    if (!code || typeof discountPercent !== "number") {
      return NextResponse.json(
        { error: "Code and discountPercent are required." },
        { status: 400 }
      );
    }

    if (discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json(
        { error: "Discount must be between 1 and 100." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const upperCode = code.toUpperCase().trim();

    // Check for duplicate code
    const existing = await db
      .collection("promoCodes")
      .where("code", "==", upperCode)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "A promo code with this name already exists." },
        { status: 409 }
      );
    }

    const docRef = await db.collection("promoCodes").add({
      code: upperCode,
      discountPercent,
      maxUses: maxUses || 0, // 0 = unlimited
      currentUses: 0,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, code: upperCode }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
