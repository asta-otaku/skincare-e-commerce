import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProduct, products } from "@/lib/products"
import { ProductDetail } from "@/components/product-detail"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedProducts } from "@/components/related-products"

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = getProduct(id)
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
  const product = getProduct(id)
  if (!product) notFound()

  return (
    <>
      <ProductDetail product={product} />
      <ProductReviews productId={product.id} />
      <RelatedProducts currentId={product.id} />
    </>
  )
}
