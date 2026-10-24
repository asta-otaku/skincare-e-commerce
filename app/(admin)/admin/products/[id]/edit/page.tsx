import { notFound } from "next/navigation"
import { getAdminProductById } from "@/lib/supabase/admin-product"
import { AdminProductForm } from "@/components/admin-product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getAdminProductById(id)
  if (!product) notFound()
  return <AdminProductForm product={product} />
}
