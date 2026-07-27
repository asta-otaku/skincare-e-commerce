import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDealById, getDealIds } from "@/lib/supabase/deals"
import { dealAsProduct, dealSalePrice } from "@/lib/deals"
import { ProductDetail } from "@/components/product-detail"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedDeals } from "@/components/related-deals"

export const revalidate = 60

export async function generateStaticParams() {
  const ids = await getDealIds()
  return ids.map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const deal = await getDealById(id)
  if (!deal || deal.status !== "active") {
    return { title: "Deal Not Found — HAYDA SKINCo." }
  }
  return {
    title: `${deal.title} — HAYDA SKINCo.`,
    description: deal.description || deal.subtitle,
  }
}

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = await getDealById(id)
  if (!deal || deal.status !== "active") notFound()

  const product = dealAsProduct(deal)
  // Ensure sale math matches current discount even if DB price drifted
  const sale = dealSalePrice(deal)
  if (sale !== product.price && !product.discountPct) {
    product.price = deal.originalPrice
    product.discountPct =
      deal.originalPrice > 0 && sale < deal.originalPrice
        ? Math.round((1 - sale / deal.originalPrice) * 100)
        : undefined
  }

  return (
    <>
      <ProductDetail product={product} hideBenefits />
      <section className="mx-auto max-w-7xl px-5 lg:px-8 -mt-16 mb-4">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] mb-3">What&apos;s included</h2>
          <ul className="space-y-2">
            {deal.items.map((item) => (
              <li
                key={`${item.productId}-${item.variantLabel ?? item.size}`}
                className="flex items-center justify-between gap-3 text-sm font-light"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="size-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="truncate">{item.name}</span>
                  {(item.variantLabel || item.size) && (
                    <span className="text-muted-foreground shrink-0">
                      ({item.variantLabel || item.size})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ProductReviews productId={product.id} />
      <RelatedDeals currentId={deal.id} />
    </>
  )
}
