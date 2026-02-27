/**
 * types/index.ts — Core TypeScript interfaces for the entire application.
 *
 * These types are used across components, API routes, and Firestore helpers
 * to ensure consistent data shapes throughout the app.
 */

import { Timestamp } from "firebase/firestore";

/** ── Artwork (Product) ── */
export interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number; // in USD
  category: "Painting" | "Digital" | "Sculpture" | "Mixed Media" | "Photography";
  imageUrl: string;
  dimensions: string; // e.g., "24 × 36 inches"
  medium: string; // e.g., "Oil on canvas"
  isFeatured: boolean;
  inStock: boolean;
  archived?: boolean;
  createdAt: Timestamp | string;
}

/** ── Cart Item (extends Artwork with quantity) ── */
export interface CartItem extends Artwork {
  quantity: number;
}

/** ── Order (created after Stripe checkout succeeds) ── */
export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  stripeSessionId: string;
  promoCode?: string;
  discountAmount?: number;
  createdAt: Timestamp | string;
}

/** ── Simplified item stored inside an Order ── */
export interface OrderItem {
  artworkId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

/** ── Commission Request ── */
export interface Commission {
  id: string;
  userId: string;
  name: string;
  email: string;
  description: string;
  category: string;
  budget: string;
  referenceImageUrls: string[];
  status: "pending" | "in-progress" | "completed" | "delivered";
  adminNotes?: string;
  createdAt: Timestamp | string;
}

/** ── User Profile (stored in Firestore users/{uid}) ── */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "customer" | "admin";
  createdAt: Timestamp | string;
}

/** ── Commission Config (stored in Firestore settings/commissionConfig) ── */
export interface CommissionConfig {
  categories: string[];
  budgetRanges: string[];
  updatedAt: Timestamp | string;
}

/** ── Promo Code ── */
export interface PromoCode {
  id: string;
  code: string;           // uppercase, unique
  discountPercent: number; // 0–100
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  expiresAt: Timestamp | string | null;
  createdAt: Timestamp | string;
}

/** ── Message Thread ── */
export interface MessageThread {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageAt: Timestamp | string;
  unreadByAdmin: number;
  unreadByCustomer: number;
  createdAt: Timestamp | string;
}

/** ── Chat Message (subcollection of messages/{threadId}/chats) ── */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: "customer" | "admin";
  text: string;
  createdAt: Timestamp | string;
}

/** ── App Notification ── */
export interface AppNotification {
  id: string;
  userId: string;
  type: "order" | "commission" | "message" | "promo";
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: Timestamp | string;
}
