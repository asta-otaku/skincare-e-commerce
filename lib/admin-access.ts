import { redirect } from "next/navigation"
import { createAdminServerClient } from "@/lib/supabase/server"

export type StoreRole = "admin" | "sub_admin"

export function isStoreRole(role: string | null | undefined): role is StoreRole {
  return role === "admin" || role === "sub_admin"
}

/** Full admins only. Sub admins are sent back to the dashboard. */
export async function requireFullAdmin() {
  const supabase = await createAdminServerClient()
  if (!supabase) return

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || profile.is_suspended || !isStoreRole(profile.role)) {
    redirect(profile?.is_suspended ? "/admin/login?suspended=1" : "/admin/login")
  }
  if (profile.role !== "admin") redirect("/admin/dashboard")
}
