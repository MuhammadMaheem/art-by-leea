# Artisan Gallery — Complete Setup Guide

Everything you need to get the app running locally, step by step.

---

## Prerequisites

Make sure you have these installed:

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A Google account** — For Firebase (free)
- **A Stripe account** — [Sign up free](https://dashboard.stripe.com/register)
- **A Resend account** — [Sign up free](https://resend.com/signup)

---

## Step 1: Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

---

## Step 2: Set Up Firebase (Free Spark Plan)

### 2a. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Enter a project name (e.g., `artisan-gallery`)
4. **Disable** Google Analytics (not needed) → Click **"Create project"**
5. Wait for it to finish → Click **"Continue"**

### 2b. Enable Authentication

1. In the Firebase console sidebar, click **"Build" → "Authentication"**
2. Click **"Get started"**
3. Under **Sign-in providers**, click **"Email/Password"**
4. Toggle **"Enable"** to ON
5. Leave "Email link (passwordless sign-in)" **disabled**
6. Click **"Save"**

### 2c. Create Firestore Database

1. In the sidebar, click **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Choose a location closest to you (e.g., `us-central1` for US)
4. Select **"Start in test mode"** (we'll add security rules later)
5. Click **"Create"**

### 2d. Enable Cloud Storage

1. In the sidebar, click **"Build" → "Storage"**
2. Click **"Get started"**
3. Select **"Start in test mode"** → Click **"Next"**
4. Choose the same location as Firestore → Click **"Done"**

### 2e. Register a Web App & Get Client Keys

1. In the sidebar, click the **gear icon** ⚙️ → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **web icon** `</>` (Add app)
4. Enter a nickname (e.g., `artisan-gallery-web`)
5. **Don't** check "Firebase Hosting" — Click **"Register app"**
6. You'll see a code block with your Firebase config. **Copy these values**:

```
apiKey: "AIza..."
authDomain: "your-project.firebaseapp.com"
projectId: "your-project-id"
storageBucket: "your-project-id.firebasestorage.app"
messagingSenderId: "123456789"
appId: "1:123456789:web:abc123"
```

7. Click **"Continue to console"**

### 2f. Generate Admin SDK Private Key

1. Still in **"Project settings"**, click the **"Service accounts"** tab
2. Make sure **"Firebase Admin SDK"** is selected
3. Click **"Generate new private key"** → Click **"Generate key"**
4. A JSON file will download. **Keep it safe — don't share or commit it!**
5. Open the JSON file and note these three values:
   - `project_id`
   - `client_email`
   - `private_key` (the long string starting with `-----BEGIN PRIVATE KEY-----`)

---

## Step 3: Set Up Stripe (Free — Test Mode)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in **TEST MODE** (toggle in the top-right)
3. Go to **"Developers" → "API keys"**
4. Copy these two values:
   - **Publishable key** — starts with `pk_test_`
   - **Secret key** — click "Reveal test key", starts with `sk_test_`

### Stripe Webhook (for local development)

Option A — **Stripe CLI** (recommended):

1. Install the Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Linux (Debian/Ubuntu)
   curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
   echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
   sudo apt update && sudo apt install stripe

   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```
2. Log in to Stripe CLI:
   ```bash
   stripe login
   ```
3. Start listening for webhooks (run this in a **separate terminal**):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
4. It will print a **webhook signing secret** starting with `whsec_` — copy it

Option B — **Skip webhooks for now** (orders won't be created automatically after payment, but everything else works). You can set `STRIPE_WEBHOOK_SECRET=whsec_placeholder` temporarily.

---

## Step 4: Set Up Resend (Free — 100 emails/day)

1. Go to [Resend Dashboard](https://resend.com/)
2. Sign up / log in
3. Go to **"API Keys"** in the sidebar
4. Click **"Create API Key"**
5. Name it (e.g., `artisan-gallery`) → Permission: **"Full access"** → Click **"Add"**
6. Copy the API key (starts with `re_`)

> **Note:** On the free plan, you can only send emails to your own email address. This is fine for testing. To send to other addresses, you'd add and verify a custom domain.

---

## Step 5: Create Your .env.local File

1. In the project root, copy the example file:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` in your editor and fill in ALL the values:

```env
# ──── Firebase Client SDK ────────────────────────────────────────────────────
# Paste the values from Step 2e
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# ──── Firebase Admin SDK ─────────────────────────────────────────────────────
# Paste the values from Step 2f (from the downloaded JSON)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...paste-your-full-key-here...\n-----END PRIVATE KEY-----\n"

# ──── Stripe ─────────────────────────────────────────────────────────────────
# Paste the values from Step 3
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...your-publishable-key
STRIPE_SECRET_KEY=sk_test_...your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_...your-webhook-secret

# ──── Resend ─────────────────────────────────────────────────────────────────
# Paste the value from Step 4
RESEND_API_KEY=re_...your-resend-api-key

# ──── App Config ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_EMAIL=your-email@example.com
SEED_SECRET=my-secret-seed-phrase-123
```

### Important notes for the private key:

- Wrap the entire key in **double quotes** `"..."`
- Keep the `\n` characters as-is (don't replace them with actual newlines)
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts

---

## Step 6: Seed Sample Artworks

With your `.env.local` configured, seed the database with sample art:

**Option A — Using the API endpoint:**

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "my-secret-seed-phrase-123"}'
```

(Replace `my-secret-seed-phrase-123` with whatever you set as `SEED_SECRET`)

> You need the dev server running first (Step 7) before calling this endpoint.

**Option B — Using the seed script directly:**

```bash
npx tsx seed/seed.ts
```

This connects directly to Firestore and doesn't need the dev server running.

---

## Step 7: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 8: Create Your Admin Account

1. Go to [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
2. Sign up with your email and password
3. Now you need to make yourself an admin. Go to [Firebase Console](https://console.firebase.google.com/) → Your project → **Firestore Database**
4. Click on the **"users"** collection
5. Find the document with your email
6. Click on the `role` field → Change it from `"customer"` to `"admin"`
7. Click **"Update"**
8. Refresh your browser — you should now see the **"Admin"** link in the navbar

---

## Step 9: Deploy Firestore Security Rules (Optional but Recommended)

The project includes a `firestore.rules` file. To deploy it:

1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in:
   ```bash
   firebase login
   ```
3. Initialize Firebase in the project (select only Firestore):
   ```bash
   firebase init firestore
   ```
   - Select your existing project
   - Accept defaults for rules file (`firestore.rules`) and indexes
4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## Quick Reference: Test the Full Flow

1. **Browse art:** Go to `/shop` — you should see the seeded artworks
2. **Add to cart:** Click "Add to Cart" on any artwork
3. **Checkout:** Go to `/cart` → Click "Proceed to Checkout"
4. **Stripe test payment:** Use card number `4242 4242 4242 4242`, any future expiry, any CVC
5. **Commission:** Go to `/commission` → Fill out and submit the form
6. **Admin panel:** Go to `/admin` → View orders and commissions, update statuses

---

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
→ Your `NEXT_PUBLIC_FIREBASE_API_KEY` is wrong or empty. Double-check it in `.env.local`.

### "Firebase: Error (auth/configuration-not-found)"
→ You haven't enabled Email/Password authentication in Firebase Console (Step 2b).

### "Firestore permission denied"
→ Your Firestore is no longer in test mode. Deploy the security rules (Step 9).

### Stripe checkout doesn't redirect
→ Make sure `NEXT_PUBLIC_BASE_URL` is set to `http://localhost:3000`.

### Stripe webhook not working / orders not appearing
→ Make sure `stripe listen --forward-to localhost:3000/api/webhook` is running in a separate terminal and that `STRIPE_WEBHOOK_SECRET` matches the `whsec_` value it prints.

### Emails not sending
→ On Resend free tier, emails can only be sent to the address you signed up with. Check the Resend dashboard for delivery logs.

### Build errors about missing env vars
→ The app needs real Firebase keys to pre-render pages. Make sure `.env.local` is filled in before running `npm run build`.

### Storage CORS errors when uploading images
→ Go to Firebase Console → Storage → Rules → Make sure reads/writes are allowed for authenticated users.

---

## Costs Summary (All Free Tier)

| Service | Free Tier Limits |
|---------|-----------------|
| **Firebase Auth** | 50,000 monthly active users |
| **Firestore** | 1 GB storage, 50K reads/day, 20K writes/day |
| **Firebase Storage** | 5 GB storage, 1 GB/day download |
| **Stripe** | No monthly fees, 2.9% + 30¢ per transaction |
| **Resend** | 100 emails/day, 3,000/month |
| **Vercel** (hosting) | 100 GB bandwidth/month |

You will NOT be charged anything for development and light production use.
