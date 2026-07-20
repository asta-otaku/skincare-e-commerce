import type { Session, User } from "@supabase/supabase-js"

// --- Session types ---

export type AdminSession = {
  email: string
  name: string
  signedInAt: number
}

export type UserSession = {
  email: string
  name: string
  firstName: string
  signedInAt: number
}

// --- Utility ---

/** Extract first name from a full name string or email address */
export function extractFirstName(nameOrEmail: string): string {
  if (!nameOrEmail) return "Friend"
  if (nameOrEmail.includes("@")) {
    const local = nameOrEmail.split("@")[0]
    return local.split(/[._-]/)[0].replace(/\b\w/g, c => c.toUpperCase())
  }
  return nameOrEmail.trim().split(/\s+/)[0]
}

// --- Supabase -> session mappers ---

export function supabaseUserToUserSession(user: User): UserSession {
  const meta = user.user_metadata ?? {}
  const fullName: string = meta.full_name ?? meta.name ?? ""
  const firstName: string =
    meta.first_name ?? extractFirstName((fullName || user.email) ?? "")
  return {
    email: user.email ?? "",
    name: fullName || firstName,
    firstName,
    signedInAt: new Date(user.created_at ?? Date.now()).getTime(),
  }
}

export function supabaseSessionToAdminSession(session: Session): AdminSession {
  const user = session.user
  const meta = user.user_metadata ?? {}
  return {
    email: user.email ?? "",
    name: meta.full_name ?? meta.name ?? "Admin",
    signedInAt: new Date(user.created_at ?? Date.now()).getTime(),
  }
}

// --- Storage keys (dev mock ONLY — used when Supabase env vars are missing) ---
// When Supabase is configured, auth providers clear these and never write them.

const ADMIN_KEY = "hayda_admin"
const USER_KEY  = "hayda_user"

// --- Admin localStorage helpers (mock mode) ---

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? (JSON.parse(raw) as AdminSession) : null
  } catch {
    return null
  }
}

export function saveAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ADMIN_KEY, JSON.stringify(session))
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ADMIN_KEY)
}

// --- User localStorage helpers ---

export function getUserSession(): UserSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as UserSession) : null
  } catch {
    return null
  }
}

export function saveUserSession(session: UserSession): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_KEY, JSON.stringify(session))
}

export function clearUserSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(USER_KEY)
}
