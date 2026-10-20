"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { api, setToken, getToken } from "./api";
import type { User } from "./types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  syncBackendUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUserFromFirebase(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
    email: fbUser.email || "",
    role: "USER",
    isActive: true,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    photoURL: fbUser.photoURL,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase user with backend to obtain backend JWT token
  const syncWithBackend = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const data = await api<{ user: User; token: string }>("/api/auth/firebase-sync", {
        method: "POST",
        body: JSON.stringify({
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          uid: fbUser.uid,
        }),
      });
      setToken(data.token);
      setUser({ ...data.user, photoURL: fbUser.photoURL || undefined });
      return data.user;
    } catch {
      const fallback = buildUserFromFirebase(fbUser);
      setUser(fallback);
      return fallback;
    }
  }, []);

  // Sync / refresh user with backend if available
  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: User }>("/api/auth/me");
      setUser(data.user);
      return;
    } catch {
      const current = auth.currentUser;
      if (current) {
        await syncWithBackend(current);
      } else {
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [syncWithBackend]);

  const syncBackendUser = useCallback(async () => {
    const current = auth.currentUser;
    if (current) {
      await syncWithBackend(current);
    }
  }, [syncWithBackend]);

  // Listen to Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await syncWithBackend(fbUser);
      } else {
        // No Firebase user; check if legacy backend session exists
        const token = getToken();
        if (token) {
          try {
            const data = await api<{ user: User }>("/api/auth/me");
            setUser(data.user);
            setLoading(false);
            return;
          } catch {
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncWithBackend]);

  // Real Email/Password login using Firebase Authentication
  const login = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await syncWithBackend(cred.user);
    },
    [syncWithBackend],
  );

  // Real Email/Password signup using Firebase Authentication
  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      await syncWithBackend(cred.user);
    },
    [syncWithBackend],
  );

  // Real Google Sign-In using Firebase Authentication
  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncWithBackend(cred.user);
  }, [syncWithBackend]);

  // Real Sign Out using Firebase Authentication
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // Continue cleanup
    }
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore backend logout errors if offline
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, loginWithGoogle, logout, refresh, syncBackendUser }),
    [user, loading, login, signup, loginWithGoogle, logout, refresh, syncBackendUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
