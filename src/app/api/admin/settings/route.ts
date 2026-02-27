import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdmin } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    const doc = await getAdminDb()
      .collection("settings")
      .doc("commissionConfig")
      .get();

    if (!doc.exists) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({ config: doc.data() });
  } catch (error) {
    console.error("[API] Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const body = await request.json();
    const { categories, budgetRanges } = body;

    if (!Array.isArray(categories) || !Array.isArray(budgetRanges)) {
      return NextResponse.json(
        { error: "categories and budgetRanges must be arrays." },
        { status: 400 }
      );
    }

    await getAdminDb()
      .collection("settings")
      .doc("commissionConfig")
      .set({
        categories,
        budgetRanges,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    if (message === "Forbidden" || message === "Unauthorized") {
      return NextResponse.json(
        { error: message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    console.error("[API] Save settings error:", error);
    return NextResponse.json(
      { error: "Failed to save settings." },
      { status: 500 }
    );
  }
}
