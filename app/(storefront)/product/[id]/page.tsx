import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById, getProductIds } from "@/lib/supabase/products"
import { ProductDetail } from "@/components/product-detail"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedProducts } from "@/components/related-products"

/** Keep PDP in sync with admin edits (size, stock, price, etc.). */
export const revalidate = 60

export async function generateStaticParams() {
  const ids = await getProductIds()
  return ids.map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: "Product Not Found — HAYDA SKINCo." }
  return {
    title: `${product.name} — HAYDA SKINCo.`,
    description: product.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  return (
    <>
      <ProductDetail product={product} />
      <RelatedProducts currentId={product.id} />
      <ProductReviews productId={product.id} />
    </>
  )
}
