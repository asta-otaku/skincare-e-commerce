/**
 * Supabase Storage helpers for product images.
 * Bucket: product-images (public)
 * Falls back gracefully when Supabase is not configured.
 */
import { createClient, createAdminBrowserClient } from "@/lib/supabase/client"

const BUCKET = "product-images"

/**
 * Upload a File to Supabase Storage and return its public URL.
 * @param file   The File object to upload
 * @param folder e.g. the product id slug — used as a path prefix
 */
export async function uploadProductImage(file: File, folder: string): Promise<string> {
  const supabase = createAdminBrowserClient()
  if (!supabase) {
    // Supabase not configured — return the blob URL as-is (dev / mock mode)
    return URL.createObjectURL(file)
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a product image from Supabase Storage by its public URL.
 */
export async function deleteProductImage(publicUrl: string): Promise<void> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return

  // Extract the storage path from the full public URL
  // e.g. https://xxx.supabase.co/storage/v1/object/public/product-images/abc/123.jpg
  const marker = `/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return

  const path = publicUrl.slice(idx + marker.length)
  await supabase.storage.from(BUCKET).remove([path])
}
