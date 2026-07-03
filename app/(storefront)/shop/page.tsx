import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { ShopGrid } from "@/components/shop-grid"

export const metadata: Metadata = {
  title: "Shop — HAYDA SKINCo.",
  description:
    "Browse all skincare products stocked by HAYDA SKINCo. — CeraVe, The Ordinary, La Roche-Posay, COSRX, Paula's Choice, and more. Delivered nationwide.",
}

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="All Products"
        title="Shop All Skincare"
        description="Trusted brands. Authentic products. Delivered anywhere in Nigeria."
      />
      <Suspense>
        <ShopGrid />
      </Suspense>
    </>
  )
}
