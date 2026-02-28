/**
 * constants.ts — Site-wide metadata, navigation links, and category definitions.
 *
 * Centralizing these values makes it easy to update the site name, add new
 * navigation links, or modify product categories from a single file.
 */

export const SITE_NAME = "Art By Leena";
export const SITE_DESCRIPTION =
  "Original art pieces and custom commissions crafted with passion.";

/** Navigation links shown in the header/navbar */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Commissions", href: "/commission" },
] as const;

/** Art categories used for filtering in the shop */
export const ART_CATEGORIES = [
  "All",
  "Painting",
  "Digital",
  "Sculpture",
  "Mixed Media",
  "Photography",
] as const;

export type ArtCategory = (typeof ART_CATEGORIES)[number];

/** Sort options for the shop page */
export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
] as const;

/** Budget ranges for the commission form */
export const BUDGET_RANGES = [
  "Under Rs. 10,000",
  "Rs. 10,000 – Rs. 30,000",
  "Rs. 30,000 – Rs. 50,000",
  "Rs. 50,000 – Rs. 100,000",
  "Rs. 100,000 – Rs. 250,000",
  "Rs. 250,000+",
] as const;

/** Commission/Order status flow */
export const COMMISSION_STATUSES = [
  "pending",
  "in-progress",
  "completed",
  "delivered",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "pending_verification",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

/** Art-themed micro-copy for empty states */
export const EMPTY_STATE_MESSAGES = {
  cart: "Your canvas is empty — time to discover something beautiful.",
  orders: "No masterpieces collected yet. Your gallery awaits!",
  commissions: "No commissions requested yet. Let's create something unique.",
  messages: "No conversations yet. Reach out — great art starts with a dialogue.",
  artworks: "The gallery is being curated. Check back soon!",
  notifications: "All caught up — no new brushstrokes to report.",
  general: "Nothing here yet — every collection starts with the first piece.",
} as const;

/** Art-themed loading messages */
export const LOADING_MESSAGES = {
  gallery: "Preparing the gallery...",
  artwork: "Unveiling the masterpiece...",
  default: "Curating your experience...",
} as const;
