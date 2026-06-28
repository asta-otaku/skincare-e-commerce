import { notFound } from "next/navigation"
import { getProduct } from "@/lib/products"
import { AdminProductForm } from "@/components/admin-product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()
  return <AdminProductForm product={product} />
}
