/**
 * POST /api/commission — Handles new commission submissions.
 *
 * Receives commission form data from the client, saves it to Firestore,
 * and sends a notification email to the admin about the new request.
 *
 * Request body shape:
 *   { userId, name, email, description, category, budget, referenceImageUrls }
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendCommissionNotification } from "@/lib/resend";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      description,
      category,
      budget,
      referenceImageUrls,
    } = body;

    // Basic validation
    if (!name || !email || !description || !category || !budget) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Save commission to Firestore
    const commissionData = {
      userId: userId || "",
      name,
      email,
      description,
      category,
      budget,
      referenceImageUrls: referenceImageUrls || [],
      status: "pending",
      createdAt: new Date(),
    };

    const docRef = await getAdminDb()
      .collection("commissions")
      .add(commissionData);

    // Fetch admin email from settings
    const db = getAdminDb();
    const settingsSnap = await db
      .collection("settings")
      .doc("commissionConfig")
      .get();
    const adminEmail = settingsSnap.exists
      ? settingsSnap.data()?.adminEmail || ""
      : "";

    // Notify admin via email (non-blocking)
    sendCommissionNotification({
      commissionId: docRef.id,
      name,
      email,
      description,
      category,
      budget,
      adminEmail: adminEmail || undefined,
    }).catch((err) => {
      console.error("[API] Failed to send commission notification:", err);
    });

    // Notify admin users about the new commission
    const admins = await db.collection("users").where("role", "==", "admin").get();
    for (const adminDoc of admins.docs) {
      createNotification({
        userId: adminDoc.id,
        type: "commission",
        title: "New Commission Request",
        body: `${name} submitted a ${category} commission (${budget}).`,
        link: "/admin/commissions",
      }).catch((err) => console.error("[API] Notification error:", err));
    }

    return NextResponse.json({
      success: true,
      commissionId: docRef.id,
    });
  } catch (error) {
    console.error("[API] Commission submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit commission request." },
      { status: 500 }
    );
  }
}
