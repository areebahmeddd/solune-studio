"use client";

import type React from "react";

import { auth } from "@/lib/firebase";
import {
  getRolePermissions,
  getUserRole,
  type RolePermissions,
  type UserRole,
} from "@/lib/roles";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole;
  permissions: RolePermissions;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: "unknown",
  permissions: {
    canEdit: false,
    canViewFixedExpenses: false,
    canAddFixedExpenses: false,
    canEditSettings: false,
    canEditAnalytics: false,
    canEditPromotions: false,
  },
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("unknown");
  const [permissions, setPermissions] = useState<RolePermissions>({
    canEdit: false,
    canViewFixedExpenses: false,
    canAddFixedExpenses: false,
    canEditSettings: false,
    canEditAnalytics: false,
    canEditPromotions: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const role = getUserRole(user?.email);
      setUserRole(role);
      setPermissions(getRolePermissions(role));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (emailOrUsername: string, password: string) => {
    const email = emailOrUsername.includes("@")
      ? emailOrUsername
      : `${emailOrUsername}@gmail.com`;

    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, userRole, permissions, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
