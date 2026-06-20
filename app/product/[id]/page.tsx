import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProduct, products } from "@/lib/products"
import { ProductDetail } from "@/components/product-detail"
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
  if (!product) return { title: "Product Not Found — Aurelia" }
  return {
    title: `${product.name} — Aurelia`,
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
      <RelatedProducts currentId={product.id} />
    </>
  )
}
