import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/products"
import { rowToProduct } from "@/lib/supabase/products"

export async function fetchWishlistProducts(): Promise<Product[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows, error } = await supabase
    .from("wishlist")
    .select("product_id, products(*, brands(name))")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })

  if (error) {
    console.error("[wishlist] fetch:", error.message)
    return []
  }

  return (rows ?? [])
    .map((r: { products?: unknown }) => (r.products ? rowToProduct(r.products as never) : null))
    .filter(Boolean) as Product[]
}

export async function addToWishlist(productId: string): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Sign in to save favourites."

  const { error } = await supabase
    .from("wishlist")
    .upsert({ user_id: user.id, product_id: productId }, { onConflict: "user_id,product_id" })

  return error?.message ?? null
}

export async function removeFromWishlist(productId: string): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Sign in required."

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId)

  return error?.message ?? null
}
