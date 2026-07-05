"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  type UserSession,
  getUserSession,
  saveUserSession,
  clearUserSession,
  extractFirstName,
} from "@/lib/auth"

/* ─── Context ────────────────────────────────────────────────── */
type UserAuthCtx = {
  session: UserSession | null
  /** Returns error string on failure, null on success */
  signIn: (email: string, password: string) => Promise<string | null>
  /** Returns error string on failure, null on success */
  signUp: (name: string, email: string, password: string) => Promise<string | null>
  signOut: () => void
}

const UserAuthContext = createContext<UserAuthCtx>({
  session: null,
  signIn: async () => "Not initialised",
  signUp: async () => "Not initialised",
  signOut: () => {},
})

export function useUserAuth() {
  return useContext(UserAuthContext)
}

/* ─── Provider ───────────────────────────────────────────────── */
export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSession(getUserSession())
    setMounted(true)
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    await new Promise(r => setTimeout(r, 800))
    if (!email || !password) return "Please enter your email and password."
    // Demo: accept any valid-looking credentials
    const firstName = extractFirstName(email)
    const s: UserSession = {
      email,
      name: firstName,
      firstName,
      signedInAt: Date.now(),
    }
    saveUserSession(s)
    setSession(s)
    return null
  }

  async function signUp(name: string, email: string, password: string): Promise<string | null> {
    await new Promise(r => setTimeout(r, 800))
    if (!name || !email || !password) return "Please fill in all fields."
    const firstName = extractFirstName(name)
    const s: UserSession = {
      email,
      name,
      firstName,
      signedInAt: Date.now(),
    }
    saveUserSession(s)
    setSession(s)
    return null
  }

  function signOut() {
    clearUserSession()
    setSession(null)
  }

  // Render children immediately — no guard here (guard is in account layout)
  // Pass null session before mount to avoid hydration mismatch
  return (
    <UserAuthContext.Provider value={{ session: mounted ? session : null, signIn, signUp, signOut }}>
      {children}
    </UserAuthContext.Provider>
  )
}
