/**
 * Firestore CRUD Helpers — Typed functions for reading/writing data.
 *
 * Each function handles a specific collection (artworks, orders,
 * commissions, users). All functions are used client-side via the
 * Firebase Client SDK. Admin/server operations use the Admin SDK
 * directly in API routes.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./client";
import type { Artwork, Order, Commission, UserProfile } from "@/types";

// ═══════════════════════════════════════════════════════════════════════
// ARTWORKS
// ═══════════════════════════════════════════════════════════════════════

/** Fetch all artworks, optionally filtered by category (excludes archived) */
export async function getArtworks(category?: string): Promise<Artwork[]> {
  let q;
  if (category && category !== "All") {
    q = query(
      collection(db, "artworks"),
      where("category", "==", category)
    );
  } else {
    q = query(collection(db, "artworks"));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Artwork)
    .filter((a) => a.archived !== true)
    .sort((a, b) => {
      const aT = (a.createdAt as { seconds?: number })?.seconds ?? 0;
      const bT = (b.createdAt as { seconds?: number })?.seconds ?? 0;
      return bT - aT;
    });
}

/** Fetch featured artworks for the home page (excludes archived) */
export async function getFeaturedArtworks(): Promise<Artwork[]> {
  const q = query(
    collection(db, "artworks"),
    where("isFeatured", "==", true),
    limit(6)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Artwork)
    .filter((a) => a.archived !== true);
}

/** Fetch a single artwork by its document ID */
export async function getArtwork(id: string): Promise<Artwork | null> {
  const docRef = doc(db, "artworks", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Artwork;
}

// ═══════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════

/** Fetch orders for a specific user */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
  return orders.sort((a, b) => {
    const aT = (a.createdAt as { seconds?: number })?.seconds ?? 0;
    const bT = (b.createdAt as { seconds?: number })?.seconds ?? 0;
    return bT - aT;
  });
}

/** Fetch all orders (admin only — use with caution) */
export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
}

/** Update order status (with optional admin note for cancellations) */
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  adminNote?: string
): Promise<void> {
  const data: Record<string, unknown> = { status };
  if (status === "cancelled" && adminNote) {
    data.adminCancellationNote = adminNote;
    data.cancelledAt = new Date().toISOString();
  }
  await updateDoc(doc(db, "orders", orderId), data);
}

// ═══════════════════════════════════════════════════════════════════════
// COMMISSIONS
// ═══════════════════════════════════════════════════════════════════════

/** Create a new commission request */
export async function createCommission(
  data: Omit<Commission, "id" | "createdAt" | "status">
): Promise<string> {
  const docRef = await addDoc(collection(db, "commissions"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Fetch commissions for a specific user */
export async function getUserCommissions(
  userId: string
): Promise<Commission[]> {
  const q = query(
    collection(db, "commissions"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const commissions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Commission[];
  return commissions.sort((a, b) => {
    const aT = (a.createdAt as { seconds?: number })?.seconds ?? 0;
    const bT = (b.createdAt as { seconds?: number })?.seconds ?? 0;
    return bT - aT;
  });
}

/** Fetch all commission requests (admin only) */
export async function getAllCommissions(): Promise<Commission[]> {
  const q = query(
    collection(db, "commissions"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Commission[];
}

/** Update commission status and optional admin notes */
export async function updateCommissionStatus(
  commissionId: string,
  status: Commission["status"],
  adminNotes?: string
): Promise<void> {
  const updateData: DocumentData = { status };
  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes;
  }
  await updateDoc(doc(db, "commissions", commissionId), updateData);
}

// ═══════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════

/** Fetch a user profile by UID */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserProfile;
}

/** Update a user's role (admin operation) */
export async function updateUserRole(
  uid: string,
  role: "customer" | "admin"
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}
