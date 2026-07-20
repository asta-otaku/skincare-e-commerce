/**
 * Product query helpers.
 * Uses the browser Supabase client so the signed-in user's JWT is attached
 * to every request — required for RLS write policies (admin only).
 * Falls back to the local mock array ONLY when NEXT_PUBLIC_SUPABASE_URL is not set.
 */
import { createClient, createAdminBrowserClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/products"
import { products as mockProducts, BRANDS as mockBrands } from "@/lib/products"

export type ProductQuery = {
  category?: string
  brand?: string
  concern?: string
  ingredient?: string
  priceMax?: number
  inStockOnly?: boolean
  minRating?: number
  sort?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brands?.name ?? row.brand_name ?? "",
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    price: row.price,
    image: row.image_url ?? row.image ?? "/product-cleanser.png",
    images: row.image_urls ?? undefined,
    category: row.category ?? "",
    tag: row.tag ?? undefined,
    benefits: row.benefits ?? [],
    ingredients: row.ingredients ?? [],
    concerns: row.concerns ?? [],
    stock: row.stock ?? 0,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    size: row.size ?? undefined,
    variants: row.variants ?? undefined,
    howToUse: row.how_to_use ?? undefined,
  } as Product
}

function filterMock(q: ProductQuery): Product[] {
  let list = [...mockProducts]
  if (q.category && q.category !== "All") {
    list = list.filter(p => p.category.toLowerCase().includes(q.category!.toLowerCase()))
  }
  if (q.brand && q.brand !== "All") list = list.filter(p => p.brand === q.brand)
  if (q.concern && q.concern !== "All") list = list.filter(p => p.concerns.includes(q.concern!))
  if (q.ingredient && q.ingredient !== "All") {
    list = list.filter(p => p.ingredients.some(i => i === q.ingredient))
  }
  if (q.inStockOnly) list = list.filter(p => p.stock > 0)
  if (q.minRating && q.minRating > 0) list = list.filter(p => p.rating >= q.minRating!)
  if (q.priceMax != null) list = list.filter(p => p.price <= q.priceMax!)

  if (q.sort === "price-asc") list.sort((a, b) => a.price - b.price)
  else if (q.sort === "price-desc") list.sort((a, b) => b.price - a.price)
  else if (q.sort === "rating") list.sort((a, b) => b.rating - a.rating)
  else if (q.sort === "reviews") list.sort((a, b) => b.reviewCount - a.reviewCount)

  return list
}

/** Filtered + sorted product query against Supabase (or mock). */
export async function queryProducts(q: ProductQuery = {}): Promise<Product[]> {
  const supabase = createClient()
  if (!supabase) return filterMock(q)

  let query = supabase
    .from("products")
    .select("*, brands(name)")
    .eq("is_published", true)

  if (q.category && q.category !== "All") {
    query = query.ilike("category", `%${q.category}%`)
  }
  if (q.brand && q.brand !== "All") {
    query = query.eq("brand_name", q.brand)
  }
  if (q.concern && q.concern !== "All") {
    query = query.contains("concerns", [q.concern])
  }
  if (q.ingredient && q.ingredient !== "All") {
    query = query.contains("ingredients", [q.ingredient])
  }
  if (q.priceMax != null) {
    query = query.lte("price", q.priceMax)
  }
  if (q.inStockOnly) {
    query = query.gt("stock", 0)
  }
  if (q.minRating && q.minRating > 0) {
    query = query.gte("rating", q.minRating)
  }

  switch (q.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "rating":
      query = query.order("rating", { ascending: false })
      break
    case "reviews":
      query = query.order("review_count", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data, error } = await query
  if (error) {
    console.error("[products] queryProducts:", error.message)
    return []
  }
  return (data ?? []).map(rowToProduct)
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return filterMock({})

  const { data, error } = await supabase
    .from("products")
    .select("*, brands(name)")
    .order("name")

  if (error) {
    console.error("[products] getAllProducts:", error.message)
    return []
  }
  return (data ?? []).map(rowToProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient()
  if (!supabase) return mockProducts.find(p => p.id === id) ?? null

  const { data, error } = await supabase
    .from("products")
    .select("*, brands(name)")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[products] getProductById:", error.message)
    return null
  }
  return data ? rowToProduct(data) : null
}

export async function getProductIds(): Promise<string[]> {
  const supabase = createClient()
  if (!supabase) return mockProducts.map(p => p.id)

  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("is_published", true)

  if (error || !data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((r: any) => r.id as string)
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  return queryProducts({ brand })
}

/** Upsert a product row. Returns the saved product id or throws. */
export async function saveProduct(
  values: Omit<Product, "rating" | "reviewCount"> & { brand_id?: string },
  id?: string,
): Promise<string> {
  const supabase = createAdminBrowserClient()
  if (!supabase) {
    console.warn("Supabase not configured — product not persisted.")
    return id ?? "mock-" + Date.now()
  }

  const row = {
    name: values.name,
    tagline: values.tagline,
    description: values.description,
    price: values.price,
    image_url: values.image,
    image_urls: values.images,
    category: values.category,
    tag: values.tag ?? null,
    benefits: values.benefits,
    ingredients: values.ingredients,
    concerns: values.concerns,
    stock: values.stock,
    size: values.size ?? null,
    variants: values.variants ?? null,
    how_to_use: (values as Product & { howToUse?: string }).howToUse ?? null,
    is_published: true,
    brand_id: values.brand_id ?? null,
    brand_name: values.brand,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = id
    ? await supabase.from("products").update(row).eq("id", id).select("id").single()
    : await supabase.from("products").insert({ ...row, id: values.id }).select("id").single()

  if (error) throw new Error(error.message)
  return data.id
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function getAllBrands() {
  const supabase = createClient()
  if (!supabase) return mockBrands

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name")

  if (error || !data) return mockBrands
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((r: any) => ({
    id: r.id as string,
    name: r.name as string,
    tagline: (r.tagline ?? "") as string,
  }))
}
