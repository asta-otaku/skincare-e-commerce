import { createAdminBrowserClient } from "@/lib/supabase/client"

export type AdminUserRole = "customer" | "admin" | "staff"
export type AdminUserStatus = "active" | "suspended"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  joinedAt: string
  orders: number
  totalSpent: number
  avatar: string
}

function initials(name: string, email: string) {
  const base = name.trim() || email.split("@")[0] || "?"
  return base
    .split(/\s+/)
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return []

  const {
    data: { user: currentAdmin },
  } = await supabase.auth.getUser()

  let profilesQuery = supabase
    .from("profiles")
    .select("id, email, full_name, first_name, role, is_suspended, created_at")
    .order("created_at", { ascending: false })

  if (currentAdmin?.id) {
    profilesQuery = profilesQuery.neq("id", currentAdmin.id)
  }

  const [{ data: profiles, error }, { data: orders }] = await Promise.all([
    profilesQuery,
    supabase
      .from("orders")
      .select("user_id, total, payment_status")
      .eq("payment_status", "paid"),
  ])

  if (error) {
    console.error("[users] list:", error.message)
    return []
  }

  const spend = new Map<string, { orders: number; total: number }>()
  for (const o of orders ?? []) {
    if (!o.user_id) continue
    const prev = spend.get(o.user_id) ?? { orders: 0, total: 0 }
    spend.set(o.user_id, {
      orders: prev.orders + 1,
      total: prev.total + Number(o.total),
    })
  }

  return (profiles ?? []).map(p => {
      const name =
        p.full_name?.trim() ||
        p.first_name?.trim() ||
        (p.email ? p.email.split("@")[0] : "User")
      const stats = spend.get(p.id) ?? { orders: 0, total: 0 }
      const role = (p.role === "admin" || p.role === "staff" ? p.role : "customer") as AdminUserRole
      return {
        id: p.id,
        name,
        email: p.email ?? "",
        role,
        status: p.is_suspended ? "suspended" : "active",
        joinedAt: p.created_at,
        orders: stats.orders,
        totalSpent: Math.round(stats.total),
        avatar: initials(name, p.email ?? ""),
      }
    })
}

export async function updateUserRole(id: string, role: AdminUserRole): Promise<string | null> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return "Supabase not configured."

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id)

  return error?.message ?? null
}

export async function updateUserSuspended(id: string, suspended: boolean): Promise<string | null> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return "Supabase not configured."

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspended, updated_at: new Date().toISOString() })
    .eq("id", id)

  return error?.message ?? null
}

export async function bulkSetSuspended(ids: string[], suspended: boolean): Promise<string | null> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return "Supabase not configured."
  if (!ids.length) return null

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspended, updated_at: new Date().toISOString() })
    .in("id", ids)

  return error?.message ?? null
}
