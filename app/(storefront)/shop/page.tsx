import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { ShopGrid } from "@/components/shop-grid"
import { queryProducts } from "@/lib/supabase/products"

export const metadata: Metadata = {
  title: "Shop — HAYDA SKINCo.",
  description:
    "Browse all skincare products stocked by HAYDA SKINCo. — CeraVe, The Ordinary, La Roche-Posay, COSRX, Paula's Choice, and more. Delivered nationwide.",
}

export const revalidate = 60

type Props = {
  searchParams: Promise<{ category?: string; brand?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams
  const products = await queryProducts({
    category: sp.category,
    brand: sp.brand,
    sort: "featured",
  })

  return (
    <>
      <PageHeader
        eyebrow="All Products"
        title="Shop All Skincare"
        description="Trusted brands. Authentic products. Delivered anywhere in Nigeria."
      />
      <Suspense>
        <ShopGrid initialProducts={products} />
      </Suspense>
    </>
  )
}
