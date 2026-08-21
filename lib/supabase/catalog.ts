/**
 * Mutable catalog entries (ingredients + concerns) stored in Supabase.
 * Falls back to static lists in lib/catalog.ts when Supabase is unavailable.
 */
import { createAdminBrowserClient, createClient } from "@/lib/supabase/client"
import {
  ALL_CONCERNS,
  ALL_INGREDIENTS,
  slugifyCatalogLabel,
} from "@/lib/catalog"

export type CatalogKind = "ingredients" | "concerns"

export type CatalogEntry = {
  id: string
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
}

function tableFor(kind: CatalogKind) {
  return kind === "ingredients" ? "catalog_ingredients" : "catalog_concerns"
}

function defaultsFor(kind: CatalogKind): CatalogEntry[] {
  const names = kind === "ingredients" ? ALL_INGREDIENTS : ALL_CONCERNS
  return names.map((name, i) => ({
    id: slugifyCatalogLabel(name),
    name,
    slug: slugifyCatalogLabel(name),
    sortOrder: i + 1,
    isActive: true,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): CatalogEntry {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: Number(row.sort_order) || 0,
    isActive: row.is_active !== false,
  }
}

/** Active names for storefront / product form pickers. */
export async function getCatalogNames(kind: CatalogKind): Promise<string[]> {
  const entries = await getCatalogEntries(kind, true)
  return entries.map(e => e.name)
}

/** Full list for admin (include inactive when activeOnly=false). */
export async function getCatalogEntries(
  kind: CatalogKind,
  activeOnly = true,
): Promise<CatalogEntry[]> {
  const supabase = createClient() ?? createAdminBrowserClient()
  if (!supabase) return defaultsFor(kind).filter(e => !activeOnly || e.isActive)

  let q = supabase.from(tableFor(kind)).select("*").order("sort_order").order("name")
  if (activeOnly) q = q.eq("is_active", true)

  const { data, error } = await q
  if (error) {
    console.error(`[catalog] ${kind}:`, error.message)
    return defaultsFor(kind).filter(e => !activeOnly || e.isActive)
  }
  if (!data?.length) return defaultsFor(kind).filter(e => !activeOnly || e.isActive)
  return data.map(mapRow)
}

export async function getCatalogEntriesForAdmin(kind: CatalogKind): Promise<CatalogEntry[]> {
  const supabase = createAdminBrowserClient() ?? createClient()
  if (!supabase) return defaultsFor(kind)

  const { data, error } = await supabase
    .from(tableFor(kind))
    .select("*")
    .order("sort_order")
    .order("name")

  if (error) {
    console.error(`[catalog] admin ${kind}:`, error.message)
    return defaultsFor(kind)
  }
  return (data ?? []).map(mapRow)
}

export async function saveCatalogEntry(
  kind: CatalogKind,
  values: { id?: string; name: string; sortOrder?: number; isActive?: boolean },
): Promise<string> {
  const supabase = createAdminBrowserClient()
  if (!supabase) throw new Error("Supabase not configured.")

  const name = values.name.trim()
  if (!name) throw new Error("Name is required.")
  const id = values.id?.trim() || slugifyCatalogLabel(name)
  const slug = slugifyCatalogLabel(name)

  const row = {
    id,
    name,
    slug,
    sort_order: values.sortOrder ?? 0,
    is_active: values.isActive !== false,
    updated_at: new Date().toISOString(),
  }

  const { error } = values.id
    ? await supabase.from(tableFor(kind)).update(row).eq("id", values.id)
    : await supabase.from(tableFor(kind)).upsert(row, { onConflict: "id" })

  if (error) throw new Error(error.message)
  return id
}

export async function deleteCatalogEntry(kind: CatalogKind, id: string): Promise<void> {
  const supabase = createAdminBrowserClient()
  if (!supabase) throw new Error("Supabase not configured.")
  const { error } = await supabase.from(tableFor(kind)).delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function toggleCatalogEntryActive(
  kind: CatalogKind,
  id: string,
  isActive: boolean,
): Promise<void> {
  const supabase = createAdminBrowserClient()
  if (!supabase) throw new Error("Supabase not configured.")
  const { error } = await supabase
    .from(tableFor(kind))
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

/**
 * Upsert any names missing from the catalog (case-insensitive).
 * Called when saving a product with custom ingredients/concerns.
 */
export async function ensureCatalogEntries(
  kind: CatalogKind,
  names: string[],
): Promise<void> {
  const cleaned = [...new Set(names.map(n => n.trim()).filter(Boolean))]
  if (!cleaned.length) return

  const supabase = createAdminBrowserClient()
  if (!supabase) return

  const existing = await getCatalogEntriesForAdmin(kind)
  const byLower = new Map(existing.map(e => [e.name.toLowerCase(), e]))

  const toInsert = cleaned.filter(n => !byLower.has(n.toLowerCase()))
  if (!toInsert.length) return

  const maxSort = existing.reduce((m, e) => Math.max(m, e.sortOrder), 0)
  const rows = toInsert.map((name, i) => ({
    id: slugifyCatalogLabel(name),
    name,
    slug: slugifyCatalogLabel(name),
    sort_order: maxSort + i + 1,
    is_active: true,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from(tableFor(kind)).upsert(rows, { onConflict: "id" })
  if (error) console.error(`[catalog] ensure ${kind}:`, error.message)
}
