/**
 * Firebase Admin SDK — Server-side initialization.
 *
 * Used ONLY in API routes (src/app/api/*) and server actions, NEVER in
 * client components. The Admin SDK bypasses Firestore Security Rules,
 * which is needed for operations like Stripe webhook handlers writing
 * orders or the seed script populating data.
 *
 * The private key is stored in FIREBASE_ADMIN_PRIVATE_KEY env variable.
 * On Vercel, multiline strings are handled automatically; locally you
 * may need to replace escaped \\n with real newlines.
 *
 * Uses lazy initialisation to avoid build-time errors when env vars
 * are not present.
 */
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { NextRequest } from "next/server";

/** Lazy initialise the admin app on first access */
function getAdminApp(): App {
  if (getApps().length === 0) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Replace literal \n with newline characters (needed for PEM keys)
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
    });
  }
  return getApps()[0];
}

/** Lazy-initialised Admin Firestore */
let _adminDb: Firestore | null = null;
export function getAdminDb(): Firestore {
  if (!_adminDb) {
    getAdminApp();
    _adminDb = getFirestore();
  }
  return _adminDb;
}

/** Lazy-initialised Admin Auth */
let _adminAuth: Auth | null = null;
export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    getAdminApp();
    _adminAuth = getAuth();
  }
  return _adminAuth;
}

/**
 * Verify that the request is from an authenticated admin user.
 * Extracts the Bearer token from Authorization header, verifies it,
 * then checks the user's Firestore profile for admin role.
 *
 * @returns The decoded token's uid and email on success
 * @throws Error with message suitable for API response
 */
export async function verifyAdmin(request: NextRequest): Promise<{ uid: string; email: string }> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split("Bearer ")[1];
  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = await getAdminAuth().verifyIdToken(token);
  const userDoc = await getAdminDb().collection("users").doc(decoded.uid).get();
  if (userDoc.data()?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { uid: decoded.uid, email: decoded.email || "" };
}
