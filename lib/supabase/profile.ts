/**
 * Profile helpers — reads/writes the public.profiles table and Supabase Auth.
 * All functions return null / throw when Supabase is not configured.
 */
import { createClient } from "@/lib/supabase/client"
import { extractFirstName } from "@/lib/auth"

export type NotificationPrefs = {
  newsletter: boolean
  orderUpdates: boolean
  newProducts: boolean
  saleAlerts: boolean
}

export const DEFAULT_PREFS: NotificationPrefs = {
  newsletter: true,
  orderUpdates: true,
  newProducts: false,
  saleAlerts: true,
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  phone: string | null
  role: string
  preferences: NotificationPrefs
}

export type Address = {
  id: string
  label: string
  full_name: string
  line1: string
  line2?: string | null
  city: string
  state: string
  country: string
  phone?: string | null
  is_default: boolean
}

function parsePrefs(raw: unknown): NotificationPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PREFS }
  const o = raw as Record<string, unknown>
  return {
    newsletter: typeof o.newsletter === "boolean" ? o.newsletter : DEFAULT_PREFS.newsletter,
    orderUpdates: typeof o.orderUpdates === "boolean" ? o.orderUpdates : DEFAULT_PREFS.orderUpdates,
    newProducts: typeof o.newProducts === "boolean" ? o.newProducts : DEFAULT_PREFS.newProducts,
    saleAlerts: typeof o.saleAlerts === "boolean" ? o.saleAlerts : DEFAULT_PREFS.saleAlerts,
  }
}

/** Fetch the signed-in user's profile row. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, first_name, phone, role, preferences")
    .eq("id", user.id)
    .single()

  if (!data) return null

  return {
    id: data.id,
    email: data.email ?? user.email ?? "",
    full_name: data.full_name,
    first_name: data.first_name,
    phone: data.phone,
    role: data.role ?? "customer",
    preferences: parsePrefs(data.preferences),
  }
}

/**
 * Update profile name and phone in both:
 * - public.profiles table
 * - Supabase Auth user_metadata (keeps navbar first name in sync)
 */
export async function updateProfile(values: {
  full_name?: string
  phone?: string
}): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Not signed in."

  const firstName = values.full_name ? extractFirstName(values.full_name) : undefined

  const profileUpdate: Record<string, string> = {}
  if (values.full_name !== undefined) {
    profileUpdate.full_name = values.full_name
    profileUpdate.first_name = firstName!
  }
  if (values.phone !== undefined) profileUpdate.phone = values.phone
  profileUpdate.updated_at = new Date().toISOString()

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id)

  if (profileError) return profileError.message

  if (values.full_name !== undefined) {
    await supabase.auth.updateUser({
      data: { full_name: values.full_name, first_name: firstName },
    })
  }

  return null
}

/**
 * One-time +100 points when profile has name + phone.
 * Returns { claimed: true, points: 100 } on first grant, or null if not applicable.
 */
export async function claimProfileBonus(): Promise<{ claimed: boolean; points?: number; message?: string } | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc("claim_profile_bonus")
  if (error) {
    console.error("[profile] claim_profile_bonus:", error.message)
    return { claimed: false, message: error.message }
  }
  if (data && typeof data === "object") {
    const d = data as { ok?: boolean; claimed?: boolean; points?: number; message?: string }
    if (!d.ok) return { claimed: false, message: d.message }
    return { claimed: Boolean(d.claimed), points: d.points, message: d.message }
  }
  return null
}

/** Persist notification preference toggles. */
export async function updatePreferences(prefs: NotificationPrefs): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Not signed in."

  const { error } = await supabase
    .from("profiles")
    .update({ preferences: prefs, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) return error.message
  return null
}

/** Change the signed-in user's password via Supabase Auth. */
export async function updatePassword(newPassword: string): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return error.message
  return null
}

/** Fetch all saved addresses for the signed-in user. */
export async function getAddresses(): Promise<Address[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  return (data ?? []).map(r => ({
    id: r.id,
    label: r.label ?? "Home",
    full_name: r.full_name ?? "",
    line1: r.line1 ?? "",
    line2: r.line2,
    city: r.city ?? "",
    state: r.state ?? "",
    country: r.country ?? "Nigeria",
    phone: r.phone,
    is_default: r.is_default ?? false,
  }))
}

/** Add a new address for the signed-in user. */
export async function addAddress(
  addr: Omit<Address, "id">,
): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Not signed in."

  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: addr.label,
    full_name: addr.full_name,
    line1: addr.line1,
    line2: addr.line2 ?? null,
    city: addr.city,
    state: addr.state,
    country: addr.country,
    phone: addr.phone ?? null,
    is_default: count === 0 ? true : addr.is_default,
  })

  if (error) return error.message
  return null
}

/** Delete an address by id. */
export async function deleteAddress(id: string): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { error } = await supabase.from("addresses").delete().eq("id", id)
  if (error) return error.message
  return null
}
