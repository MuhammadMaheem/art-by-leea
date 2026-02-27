# Artisan Gallery — Complete Project Description

> A full-stack e-commerce art gallery built with **Next.js 14**, **Firebase**, **Stripe**, and **Tailwind CSS**. Customers can browse original artworks, add them to a cart, pay via Stripe, and request custom commissions. An admin dashboard lets the site owner manage orders and commission requests.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Environment Variables](#4-environment-variables)
5. [Configuration Files](#5-configuration-files)
6. [Type System](#6-type-system)
7. [Pages & Routes](#7-pages--routes)
8. [API Routes](#8-api-routes)
9. [Components](#9-components)
   - [Layout](#layout-components)
   - [Home](#home-components)
   - [Shop](#shop-components)
   - [Cart](#cart-components)
   - [Commission](#commission-components)
   - [Auth](#auth-components)
   - [UI Primitives](#ui-primitive-components)
10. [Library & Services](#10-library--services)
    - [Firebase Client SDK](#firebase-client-sdk)
    - [Firebase Admin SDK](#firebase-admin-sdk)
    - [Firestore Helpers](#firestore-crud-helpers)
    - [Firebase Auth Helpers](#firebase-authentication-helpers)
    - [Firebase Storage](#firebase-storage-helpers)
    - [Stripe](#stripe)
    - [Resend Email](#resend-email)
11. [State Management](#11-state-management)
12. [Providers](#12-providers)
13. [Utilities](#13-utilities)
14. [Firestore Security Rules](#14-firestore-security-rules)
15. [Seed Data & Seeding](#15-seed-data--seeding)
16. [Data Flow Diagrams](#16-key-data-flows)
17. [Folder Structure Reference](#17-folder-structure-reference)

---

## 1. Project Overview

**Artisan Gallery** is an online art marketplace with two core offerings:

| Feature | Description |
|---|---|
| **Art Shop** | Browse, filter, and buy original artworks (paintings, digital art, sculptures, mixed media, photography) |
| **Custom Commissions** | Submit a commission request with description, budget, and reference images; the artist fulfills it |
| **Shopping Cart** | Persistent cart with quantity management, stored in localStorage via Zustand |
| **Stripe Checkout** | Secure card payments through Stripe's hosted checkout page |
| **Order History** | Authenticated users view their past orders and commission requests in a profile page |
| **Admin Dashboard** | Admin-only route to track all orders and commissions, update their statuses, and view revenue metrics |
| **Email Notifications** | Automated transactional emails (order confirmations, commission notifications, status updates) via Resend |

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 14.2.35 | React framework with App Router, SSR, file-based routing |
| Language | TypeScript | ^5 | Static typing across the entire codebase |
| Styling | Tailwind CSS | ^3.4.1 | Utility-first CSS with a custom lavender palette |
| Database | Firebase Firestore | ^12.9 (client) / ^13.6 (admin) | NoSQL document store for artworks, orders, commissions, users |
| Auth | Firebase Authentication | (bundled with Firebase) | Email/password authentication |
| File Storage | Firebase Storage | (bundled with Firebase) | Commission reference image uploads |
| Payments | Stripe | ^20.4 (server) / ^8.8 (client) | Hosted checkout, webhook payment confirmation |
| Email | Resend | ^6.9 | Transactional emails for orders and commissions |
| State | Zustand | ^5.0 | Lightweight global cart state with localStorage persistence |
| Icons | Lucide React | ^0.575 | Consistent SVG icon set |
| Utilities | clsx + tailwind-merge | ^2.1.1 + ^3.5 | Safe Tailwind class merging |
| Font | Geist (local) | — | Variable sans-serif & mono fonts from Vercel |

---

## 3. Architecture Overview

```
Browser (React Client Components)
    │
    ├── AuthProvider (React Context) — tracks Firebase Auth state + Firestore role
    ├── ToastProvider (React Context) — global success/error notifications
    ├── Zustand Cart Store — persisted to localStorage
    │
    └── Next.js App Router Pages
            │
            ├── Client-side Firestore reads (artworks, user data)
            ├── /api/* routes (server-side: Stripe, Admin Firestore writes, Resend)
            └── Stripe hosted checkout (external redirect)

Firebase Cloud
    ├── Firestore — artworks / orders / commissions / users collections
    ├── Authentication — email/password user accounts
    └── Storage — commission reference images

Third-party Services
    ├── Stripe — payment processing & webhook events
    └── Resend — transactional email delivery
```

**Key architectural decisions:**

- **Client SDK vs Admin SDK**: The Firebase Client SDK is used in browser components for reading public data (artworks) and user-specific reads. The Firebase Admin SDK is used exclusively in API routes where security rules must be bypassed (e.g., the Stripe webhook writing order documents).
- **No server components for data**: All Firestore reads use React `useEffect` + `useState` in client components rather than React Server Components. This keeps the architecture simpler and avoids the complexity of streaming.
- **Zustand for cart**: Instead of React Context, Zustand is used for the cart because its `persist` middleware automatically syncs state to localStorage with zero boilerplate.
- **Stripe webhook pattern**: Payment confirmation is handled server-side via a Stripe webhook (`/api/webhook`), not by trusting the client redirect. This is the secure, industry-standard approach.

---

## 4. Environment Variables

The following variables must be set in `.env.local` for the app to function:

| Variable | Side | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase messaging sender |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | Firebase app ID |
| `NEXT_PUBLIC_BASE_URL` | Client | Full base URL (e.g., `http://localhost:3000`) |
| `FIREBASE_ADMIN_PROJECT_ID` | Server | Admin SDK — project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server | Admin SDK — service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server | Admin SDK — PEM private key |
| `STRIPE_SECRET_KEY` | Server | Stripe server-side secret key |
| `STRIPE_WEBHOOK_SECRET` | Server | Stripe webhook signing secret |
| `RESEND_API_KEY` | Server | Resend API key for email delivery |
| `ADMIN_EMAIL` | Server | Email address that receives commission notifications |
| `SEED_SECRET` | Server | Random string protecting the `/api/seed` endpoint |

> Variables prefixed with `NEXT_PUBLIC_` are embedded at build time and exposed to the browser. All other variables are only available at runtime on the server.

---

## 5. Configuration Files

### `next.config.mjs`
Next.js configuration. Defines **allowed external image domains** so `next/image` can optimize images from:
- `firebasestorage.googleapis.com` — artwork images stored in Firebase Storage
- `images.unsplash.com` — seed data placeholder images
- `via.placeholder.com` — generic placeholder fallback

### `tailwind.config.ts`
Extends the default Tailwind theme with a **custom lavender brand palette**:

| Token | Color | Usage |
|---|---|---|
| `primary` | `#B57EDC` (Lavender) | Buttons, links, badges, active states |
| `primary-light` | `#E6E6FA` | Section backgrounds, icon containers |
| `primary-dark` | `#9B59B6` | Hover states for primary elements |
| `secondary` | `#F3F4F6` | Card backgrounds, form areas |
| `accent` | `#1F2937` (Charcoal) | Primary text |
| `surface` | `#FFFFFF` | Page background |
| `muted` | `#6B7280` | Secondary/placeholder text |

Also defines:
- **Custom fonts**: `--font-geist-sans` and `--font-geist-mono` via CSS variables
- **Touch targets**: `min-h-touch: 44px` and `min-w-touch: 44px` for WCAG 2.5.5 compliance

### `tsconfig.json`
Standard Next.js TypeScript config with path alias `@/*` → `./src/*` for clean imports.

### `postcss.config.mjs`
Minimal PostCSS config required by Tailwind CSS (includes `tailwindcss` plugin).

### `firestore.rules`
Firebase Security Rules — see [Section 14](#14-firestore-security-rules).

---

## 6. Type System

**File**: `src/types/index.ts`

Defines all shared TypeScript interfaces used across pages, components, and API routes.

### `Artwork`
Represents a product in the shop.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Firestore document ID |
| `title` | `string` | Artwork name |
| `description` | `string` | Long-form description |
| `price` | `number` | Price in USD |
| `category` | enum | `"Painting"` / `"Digital"` / `"Sculpture"` / `"Mixed Media"` / `"Photography"` |
| `imageUrl` | `string` | Public image URL |
| `dimensions` | `string` | Physical or digital size (e.g., `"24 × 36 inches"`) |
| `medium` | `string` | e.g., `"Oil on canvas"` |
| `isFeatured` | `boolean` | Whether it appears in the home page featured section |
| `inStock` | `boolean` | Controls whether "Add to Cart" is enabled |
| `createdAt` | `Timestamp \| string` | Creation timestamp |

### `CartItem`
Extends `Artwork` with a `quantity: number` field. Stored in Zustand + localStorage.

### `Order`
Created in Firestore after a successful Stripe payment.

| Field | Description |
|---|---|
| `userId` | UID of the customer |
| `userEmail` | Customer email |
| `items` | Array of `OrderItem` |
| `total` | Total in USD |
| `status` | `"pending"` → `"paid"` → `"shipped"` → `"delivered"` / `"cancelled"` |
| `stripeSessionId` | Stripe checkout session ID for reconciliation |

### `OrderItem`
Lightweight copy of artwork data stored inside an `Order` (snapshot at time of purchase). Prevents order history from being affected by future artwork edits.

### `Commission`
A customer's request for custom artwork.

| Field | Description |
|---|---|
| `userId` | UID of the requester (empty string if anonymous) |
| `name` / `email` | Contact info |
| `description` | The customer's vision |
| `category` | Art category requested |
| `budget` | A pre-defined budget range string |
| `referenceImageUrls` | Array of Firebase Storage URLs |
| `status` | `"pending"` → `"in-progress"` → `"completed"` → `"delivered"` |
| `adminNotes` | Optional private notes from the admin |

### `UserProfile`
Stored in Firestore at `users/{uid}`. The `role` field drives admin access control.

| Field | Description |
|---|---|
| `uid` | Firebase Auth UID |
| `email` | User's email |
| `displayName` | Display name |
| `role` | `"customer"` (default) or `"admin"` (manually set) |

---

## 7. Pages & Routes

### Public Pages

#### `/` — Home Page
**File**: `src/app/page.tsx`

The landing page. Statically renders three sections using server components: `HeroSection`, `FeaturedArtworks`, and `ServicesOverview`. No authentication required.

---

#### `/shop` — Art Gallery
**File**: `src/app/shop/page.tsx`

A "use client" page. Fetches all artworks from Firestore on mount, then applies category filtering and price/date sorting entirely in the browser (`useMemo`). No extra API calls are made when filters change.

Features:
- Category filter buttons (All, Painting, Digital, Sculpture, Mixed Media, Photography)
- Sort dropdown (Newest, Price: Low → High, Price: High → Low)
- Responsive 1/2/3/4-column artwork grid
- Loading skeleton during Firestore fetch

---

#### `/shop/[id]` — Artwork Detail Page
**File**: `src/app/shop/[id]/page.tsx`

Dynamic route for individual artwork. Fetches a single artwork by document ID from Firestore. Displays full image, title, medium, dimensions, description, stock status, and price.

Actions:
- **Add to Cart**: Adds artwork to Zustand cart, shows success toast
- **Buy Now**: Adds to cart and navigates directly to `/cart`
- Shows loading skeletons and a "not found" state

---

#### `/cart` — Shopping Cart
**File**: `src/app/cart/page.tsx`

Reads items from the Zustand cart store. Shows a list of `CartItem` components on the left and a `CartSummary` sidebar on the right. Handles empty cart state with a call-to-action back to the shop. Includes a "Clear all" button.

---

#### `/checkout/success` — Payment Confirmation
**File**: `src/app/checkout/success/page.tsx`

Shown after Stripe redirects the customer back. On mount, clears the Zustand cart. Reads the `?session_id=` query param from the URL to display a truncated session ID. Provides links to the profile page and back to the shop.

---

#### `/commission` — Commission Request Form
**File**: `src/app/commission/page.tsx`

A server-rendered page with the process explanation (4 steps) and the `CommissionForm` client component. No authentication is required to submit a commission, but the form pre-populates the user's email if they are logged in.

---

#### `/auth/login` — Login Page
**File**: `src/app/auth/login/page.tsx`

Renders the `LoginForm` component. Includes a link to `/auth/signup`.

---

#### `/auth/signup` — Sign Up Page
**File**: `src/app/auth/signup/page.tsx`

Renders the `SignupForm` component. Includes a link to `/auth/login`.

---

#### `/profile` — User Profile & History
**File**: `src/app/profile/page.tsx`

Protected by `AuthGuard` — redirects unauthenticated visitors to `/auth/login`. Shows:
- User avatar, display name, and email
- Sign Out button
- Order history with status badges
- Commission request history with status badges
- Loading skeletons while fetching

Fetches the current user's orders and commissions in parallel from Firestore.

---

### Admin Pages (role-gated)

All admin routes are wrapped in `AuthGuard requireAdmin`. Non-admins see a 403 message; unauthenticated users are redirected to login.

#### `/admin` — Dashboard
**File**: `src/app/admin/page.tsx`

Fetches all orders and commissions in parallel and displays four summary metric cards:
- Total Orders
- Total Commissions
- Pending Items (orders not yet shipped + commissions not yet completed)
- Revenue (sum of non-cancelled orders)

---

#### `/admin/orders` — Order Management
**File**: `src/app/admin/orders/page.tsx`

Lists every order with customer email, item count, total, creation date, and current status. The admin can change any order's status via a `<select>` dropdown. Status changes are written to Firestore via `updateOrderStatus()` and reflected immediately in local React state without a page refresh.

---

#### `/admin/commissions` — Commission Management
**File**: `src/app/admin/commissions/page.tsx`

Lists all commission requests showing customer name/email, category, budget, description, and reference image thumbnails. Status can be updated; each change also fires a POST to `/api/commission/status` to send the customer an email notification.

---

### Special Next.js Files

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout — wraps every page with `AuthProvider`, `ToastProvider`, `Navbar`, and `Footer` |
| `src/app/loading.tsx` | Global loading UI — lavender spinner shown during route transitions |
| `src/app/not-found.tsx` | Custom 404 page with a "Back to Home" button |
| `src/app/globals.css` | Global CSS reset and Tailwind directives |

---

## 8. API Routes

All API routes are Next.js Route Handlers (`app/api/**/route.ts`) running on the server.

---

### `POST /api/checkout`
**File**: `src/app/api/checkout/route.ts`

Creates a Stripe Checkout Session and returns the hosted checkout URL.

**Request body**:
```json
{
  "items": [{ "id": "...", "title": "...", "price": 420, "quantity": 1, "imageUrl": "..." }],
  "userEmail": "customer@example.com"
}
```

**Process**:
1. Validates that `items` is a non-empty array
2. Maps each cart item into a Stripe `price_data` line item (converts USD to cents)
3. Creates a `checkout.sessions` object with `mode: "payment"`, success URL (`/checkout/success?session_id={id}`), and cancel URL (`/cart`)
4. Returns `{ url: "https://checkout.stripe.com/..." }` for client-side redirect

**Security**: No authentication check at this layer — the Stripe webhook is the source of truth for payment confirmation.

---

### `POST /api/webhook`
**File**: `src/app/api/webhook/route.ts`

Handles Stripe webhook events. This is the most security-critical route.

**Process**:
1. Reads the raw request body as text (required for signature verification)
2. Extracts the `stripe-signature` header
3. Calls `stripe.webhooks.constructEvent()` to cryptographically verify the payload using `STRIPE_WEBHOOK_SECRET`
4. On `checkout.session.completed`: retrieves line items, constructs an `Order` document, writes it to Firestore via the Admin SDK, and fires `sendOrderConfirmation()` (non-blocking)
5. Always returns HTTP 200 to prevent Stripe from retrying

**Security**: Signature verification with `STRIPE_WEBHOOK_SECRET` ensures only Stripe can trigger order creation. The raw body must not be parsed/modified before this check.

---

### `POST /api/commission`
**File**: `src/app/api/commission/route.ts`

Handles new commission form submissions.

**Request body**:
```json
{
  "userId": "...", "name": "Jane", "email": "jane@example.com",
  "description": "...", "category": "Painting", "budget": "$300 – $500",
  "referenceImageUrls": ["https://..."]
}
```

**Process**:
1. Validates required fields (`name`, `email`, `description`, `category`, `budget`)
2. Writes the commission document to Firestore via the Admin SDK (status defaults to `"pending"`)
3. Non-blockingly calls `sendCommissionNotification()` to email the admin
4. Returns `{ success: true, commissionId: "..." }`

---

### `POST /api/commission/status`
**File**: `src/app/api/commission/status/route.ts`

Sends an email to the customer when a commission status changes. Called from the admin commissions page.

**Request body**:
```json
{
  "commissionId": "...", "status": "in-progress",
  "userEmail": "customer@example.com", "userName": "Jane"
}
```

Calls `sendCommissionStatusUpdate()` from the Resend library. Returns `{ success: true }`.

---

### `POST /api/seed`
**File**: `src/app/api/seed/route.ts`

One-time database seeding endpoint protected by a shared secret.

**Request body**: `{ "secret": "YOUR_SEED_SECRET" }`

Reads `seed/artworks.json` and writes every artwork into Firestore as a batch operation. Returns the count of seeded documents.

**Security**: Compares `body.secret` against `process.env.SEED_SECRET`. Returns HTTP 401 on mismatch.

---

## 9. Components

### Layout Components

#### `src/components/layout/Navbar.tsx`
Responsive sticky navigation header.

- **Desktop**: Logo (left), navigation links (center), cart icon + auth button (right)
- **Mobile**: Logo + cart icon + hamburger button; nav links are hidden
- Cart badge shows item count from Zustand store (only visible when count > 0)
- Admin link is conditionally rendered for users with `isAdmin === true`
- Uses `useAuth()` for user state and `useCartStore()` for cart count

#### `src/components/layout/MobileMenu.tsx`
Slide-out drawer navigation for mobile screens.

- Fixed overlay with a dark backdrop click-to-close
- Locks `document.body` scroll while open
- Contains all nav links, cart link, profile/login link, and a sign-out button
- Hidden on `md:` and above screens (CSS-only, not JS-gated)

#### `src/components/layout/Footer.tsx`
Three-column footer (collapses to single column on mobile).
- Brand logo + tagline
- Navigation links column
- Account links (Profile, Sign In, Cart)
- Copyright year auto-calculated via `new Date().getFullYear()`

#### `src/components/layout/Container.tsx`
A simple wrapper `<div>` that enforces a consistent `max-w-7xl` max-width and horizontal padding (`px-4 sm:px-6 lg:px-8`) across all pages. Used as the outermost element inside every page's `<section>`.

---

### Home Components

#### `src/components/home/HeroSection.tsx`
Full-width hero section at the top of the landing page.

- Gradient background from `primary-light` through white
- Decorative blurred circle background element (purely decorative, `aria-hidden`)
- Headline with `<span>` accent for the key phrase
- Two CTA buttons: "Browse Gallery" (→ `/shop`) and "Request Commission" (→ `/commission`)
- Fully server-rendered (no client state needed)

#### `src/components/home/FeaturedArtworks.tsx`
"use client" — fetches artworks where `isFeatured === true` (limit 6) from Firestore on mount.

- Shows `ArtworkCardSkeleton` loading states during fetch
- Renders a 1/2/3-column responsive grid of artwork cards with image and price
- Shows an empty state if no artworks have been seeded yet
- "View All" link navigates to `/shop`

#### `src/components/home/ServicesOverview.tsx`
Static three-card grid highlighting the site's main services: Original Art, Custom Commissions, Art Consultation. Uses Lucide icons. Server-rendered.

---

### Shop Components

#### `src/components/shop/ArtworkCard.tsx`
Card component for a single artwork in the shop grid.

- Displays: artwork image (aspect 3:4), title, medium, price, "Add to Cart" button
- Clicking the card/image navigates to `/shop/[id]`
- "Add to Cart" button calls `useCartStore().addItem()` and shows a success toast
- Button is disabled (and shows `cursor-not-allowed`) when `artwork.inStock === false`
- The button's click handler calls `e.stopPropagation()` to prevent triggering the card's link

#### `src/components/shop/ArtworkGrid.tsx`
Responsive grid container that maps an `Artwork[]` array to `ArtworkCard` components.

- Layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Renders an empty-state message when the filtered list has zero results

#### `src/components/shop/FilterBar.tsx`
Controls for filtering and sorting artworks. Receives all state and handlers as props (controlled component).

- Category buttons rendered from `ART_CATEGORIES` constant; active button styled with `bg-primary`
- Sort `<select>` rendered from `SORT_OPTIONS` constant
- Category buttons are horizontally scrollable on mobile (`overflow-x-auto`)
- All interactive elements meet the 44px touch target requirement

---

### Cart Components

#### `src/components/cart/CartItem.tsx`
Represents a single item row in the cart page.

- Thumbnail image (80×80px on mobile, 96×96px on tablet+)
- Title, medium, and price
- Quantity controls: `[ − ]` `[n]` `[ + ]` buttons that call `useCartStore().updateQuantity()`
- Removing `(−)` below quantity 1 automatically removes the item via `removeItem()`
- Trash icon button for direct removal
- All buttons have `aria-label` attributes for screen readers

#### `src/components/cart/CartSummary.tsx`
Sticky order summary sidebar in the cart.

- Shows: subtotal, estimated tax (8% — display only, Stripe handles actual tax), free shipping, and grand total
- "Proceed to Checkout" button:
  - Redirects unauthenticated users to `/auth/login` with an error toast
  - Otherwise POSTs `items`, `userId`, and `userEmail` to `/api/checkout` and redirects to the returned Stripe URL
  - Shows a loading spinner while the API request is in flight
- "Secure checkout" trust badge with `ShieldCheck` icon

---

### Commission Components

#### `src/components/commission/CommissionForm.tsx`
Multi-field "use client" form for requesting custom artwork.

**Fields**:
- Full name, email address
- Art category (`<select>` from `ART_CATEGORIES`)
- Budget range (`<select>` from `BUDGET_RANGES`)
- Description (textarea, min 20 characters)
- Reference images (up to 3 files, validated for image MIME type and max 5 MB each)

**Submission flow**:
1. Client-side validation runs first; field errors are shown inline
2. Each selected image is uploaded to Firebase Storage under `commission-images/{userId}/`
3. The returned download URLs + form data are POSTed to `/api/commission`
4. On success, the form resets and a success toast is shown

Pre-fills `name` and `email` fields from `useAuth()` if the user is logged in.

---

### Auth Components

#### `src/components/auth/AuthGuard.tsx`
Higher-order component that wraps protected pages.

Props:
- `children` — the protected content to render
- `requireAdmin` (boolean, default `false`) — additionally checks `isAdmin`

Behavior:
- While `loading === true`: shows a centered lavender spinner
- If `user === null`: redirects to `/auth/login`
- If `requireAdmin && !isAdmin`: shows a 403 "Access Denied" message (does not redirect)
- Otherwise: renders `children`

#### `src/components/auth/LoginForm.tsx`
Email/password login form.

- Client-side validation (required field checks)
- Calls `signIn(email, password)` from `src/lib/firebase/auth.ts`
- Maps Firebase error codes to user-friendly messages (e.g., `"wrong-password"` → "Incorrect password")
- "Forgot Password" button calls `resetPassword(email)` and shows a toast
- Link to sign-up page

#### `src/components/auth/SignupForm.tsx`
New account creation form.

- Fields: Full Name, Email, Password, Confirm Password
- Validates: non-empty fields, password ≥ 6 characters, passwords match
- Calls `signUp(email, password, displayName)` which creates the Firebase Auth user **and** a Firestore `users/{uid}` document with `role: "customer"`
- Maps `"email-already-in-use"` and `"weak-password"` Firebase errors to inline field messages

---

### UI Primitive Components

#### `src/components/ui/Button.tsx`
Fully accessible, reusable button component built with `forwardRef`.

**Variants**:
| Variant | Appearance |
|---|---|
| `primary` | Lavender background, charcoal text |
| `secondary` | Light gray background |
| `outline` | Lavender border, lavender text; fills on hover |
| `ghost` | Transparent; gray background on hover |
| `danger` | Red background, white text |

**Sizes**: `sm`, `md`, `lg` — all enforce the 44px minimum touch target via `min-h-touch`.

**Loading prop**: When `loading={true}`, shows a `Loader2` spinner icon and disables the button.

Inherits all native `<button>` attributes and exposes a `ref`.

#### `src/components/ui/Input.tsx`
Accessible labeled input with error messaging.

- Automatically generates an `id` from the `label` text (e.g., `"Email Address"` → `id="email-address"`)
- Links the `<label>` via `htmlFor` and the error message via `aria-describedby`
- Sets `aria-invalid={true}` when an error is present
- Red border + red error message when `error` prop is provided
- Enforces 44px min-height touch target

#### `src/components/ui/Badge.tsx`
Color-coded status pill for order/commission statuses.

Pre-defined color map:
| Status | Colors |
|---|---|
| `pending` | Yellow |
| `paid` | Green |
| `in-progress` | Blue |
| `completed` | Purple |
| `delivered` | Green |
| `shipped` | Blue |
| `cancelled` | Red |

Falls back to gray for unknown statuses.

#### `src/components/ui/Skeleton.tsx`
Animated loading placeholder (`animate-pulse` pulsing gray rectangle).

Exports:
- `Skeleton` — generic skeleton with configurable `className`
- `ArtworkCardSkeleton` — pre-composed skeleton matching an `ArtworkCard`'s layout (image + title + price + button placeholders)

#### `src/components/ui/Toast.tsx`
A global notification system built with React Context.

**ToastProvider**: Wraps the app (in `layout.tsx`). Maintains an array of active toast messages. Fixed container in the bottom-right corner of the viewport.

**`useToast()` hook**: Returns `{ success(msg), error(msg), showToast(msg, type) }`.

Each `ToastItem`:
- Auto-dismisses after 4 seconds
- Shows a `CheckCircle` icon (green) for success, `XCircle` (red) for error
- Has a manual close `×` button
- `role="alert"` for accessibility; the container has `aria-live="polite"`

---

## 10. Library & Services

### Firebase Client SDK
**File**: `src/lib/firebase/client.ts`

Initializes the Firebase app for browser use with the public config. Uses a **singleton pattern** (`getApps().length === 0`) so the app is only initialized once even when this module is imported by multiple components.

Exports: `auth`, `db`, `storage`, and `default` (the Firebase App instance).

---

### Firebase Admin SDK
**File**: `src/lib/firebase/admin.ts`

Server-only initialization of the Firebase Admin SDK using service account credentials from environment variables.

Uses **lazy initialization** — the Admin app is created only on first access, not at module import time. This prevents build-time errors when environment variables are absent (e.g., during `next build` in CI).

Exports:
- `getAdminDb()` — returns an initialized `Firestore` instance
- `getAdminAuth()` — returns an initialized `Auth` instance

**IMPORTANT**: Only import from API routes (`src/app/api/**`). Never import in client components. The Admin SDK bypasses Firestore Security Rules.

---

### Firestore CRUD Helpers
**File**: `src/lib/firebase/firestore.ts`

Typed wrapper functions for all Firestore operations. All functions use the Client SDK and operate within Firestore Security Rules.

**Artworks**:
| Function | Description |
|---|---|
| `getArtworks(category?)` | Fetch all artworks, optionally filtered by category, ordered by `createdAt` desc |
| `getFeaturedArtworks()` | Fetch up to 6 artworks where `isFeatured === true` |
| `getArtwork(id)` | Fetch a single artwork; returns `null` if not found |

**Orders**:
| Function | Description |
|---|---|
| `getUserOrders(userId)` | Fetch all orders for a specific user |
| `getAllOrders()` | Fetch all orders (admin use) |
| `updateOrderStatus(orderId, status)` | Update an order's status field |

**Commissions**:
| Function | Description |
|---|---|
| `createCommission(data)` | Create a new commission document; adds `status: "pending"` and `serverTimestamp()` |
| `getUserCommissions(userId)` | Fetch commissions belonging to a specific user |
| `getAllCommissions()` | Fetch all commissions (admin use) |
| `updateCommissionStatus(commissionId, status)` | Update a commission's status |

**Users**:
| Function | Description |
|---|---|
| `getUserProfile(uid)` | Fetch a user's Firestore profile |

---

### Firebase Authentication Helpers
**File**: `src/lib/firebase/auth.ts`

Thin wrappers around Firebase Auth methods.

| Function | Description |
|---|---|
| `signUp(email, password, displayName)` | Creates Auth user + Firestore `users/{uid}` profile with `role: "customer"` |
| `signIn(email, password)` | Signs in with email/password |
| `signOut()` | Signs out the current user |
| `resetPassword(email)` | Sends a password reset email |

---

### Firebase Storage Helpers
**File**: `src/lib/firebase/storage.ts`

| Function | Description |
|---|---|
| `uploadImage(file, path)` | Uploads a `File` to Firebase Storage, returns the public download URL. File name is prefixed with a timestamp to prevent collisions. |
| `deleteImage(url)` | Deletes a file from Storage by its full URL |

Used by `CommissionForm` to upload reference images before submitting the commission, storing them under `commission-images/{userId}/{timestamp}_{filename}`.

---

### Stripe
**File**: `src/lib/stripe.ts`

**Server-only.** Exports `getStripe()` — a lazy-initialized `Stripe` instance configured with `STRIPE_SECRET_KEY`. Used in `/api/checkout` (creating sessions) and `/api/webhook` (verifying events and retrieving line items).

The `@stripe/stripe-js` client library (`^8.8.0`) is listed as a dependency for potential future use of Stripe Elements (currently the app uses hosted checkout redirect).

---

### Resend Email
**File**: `src/lib/resend.ts`

**Server-only.** Wraps the Resend SDK for transactional email delivery.

| Function | Trigger | Recipient |
|---|---|---|
| `sendOrderConfirmation()` | Stripe webhook `checkout.session.completed` | Customer |
| `sendCommissionNotification()` | `/api/commission` POST | Admin (`ADMIN_EMAIL`) |
| `sendCommissionStatusUpdate()` | `/api/commission/status` POST | Customer |

All emails are sent from `FROM_EMAIL` (`"Art Gallery <onboarding@resend.dev>"`). In production, this should be changed to a verified custom domain in the Resend dashboard.

Email failures are caught and logged but never allowed to block the primary operation (order creation, commission submission, status update).

---

## 11. State Management

### Zustand Cart Store
**File**: `src/stores/cartStore.ts`

The cart is the only piece of global state that doesn't live in React Context. Zustand was chosen for its tiny footprint and built-in `persist` middleware.

**State shape**:
```typescript
{
  items: CartItem[];
  addItem(artwork: Artwork): void;
  removeItem(artworkId: string): void;
  updateQuantity(artworkId: string, quantity: number): void;
  clearCart(): void;
  totalItems(): number;
  totalPrice(): number;
}
```

**Behaviors**:
- `addItem`: checks if the artwork is already in the cart; if yes, increments quantity by 1; if no, adds with `quantity: 1`
- `updateQuantity`: if the new quantity is ≤ 0, delegates to `removeItem`
- `persist` middleware automatically serializes/deserializes `items` to/from `localStorage` key `"cart-storage"`

**Usage**:
```typescript
const { items, addItem, totalItems } = useCartStore();
// Or with a selector (avoids unnecessary re-renders):
const totalItems = useCartStore((s) => s.totalItems);
```

---

## 12. Providers

### AuthProvider
**File**: `src/providers/AuthProvider.tsx`

A React Context provider that tracks Firebase Authentication state for the entire app.

**Context value**:
| Property | Type | Description |
|---|---|---|
| `user` | `User \| null` | Firebase Auth user object |
| `profile` | `UserProfile \| null` | Firestore profile including `role` |
| `loading` | `boolean` | True while Firebase is checking session |
| `isAdmin` | `boolean` | Shortcut for `profile.role === "admin"` |

**`useAuth()` hook**: Reads the context. Throws if used outside `AuthProvider`.

**Mechanism**: `onAuthStateChanged` listens for Firebase Auth state changes (login, logout, token refresh). When a user logs in, the provider fetches their Firestore `users/{uid}` document to get the `role` field. This profile is cleared on logout.

Placed in the root `layout.tsx` so every page and component has access.

### ToastProvider
**File**: `src/components/ui/Toast.tsx`

Also placed in root `layout.tsx`. Manages the array of active toast notifications and renders them in a fixed bottom-right container. See [UI Primitive Components](#ui-primitive-components) for details.

---

## 13. Utilities

### `src/utils/cn.ts`
```typescript
export function cn(...inputs: ClassValue[]): string
```
Combines `clsx` (conditional class names) with `tailwind-merge` (removes conflicting Tailwind classes). Used throughout every component.

**Example**: `cn("px-4 py-2", isActive && "bg-primary", className)` safely merges classes from all sources without duplication conflicts.

---

### `src/utils/formatPrice.ts`
```typescript
export function formatPrice(price: number): string
```
Formats a number as a USD currency string using the browser's `Intl.NumberFormat` API.
- Input: `420` → Output: `"$420.00"`
- Input: `1234.5` → Output: `"$1,234.50"`

---

### `src/utils/constants.ts`
Central definition of all site-wide constants, preventing magic strings scattered across the codebase.

| Export | Type | Value |
|---|---|---|
| `SITE_NAME` | string | `"Artisan Gallery"` |
| `SITE_DESCRIPTION` | string | Site tagline |
| `NAV_LINKS` | readonly array | Home, Shop, Commissions — path/label pairs |
| `ART_CATEGORIES` | readonly array | All, Painting, Digital, Sculpture, Mixed Media, Photography |
| `SORT_OPTIONS` | readonly array | Newest, Price Low→High, Price High→Low |
| `BUDGET_RANGES` | readonly array | Under $100 … $2,500+ |
| `COMMISSION_STATUSES` | readonly array | pending, in-progress, completed, delivered |
| `ORDER_STATUSES` | readonly array | pending, paid, shipped, delivered, cancelled |

---

## 14. Firestore Security Rules

**File**: `firestore.rules`

Deployed with `firebase deploy --only firestore:rules`.

### Helper functions

```javascript
isAuthenticated()  // request.auth != null
isOwner(userId)    // authenticated AND request.auth.uid == userId
isAdmin()          // authenticated AND users/{uid}.role == "admin"
```

Note: `isAdmin()` performs a Firestore `get()` call inside rules, which counts against read quotas.

### Collection Rules Summary

| Collection | Read | Write |
|---|---|---|
| `artworks` | Public (anyone) | Admin only |
| `orders` | Owner or Admin | Create: authenticated; Update: Admin; Delete: never |
| `commissions` | Owner or Admin | Create: authenticated; Update: Owner or Admin; Delete: never |
| `users` | Owner or Admin | Owner (own profile) or Admin |

**Key design choices**:
- Artworks are publicly readable so unauthenticated visitors can browse the shop
- Orders are only written server-side via the Admin SDK (Stripe webhook); the client `allow create` is a fallback
- Documents are never deleted — cancellation changes a status field

---

## 15. Seed Data & Seeding

### `seed/artworks.json`
A JSON array of 10+ sample artwork objects covering all five categories (Painting, Digital, Sculpture, Mixed Media, Photography). Each entry matches the `Artwork` interface (minus `id` and `createdAt`, which are added at write time). Images reference Unsplash stock photos.

### `seed/seed.ts`
A standalone Node.js script (run outside Next.js) that populates the Firestore `artworks` collection.

**Usage**:
```bash
npx tsx seed/seed.ts
```

- Loads `.env.local` via `dotenv`
- Validates that `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY` are set
- Writes all artworks in a single Firestore batch operation for atomicity
- Prints a success summary

**Alternative method**: POST to `/api/seed` with the `SEED_SECRET` value (useful for seeding from a deployed environment without local CLI access).

---

## 16. Key Data Flows

### Purchase Flow

```
Customer adds items to cart (Zustand store / localStorage)
    │
Customer clicks "Proceed to Checkout" in CartSummary
    │
POST /api/checkout  →  Stripe creates Checkout Session
    │
Redirect to Stripe hosted checkout page (external)
    │
Customer pays → Stripe sends webhook to POST /api/webhook
    │
Webhook: verifies signature → writes Order to Firestore → sends confirmation email
    │
Stripe redirects to /checkout/success?session_id=...
    │
Page loads → Zustand clearCart() → show confirmation UI
```

### Commission Flow

```
Customer fills CommissionForm
    │
Images uploaded to Firebase Storage  →  returns download URLs
    │
POST /api/commission  →  writes Commission to Firestore (status: "pending")
    │
Resend sends notification email to admin
    │
Admin opens /admin/commissions → changes status
    │
POST /api/commission/status  →  Resend sends status update email to customer
```

### Authentication Flow

```
User submits SignupForm
    │
Firebase Auth creates account
    │
Firestore creates users/{uid} with role: "customer"
    │
onAuthStateChanged fires in AuthProvider
    │
AuthProvider fetches users/{uid} → sets profile + isAdmin in context
    │
All components using useAuth() re-render with new user state
```

---

## 17. Folder Structure Reference

```
/
├── firestore.rules              # Firestore Security Rules
├── next.config.mjs              # Next.js config (image domains)
├── package.json                 # Dependencies & scripts
├── postcss.config.mjs           # PostCSS (Tailwind)
├── tailwind.config.ts           # Tailwind theme (lavender palette)
├── tsconfig.json                # TypeScript config
│
├── seed/
│   ├── artworks.json            # Sample artwork data (10+ entries)
│   └── seed.ts                  # Standalone Firestore seeding script
│
└── src/
    ├── app/                     # Next.js App Router
    │   ├── globals.css          # Global styles & Tailwind directives
    │   ├── layout.tsx           # Root layout (Auth, Toast, Navbar, Footer)
    │   ├── loading.tsx          # Global loading spinner
    │   ├── not-found.tsx        # Custom 404 page
    │   ├── page.tsx             # Home page (Hero + Featured + Services)
    │   ├── admin/
    │   │   ├── layout.tsx       # Admin shell (AuthGuard + sidebar)
    │   │   ├── page.tsx         # Admin dashboard (metrics)
    │   │   ├── commissions/page.tsx   # Commission management
    │   │   └── orders/page.tsx        # Order management
    │   ├── api/
    │   │   ├── checkout/route.ts      # Stripe checkout session creation
    │   │   ├── commission/route.ts    # New commission submission
    │   │   ├── commission/status/route.ts  # Commission status email
    │   │   ├── seed/route.ts          # Firestore seeding endpoint
    │   │   └── webhook/route.ts       # Stripe payment webhook
    │   ├── auth/
    │   │   ├── login/page.tsx         # Login page
    │   │   └── signup/page.tsx        # Signup page
    │   ├── cart/page.tsx              # Shopping cart
    │   ├── checkout/success/page.tsx  # Payment success confirmation
    │   ├── commission/page.tsx        # Commission request page
    │   ├── profile/page.tsx           # User profile & history
    │   └── shop/
    │       ├── page.tsx               # Art gallery (filter + grid)
    │       └── [id]/page.tsx          # Artwork detail page
    │
    ├── components/
    │   ├── auth/
    │   │   ├── AuthGuard.tsx    # Route protection HOC
    │   │   ├── LoginForm.tsx    # Email/password login
    │   │   └── SignupForm.tsx   # Account creation form
    │   ├── cart/
    │   │   ├── CartItem.tsx     # Cart row with quantity controls
    │   │   └── CartSummary.tsx  # Order summary + checkout button
    │   ├── commission/
    │   │   └── CommissionForm.tsx  # Commission request form
    │   ├── home/
    │   │   ├── FeaturedArtworks.tsx  # Featured artwork grid (client)
    │   │   ├── HeroSection.tsx       # Hero banner (server)
    │   │   └── ServicesOverview.tsx  # Services cards (server)
    │   ├── layout/
    │   │   ├── Container.tsx    # Max-width page wrapper
    │   │   ├── Footer.tsx       # Site footer
    │   │   ├── MobileMenu.tsx   # Slide-out mobile nav drawer
    │   │   └── Navbar.tsx       # Sticky navigation header
    │   ├── shop/
    │   │   ├── ArtworkCard.tsx  # Individual artwork card
    │   │   ├── ArtworkGrid.tsx  # Responsive grid of artwork cards
    │   │   └── FilterBar.tsx    # Category + sort controls
    │   └── ui/
    │       ├── Badge.tsx        # Status pill (color-coded)
    │       ├── Button.tsx       # Multi-variant accessible button
    │       ├── Input.tsx        # Labeled input with error state
    │       ├── Skeleton.tsx     # Loading placeholder animations
    │       └── Toast.tsx        # Global notification system
    │
    ├── lib/
    │   ├── resend.ts            # Email functions (order/commission)
    │   ├── stripe.ts            # Stripe server instance
    │   └── firebase/
    │       ├── admin.ts         # Firebase Admin SDK (server-only)
    │       ├── auth.ts          # Auth helper functions
    │       ├── client.ts        # Firebase Client SDK (browser)
    │       ├── firestore.ts     # Typed Firestore CRUD helpers
    │       └── storage.ts       # File upload/delete helpers
    │
    ├── providers/
    │   └── AuthProvider.tsx     # Auth state context + useAuth() hook
    │
    ├── stores/
    │   └── cartStore.ts         # Zustand cart store with persistence
    │
    ├── types/
    │   └── index.ts             # TypeScript interfaces (Artwork, Order, etc.)
    │
    └── utils/
        ├── cn.ts                # Tailwind class merging utility
        ├── constants.ts         # Site-wide constants (nav, categories, etc.)
        └── formatPrice.ts       # USD currency formatter
```
