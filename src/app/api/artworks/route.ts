import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdmin } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const snapshot = await getAdminDb()
      .collection("artworks")
      .orderBy("createdAt", "desc")
      .get();

    const artworks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ artworks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const body = await request.json();
    const {
      title,
      description,
      price,
      category,
      medium,
      dimensions,
      isFeatured,
      inStock,
      imageUrl,
    } = body;

    if (!title || !description || !price || !category || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const artworkData = {
      title,
      description,
      price: Number(price),
      category,
      medium: medium || "",
      dimensions: dimensions || "",
      isFeatured: Boolean(isFeatured),
      inStock: inStock !== false,
      imageUrl,
      archived: false,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await getAdminDb().collection("artworks").add(artworkData);

    return NextResponse.json({ id: docRef.id, success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    if (message === "Forbidden" || message === "Unauthorized") {
      return NextResponse.json(
        { error: message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    console.error("[API] Create artwork error:", error);
    return NextResponse.json(
      { error: "Failed to create artwork." },
      { status: 500 }
    );
  }
}
