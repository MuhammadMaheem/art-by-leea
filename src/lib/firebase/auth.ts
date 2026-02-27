/**
 * Firebase Authentication Helpers — Client-side auth operations.
 *
 * Wraps Firebase Auth methods with error handling. These functions are
 * called from LoginForm, SignupForm, and the AuthProvider.
 *
 * Note: We use Email/Password auth only (no SMS/phone to avoid costs).
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";

/**
 * Sign up a new user with email and password.
 * Also creates a Firestore user profile document at users/{uid}.
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  // 1. Create the Firebase Auth account
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  // 2. Set the display name on the Auth profile
  await updateProfile(user, { displayName });

  // 3. Create a Firestore document for the user profile
  //    This stores the role field used for admin access control
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    role: "customer", // Default role; manually set to "admin" for admin users
    createdAt: serverTimestamp(),
  });

  return user;
}

/**
 * Sign in an existing user with email and password.
 */
export async function signIn(
  email: string,
  password: string
): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Change the current user's password.
 * Requires re-authentication with the current password first.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("No authenticated user");

  // Re-authenticate before changing password
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

/**
 * Sign in (or sign up) with Google via a popup.
 * Creates a Firestore user profile if one doesn't exist yet.
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);

  // Create Firestore profile if this is the user's first login
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Google User",
      role: "customer",
      createdAt: serverTimestamp(),
    });
  }

  return user;
}
