/**
 * AuthProvider — Manages Firebase authentication state.
 *
 * Wraps the app and provides the current user, loading state, and
 * user role (from Firestore) to all child components via React Context.
 *
 * Usage: Wrap <AuthProvider> around your app in layout.tsx, then use
 * the useAuth() hook in any component to access auth state.
 */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import type { UserProfile } from "@/types";

/** Shape of the auth context value */
interface AuthContextValue {
  user: User | null;           // Firebase Auth user object
  profile: UserProfile | null; // Firestore user profile (includes role)
  loading: boolean;            // True while checking auth state
  isAdmin: boolean;            // True when admin AND in admin view mode
  viewMode: "admin" | "customer"; // Current view mode for admins
  setViewMode: (mode: "admin" | "customer") => void;
}

// Create context with safe defaults
const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  viewMode: "admin",
  setViewMode: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<"admin" | "customer">("admin");

  // Load saved view mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("adminViewMode");
    if (saved === "customer" || saved === "admin") {
      setViewModeState(saved);
    }
  }, []);

  const setViewMode = (mode: "admin" | "customer") => {
    setViewModeState(mode);
    localStorage.setItem("adminViewMode", mode);
  };

  useEffect(() => {
    // Listen to Firebase Auth state changes (login, logout, token refresh)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // User is logged in — fetch their Firestore profile for role info
        try {
          const profileDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        // User is logged out
        setProfile(null);
      }

      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const isAdmin = profile?.role === "admin" && viewMode === "admin";

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, viewMode, setViewMode }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth() — Access the current auth state from any component.
 *
 * Returns: { user, profile, loading, isAdmin }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
