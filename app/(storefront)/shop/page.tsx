import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { ShopGrid } from "@/components/shop-grid"
import { getAllProducts } from "@/lib/supabase/products"

export const metadata: Metadata = {
  title: "Shop — HAYDA SKINCo.",
  description:
    "Browse all skincare products stocked by HAYDA SKINCo. — CeraVe, The Ordinary, La Roche-Posay, COSRX, Paula's Choice, and more. Delivered nationwide.",
}

export const revalidate = 60

export default async function ShopPage() {
  const products = await getAllProducts()

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
