/**
 * Deals / Bundles query helpers.
 * Falls back to the static mock array ONLY when Supabase is not configured.
 */
import { createClient, createAdminBrowserClient } from "@/lib/supabase/client"
import type { Deal, DealItem } from "@/lib/deals"
import { deals as mockDeals } from "@/lib/deals"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDeal(row: any): Deal {
  let items: DealItem[] = []
  if (Array.isArray(row.items)) {
    items = row.items.map((i: DealItem & { productId?: string; qty?: number }) => ({
      name: i.name ?? "",
      size: i.size ?? "",
      price: Number(i.price ?? 0),
    }))
  }

  return {
    id: String(row.id),
    title: row.title,
    subtitle: row.tagline ?? row.subtitle ?? "",
    brand: row.brand_name ?? row.brand ?? "",
    badge: row.tag ?? row.badge ?? "",
    concern: row.description ?? row.concern ?? "",
    originalPrice: Number(row.original_price ?? 0),
    salePrice: Number(row.price ?? 0),
    items,
    highlight: Boolean(row.highlight),
    status: row.is_active ? "active" : "draft",
    createdAt: row.created_at
      ? String(row.created_at).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  }
}

export async function getAllDeals(): Promise<Deal[]> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return mockDeals

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[deals] getAllDeals:", error.message)
    return []
  }
  return (data ?? []).map(rowToDeal)
}

export async function getActiveDeals(): Promise<Deal[]> {
  const supabase = createClient()
  if (!supabase) return mockDeals.filter(d => d.status === "active")

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[deals] getActiveDeals:", error.message)
    return []
  }
  return (data ?? []).map(rowToDeal)
}

export async function getDealById(id: string): Promise<Deal | null> {
  // Prefer admin jar so draft deals load in the admin editor; public RLS still
  // allows active deals when no admin session is present.
  const supabase = createAdminBrowserClient() ?? createClient()
  if (!supabase) return mockDeals.find(d => d.id === id) ?? null

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[deals] getDealById:", error.message, "id=", id)
    return null
  }
  if (!data) {
    console.warn("[deals] getDealById: no row for id=", id)
    return null
  }
  return rowToDeal(data)
}

/** Upsert a deal. Returns the saved id. */
export async function saveDeal(
  values: Omit<Deal, "createdAt">,
  existingId?: string,
): Promise<string> {
  const supabase = createAdminBrowserClient()
  if (!supabase) {
    console.warn("Supabase not configured — deal not persisted.")
    return existingId ?? values.id ?? "mock-" + Date.now()
  }

  const id =
    existingId ??
    values.id ??
    values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const row = {
    title: values.title,
    tagline: values.subtitle,
    brand_name: values.brand,
    tag: values.badge || null,
    description: values.concern || null,
    price: values.salePrice,
    original_price: values.originalPrice,
    items: values.items,
    is_active: values.status === "active",
    highlight: values.highlight ?? false,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = existingId
    ? await supabase.from("deals").update(row).eq("id", existingId).select("id").single()
    : await supabase.from("deals").insert({ ...row, id }).select("id").single()

  if (error) throw new Error(error.message)
  return data.id
}

export async function deleteDeal(id: string): Promise<void> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return
  const { error } = await supabase.from("deals").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function toggleDealStatus(id: string, isActive: boolean): Promise<void> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return
  const { error } = await supabase.from("deals").update({ is_active: isActive }).eq("id", id)
  if (error) throw new Error(error.message)
}
