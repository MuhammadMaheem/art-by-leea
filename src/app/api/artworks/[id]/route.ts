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

    const docRef = getAdminDb().collection("artworks").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Artwork not found." },
        { status: 404 }
      );
    }

    // Only allow updating valid fields
    const allowedFields = [
      "title",
      "description",
      "price",
      "category",
      "medium",
      "dimensions",
      "isFeatured",
      "inStock",
      "imageUrl",
      "archived",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 }
      );
    }

    await docRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    if (message === "Forbidden" || message === "Unauthorized") {
      return NextResponse.json(
        { error: message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    console.error("[API] Update artwork error:", error);
    return NextResponse.json(
      { error: "Failed to update artwork." },
      { status: 500 }
    );
  }
}
