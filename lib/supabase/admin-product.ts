import { products as mockProducts } from "@/lib/products"
import { createAdminServerClient } from "@/lib/supabase/server"
import { rowToProduct } from "@/lib/supabase/products"

/** Admin edit screen — includes archived products via the admin session. */
export async function getAdminProductById(id: string) {
  const supabase = await createAdminServerClient()
  if (!supabase) return mockProducts.find(p => p.id === id) ?? null

  const { data, error } = await supabase
    .from("products")
    .select("*, brands(name)")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[products] getAdminProductById:", error.message)
    return null
  }
  return data ? rowToProduct(data) : null
}
