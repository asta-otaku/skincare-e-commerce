import Link from "next/link"
import Image from "next/image"
import { getActiveDeals } from "@/lib/supabase/deals"
import { dealSalePrice } from "@/lib/deals"

export async function RelatedDeals({ currentId }: { currentId: string }) {
  const deals = (await getActiveDeals()).filter(d => d.id !== currentId).slice(0, 3)
  if (!deals.length) return null

  return (
    <section className="border-t border-border mt-8 pt-12 mx-auto max-w-7xl px-5 lg:px-8 pb-16">
      <h2 className="font-serif text-2xl font-medium mb-6">More combo deals</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map(deal => {
          const sale = dealSalePrice(deal)
          return (
            <Link
              key={deal.id}
              href={`/deal/${deal.id}`}
              className="group border border-border transition-colors hover:border-gold/50"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={deal.image || "/product-bundle.png"}
                  alt={deal.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gold">{deal.brand}</p>
                <h3 className="mt-1 font-serif text-lg font-medium group-hover:text-gold transition-colors">
                  {deal.title}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  {deal.originalPrice > sale && (
                    <span className="text-xs font-light line-through text-muted-foreground">
                      ₦{deal.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm font-medium">₦{sale.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
