/**
 * POST /api/messages/send — Send a chat message.
 *
 * Creates/updates a message thread and adds a chat message.
 * Auth required (customer or admin).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided." }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const db = getAdminDb();

    // Get user profile for role and display info
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    const userProfile = userDoc.data()!;
    const senderRole = userProfile.role as "customer" | "admin";

    const body = await request.json();
    const { threadId, text, customerId } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: "Message text is required." }, { status: 400 });
    }

    let threadRef;

    if (threadId) {
      // Existing thread
      threadRef = db.collection("messages").doc(threadId);
    } else {
      // New thread — customer initiating
      const resolvedCustomerId = senderRole === "admin" ? customerId : uid;
      if (!resolvedCustomerId) {
        return NextResponse.json({ error: "Customer ID required for new thread." }, { status: 400 });
      }

      // Check if a thread already exists for this customer
      const existingThread = await db
        .collection("messages")
        .where("customerId", "==", resolvedCustomerId)
        .limit(1)
        .get();

      if (!existingThread.empty) {
        threadRef = existingThread.docs[0].ref;
      } else {
        const customerDoc = senderRole === "admin"
          ? await db.collection("users").doc(resolvedCustomerId).get()
          : userDoc;
        const customerData = customerDoc.data()!;

        threadRef = db.collection("messages").doc();
        await threadRef.set({
          customerId: resolvedCustomerId,
          customerName: customerData.displayName || "Customer",
          customerEmail: customerData.email || "",
          lastMessage: text.trim(),
          lastMessageAt: FieldValue.serverTimestamp(),
          unreadByAdmin: senderRole === "customer" ? 1 : 0,
          unreadByCustomer: senderRole === "admin" ? 1 : 0,
          createdAt: FieldValue.serverTimestamp(),
        });

        // Add the chat message
        await threadRef.collection("chats").add({
          senderId: uid,
          senderRole,
          text: text.trim(),
          createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ threadId: threadRef.id }, { status: 201 });
      }
    }

    // Add chat message to existing thread
    await threadRef.collection("chats").add({
      senderId: uid,
      senderRole,
      text: text.trim(),
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update thread metadata
    const unreadField = senderRole === "customer" ? "unreadByAdmin" : "unreadByCustomer";
    await threadRef.update({
      lastMessage: text.trim(),
      lastMessageAt: FieldValue.serverTimestamp(),
      [unreadField]: FieldValue.increment(1),
    });

    return NextResponse.json({ threadId: threadRef.id }, { status: 201 });
  } catch (error) {
    console.error("[API] Message send error:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
