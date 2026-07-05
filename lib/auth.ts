/* ─── Session types ──────────────────────────────────────────── */
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

/* ─── Storage keys ───────────────────────────────────────────── */
const ADMIN_KEY = "hayda_admin"
const USER_KEY  = "hayda_user"

/* ─── Admin helpers ──────────────────────────────────────────── */
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
  localStorage.setItem(ADMIN_KEY, JSON.stringify(session))
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_KEY)
}

/* ─── User helpers ───────────────────────────────────────────── */
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
  localStorage.setItem(USER_KEY, JSON.stringify(session))
}

export function clearUserSession(): void {
  localStorage.removeItem(USER_KEY)
}

/* ─── Utility ────────────────────────────────────────────────── */
/** Extract first name from a full name string or email address */
export function extractFirstName(nameOrEmail: string): string {
  if (!nameOrEmail) return "Friend"
  // If it looks like an email, take the part before @ and before any dot
  if (nameOrEmail.includes("@")) {
    const local = nameOrEmail.split("@")[0]
    return local.split(/[._-]/)[0].replace(/\b\w/g, c => c.toUpperCase())
  }
  // Otherwise take the first word of the name
  return nameOrEmail.trim().split(/\s+/)[0]
}
