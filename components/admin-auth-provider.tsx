"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  type AdminSession,
  getAdminSession,
  saveAdminSession,
  clearAdminSession,
} from "@/lib/auth"

/* ─── Context ────────────────────────────────────────────────── */
type AdminAuthCtx = {
  session: AdminSession | null
  /** Returns an error string on failure, null on success */
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => void
}

const AdminAuthContext = createContext<AdminAuthCtx>({
  session: null,
  signIn: async () => "Not initialised",
  signOut: () => {},
})

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

/* ─── Provider + guard ───────────────────────────────────────── */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<AdminSession | null>(null)
  const [checked, setChecked] = useState(false)

  // On mount: read localStorage. Redirect to login if no valid session.
  useEffect(() => {
    const s = getAdminSession()
    setSession(s)
    setChecked(true)
    if (!s) {
      router.replace("/admin/login")
    }
  }, [router])

  async function signIn(email: string, password: string): Promise<string | null> {
    // Simulated auth — swap with real API call when backend is ready
    await new Promise(r => setTimeout(r, 800))
    if (email === "admin@haydaskinco.com" && password === "password") {
      const s: AdminSession = { email, name: "Admin", signedInAt: Date.now() }
      saveAdminSession(s)
      setSession(s)
      return null
    }
    return "Invalid email or password. Try admin@haydaskinco.com / password"
  }

  function signOut() {
    clearAdminSession()
    setSession(null)
    router.push("/admin/login")
  }

  // Show nothing while we check localStorage (prevents flash of protected content)
  if (!checked || !session) return null

  return (
    <AdminAuthContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
