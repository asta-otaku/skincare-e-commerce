import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/products"

export type CartItem = Product & { quantity: number }

type CartSnapshot = {
  id: string
  name: string
  brand: string
  tagline: string
  description: string
  price: number
  listPrice?: number
  skuPrice?: number
  discountPct?: number
  moq?: number
  priceTiers?: Product["priceTiers"]
  image: string
  images?: string[]
  category: string
  tag?: Product["tag"]
  benefits: string[]
  ingredients: string[]
  concerns: string[]
  stock: number
  rating: number
  reviewCount: number
  size?: string
  variants?: Product["variants"]
}

function toSnapshot(product: Product): CartSnapshot {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    tagline: product.tagline,
    description: product.description,
    price: product.price,
    listPrice: product.listPrice ?? product.price,
    skuPrice: product.skuPrice ?? product.listPrice ?? product.price,
    discountPct: product.discountPct,
    moq: product.moq,
    priceTiers: product.priceTiers,
    image: product.image,
    images: product.images,
    category: product.category,
    tag: product.tag,
    benefits: product.benefits ?? [],
    ingredients: product.ingredients ?? [],
    concerns: product.concerns ?? [],
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    size: product.size,
    variants: product.variants,
  }
}

function fromRow(row: {
  product_id: string
  quantity: number
  snapshot: CartSnapshot | null
}): CartItem | null {
  const snap = row.snapshot
  if (!snap || typeof snap !== "object") return null
  return {
    ...snap,
    id: row.product_id || snap.id,
    quantity: Number(row.quantity) || 1,
  }
}

export async function fetchCartItems(): Promise<CartItem[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity, snapshot")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("[cart] fetch:", error.message)
    return []
  }

  return (data ?? []).map(fromRow).filter(Boolean) as CartItem[]
}

export async function upsertCartItem(product: Product, quantity: number): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Sign in required."

  if (quantity < 1) {
    return removeCartItem(product.id)
  }

  const { error } = await supabase.from("cart_items").upsert(
    {
      user_id: user.id,
      product_id: product.id,
      quantity,
      snapshot: toSnapshot(product),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" },
  )

  return error?.message ?? null
}

export async function removeCartItem(productId: string): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Sign in required."

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId)

  return error?.message ?? null
}

export async function clearCartItems(): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return "Supabase not configured."

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Sign in required."

  const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)
  return error?.message ?? null
}

/** Merge guest/local lines into the signed-in cart (max quantity wins). */
export async function mergeGuestCartIntoServer(guestItems: CartItem[]): Promise<CartItem[]> {
  if (!guestItems.length) return fetchCartItems()

  const remote = await fetchCartItems()
  const byId = new Map<string, CartItem>()
  for (const item of remote) byId.set(item.id, item)
  for (const item of guestItems) {
    const existing = byId.get(item.id)
    const qty = existing ? Math.max(existing.quantity, item.quantity) : item.quantity
    const product = existing ?? item
    byId.set(item.id, { ...product, quantity: qty })
    await upsertCartItem(product, qty)
  }
  return fetchCartItems()
}
