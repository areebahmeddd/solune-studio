"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User
} from "firebase/auth"
import { getAuthClient } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // initialize firebase auth on client and subscribe
    const auth = getAuthClient()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // <CHANGE> Added signIn function for Firebase email/password authentication
  const signIn = async (email: string, password: string) => {
    const auth = getAuthClient()
    await signInWithEmailAndPassword(auth, email, password)
  }

  // <CHANGE> Added signUp function for Firebase user registration
  const signUp = async (email: string, password: string) => {
    const auth = getAuthClient()
    await createUserWithEmailAndPassword(auth, email, password)
  }

  // <CHANGE> Added signOut function for Firebase logout
  const signOut = async () => {
    const auth = getAuthClient()
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
