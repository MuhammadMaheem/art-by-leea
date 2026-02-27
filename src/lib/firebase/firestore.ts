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
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(
      collection(db, "artworks"),
      orderBy("createdAt", "desc")
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Artwork)
    .filter((a) => a.archived !== true);
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
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
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

/** Update order status */
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), { status });
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
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Commission[];
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
