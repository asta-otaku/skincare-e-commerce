import { notFound } from "next/navigation"
import { getProductById } from "@/lib/supabase/products"
import { AdminProductForm } from "@/components/admin-product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()
  return <AdminProductForm product={product} />
}
