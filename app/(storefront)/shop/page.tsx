import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { ShopGrid } from "@/components/shop-grid"

export const metadata: Metadata = {
  title: "Shop — Aurelia",
  description:
    "Explore the complete Aurelia collection of serums, face oils, moisturizers, and clinically formulated skincare essentials.",
}

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Collection"
        title="Shop All Rituals"
        description="Each formula is crafted in small batches with rare botanicals and clinically proven actives — a complete wardrobe for luminous skin."
      />
      <ShopGrid />
    </>
  )
}
