"use client"

import Image from "next/image"
import Link from "next/link"
import {
  calculateUnitPrice,
  formatPrice,
  getEffectivePrice,
  normalizePriceTiers,
  type Product,
} from "@/lib/products"

export function WholesaleProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const tiers = normalizePriceTiers(product.priceTiers, product.price)
  const listPrice = getEffectivePrice(product)
  const title = product.size
    ? `${product.name} ${product.size}`
    : product.name

  return (
    <article
      className="group flex flex-col border border-border bg-background transition-colors hover:border-gold/50"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link
        href={`/product/${product.id}`}
        aria-label={`View ${product.name}`}
        className="relative aspect-square overflow-hidden border-b border-border bg-muted"
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {tiers.length > 0 && (
          <ul className="mb-3 space-y-1">
            {tiers.map((tier) => {
              const unit = calculateUnitPrice({
                basePrice: product.price,
                skuPrice: product.price,
                quantity: tier.qty,
                priceTiers: product.priceTiers,
                discountPct: product.discountPct,
              })
              return (
                <li
                  key={tier.qty}
                  className="text-[12px] font-medium leading-snug text-foreground"
                >
                  Buy {tier.qty}pcs for {formatPrice(unit)} Each
                </li>
              )
            })}
          </ul>
        )}

        <Link href={`/product/${product.id}`} className="mt-auto">
          <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gold">
            {product.brand}
          </p>
          <h3 className="mt-1 font-serif text-base font-medium leading-snug transition-colors group-hover:text-gold">
            {title}
          </h3>
          <p className="mt-2 text-sm font-medium tabular-nums">
            {formatPrice(listPrice)}
          </p>
          {listPrice < product.price && (
            <p className="text-xs font-light line-through text-muted-foreground">
              {formatPrice(product.price)}
            </p>
          )}
        </Link>
      </div>
    </article>
  )
}
