/**
 * constants.ts — Site-wide metadata, navigation links, and category definitions.
 *
 * Centralizing these values makes it easy to update the site name, add new
 * navigation links, or modify product categories from a single file.
 */

export const SITE_NAME = "Artisan Gallery";
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
  "Under $100",
  "$100 – $300",
  "$300 – $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500+",
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
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;
