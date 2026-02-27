/**
 * notifications.ts — Server-side helper to create Firestore notifications.
 *
 * Used by API routes (webhook, commission, messages) to push notifications.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

interface CreateNotificationParams {
  userId: string;
  type: "order" | "commission" | "message" | "promo";
  title: string;
  body: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const db = getAdminDb();
  await db.collection("notifications").add({
    userId: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    read: false,
    link: params.link || null,
    createdAt: FieldValue.serverTimestamp(),
  });
}
