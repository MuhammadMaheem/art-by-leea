/**
 * PATCH  /api/admin/promo-codes/[id] — Toggle active status.
 * DELETE /api/admin/promo-codes/[id] — Delete a promo code.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdmin } from "@/lib/firebase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const db = getAdminDb();
    const ref = db.collection("promoCodes").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;

    await ref.update(updates);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    const db = getAdminDb();
    await db.collection("promoCodes").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
