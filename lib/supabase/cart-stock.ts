/**
 * Live stock checks for cart / checkout.
 * Cart snapshots can go stale — always re-read products.stock before checkout.
 */
import { createClient as createSb } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export type StockAvailability = {
  productId: string
  stock: number
  /** Product missing, unpublished, or stock 0 */
  unavailable: boolean
  /** Requested qty exceeds current stock (but stock > 0) */
  exceeds: boolean
  available: number
}

function getReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  if (typeof window !== "undefined") return createClient()
  return createSb(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Fetch live stock for product ids (skips deal__ bundle lines). */
export async function fetchLiveStock(
  productIds: string[],
): Promise<Record<string, { stock: number; published: boolean }>> {
  const ids = [...new Set(productIds.filter(id => id && !id.startsWith("deal__")))]
  if (!ids.length) return {}

  const supabase = getReadClient()
  if (!supabase) return {}

  const { data, error } = await supabase
    .from("products")
    .select("id, stock, is_published")
    .in("id", ids)

  if (error) {
    console.error("[stock] fetchLiveStock:", error.message)
    return {}
  }

  const map: Record<string, { stock: number; published: boolean }> = {}
  for (const row of data ?? []) {
    map[row.id] = {
      stock: Number(row.stock) || 0,
      published: row.is_published !== false,
    }
  }
  return map
}

export function evaluateCartStock(
  items: { id: string; quantity: number }[],
  live: Record<string, { stock: number; published: boolean }>,
): StockAvailability[] {
  return items
    .filter(i => !i.id.startsWith("deal__"))
    .map(i => {
      const row = live[i.id]
      if (!row || !row.published || row.stock <= 0) {
        return {
          productId: i.id,
          stock: row?.stock ?? 0,
          available: 0,
          unavailable: true,
          exceeds: false,
        }
      }
      const exceeds = i.quantity > row.stock
      return {
        productId: i.id,
        stock: row.stock,
        available: row.stock,
        unavailable: false,
        exceeds,
      }
    })
}

export function hasBlockingStockIssues(issues: StockAvailability[]): boolean {
  return issues.some(i => i.unavailable || i.exceeds)
}
