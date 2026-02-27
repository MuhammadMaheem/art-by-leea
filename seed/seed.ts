/**
 * seed/seed.ts — Standalone Firestore seeding script.
 *
 * Run with:  npx tsx seed/seed.ts
 *
 * Reads artworks.json and pushes each item into the Firestore
 * "artworks" collection. Uses the same FIREBASE_ADMIN_* env vars
 * as the rest of the app.
 *
 * Alternative: Use the /api/seed endpoint (POST with secret).
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import artworks from "./artworks.json";

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

// Initialize Firebase Admin if not already initialised
if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "❌ Missing Firebase Admin credentials in .env.local.\n" +
      "   Make sure these are set:\n" +
      "   - FIREBASE_ADMIN_PROJECT_ID\n" +
      "   - FIREBASE_ADMIN_CLIENT_EMAIL\n" +
      "   - FIREBASE_ADMIN_PRIVATE_KEY"
    );
    process.exit(1);
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Replace literal \n with actual newlines (needed for PEM keys)
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function seed() {
  console.log(`🌱 Seeding ${artworks.length} artworks into Firestore...\n`);

  const batch = db.batch();
  const collectionRef = db.collection("artworks");

  for (const artwork of artworks) {
    const docRef = collectionRef.doc();
    batch.set(docRef, {
      ...artwork,
      createdAt: new Date(),
    });
    console.log(`  + ${artwork.title}`);
  }

  await batch.commit();
  console.log(
    `\n✅ Successfully seeded ${artworks.length} artworks into Firestore!`
  );
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
