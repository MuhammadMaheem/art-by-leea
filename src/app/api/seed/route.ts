/**
 * POST /api/seed — Seeds the Firestore artworks collection.
 *
 * Protected by a simple secret check. Only call this once to populate
 * the database with sample artworks.
 *
 * Usage:
 *   curl -X POST http://localhost:3000/api/seed \
 *     -H "Content-Type: application/json" \
 *     -d '{ "secret": "YOUR_ADMIN_SECRET" }'
 *
 * Set SEED_SECRET in .env.local (any random string to protect the endpoint).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import artworksData from "@/../seed/artworks.json";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Simple secret protection — SEED_SECRET must be set in production
    const secret = process.env.SEED_SECRET;
    if (!secret || body.secret !== secret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const adminDb = getAdminDb();
    const batch = adminDb.batch();
    const artworksRef = adminDb.collection("artworks");

    for (const artwork of artworksData) {
      const docRef = artworksRef.doc(); // Auto-generate ID
      batch.set(docRef, {
        ...artwork,
        archived: false,
        createdAt: new Date(),
      });
    }

    await batch.commit();

    // Seed default commission config if it doesn't exist
    const configRef = adminDb.collection("settings").doc("commissionConfig");
    const configSnap = await configRef.get();
    if (!configSnap.exists) {
      await configRef.set({
        categories: ["Painting", "Digital", "Sculpture", "Mixed Media", "Photography"],
        budgetRanges: ["Under Rs. 10,000", "Rs. 10,000 – Rs. 30,000", "Rs. 30,000 – Rs. 50,000", "Rs. 50,000 – Rs. 100,000", "Rs. 100,000 – Rs. 250,000", "Rs. 250,000+"],
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      count: artworksData.length,
      message: `Seeded ${artworksData.length} artworks into Firestore.`,
    });
  } catch (error) {
    console.error("[API] Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed artworks." },
      { status: 500 }
    );
  }
}
