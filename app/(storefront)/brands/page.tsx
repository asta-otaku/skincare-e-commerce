import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BRANDS, products } from "@/lib/products"

export const metadata: Metadata = {
  title: "Brands — HAYDA SKINCo.",
  description: "Shop all brands stocked by HAYDA SKINCo. — CeraVe, The Ordinary, La Roche-Posay, COSRX, Paula's Choice, and more.",
}

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold mb-2">All Brands</p>
        <h1 className="font-serif text-4xl font-medium">Brands We Stock</h1>
        <p className="mt-2 text-base font-light text-muted-foreground max-w-xl">
          Premium skincare brands, curated for Nigerian skin and climate. Every product is authentic and sourced directly from authorised distributors.
        </p>
      </div>

      {/* Brand grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BRANDS.map(brand => {
          const brandProducts = products.filter(p => p.brand === brand.name)
          const productCount = brandProducts.length
          return (
            <div key={brand.id} id={brand.id} className="group border border-border p-6 transition-all hover:border-gold/60 hover:bg-muted/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-serif text-2xl font-medium group-hover:text-gold transition-colors">{brand.name}</h2>
                  <p className="mt-0.5 text-sm font-light text-muted-foreground">{brand.tagline}</p>
                </div>
                {productCount > 0 && (
                  <span className="border border-border px-2.5 py-1 text-[10px] font-light text-muted-foreground">
                    {productCount} product{productCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Product preview */}
              {brandProducts.length > 0 ? (
                <div className="mb-4">
                  <p className="mb-2 text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">Popular:</p>
                  <ul className="space-y-1">
                    {brandProducts.slice(0, 3).map(p => (
                      <li key={p.id} className="flex items-center gap-1.5 text-xs font-light text-muted-foreground">
                        <span className="size-1 rounded-full bg-gold shrink-0" />
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mb-4 text-sm font-light italic text-muted-foreground">Coming soon</p>
              )}

              <Link
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-gold hover:underline underline-offset-2 transition-all"
              >
                Shop {brand.name} <ArrowRight className="size-3" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Wholesale CTA */}
      <div className="mt-16 border border-border bg-muted/20 p-8 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold mb-2">For businesses</p>
        <h3 className="font-serif text-2xl font-medium mb-2">Interested in wholesale?</h3>
        <p className="text-sm font-light text-muted-foreground mb-6 max-w-md mx-auto">
          We supply salons, spas, clinics, and retailers across Nigeria with authentic skincare brands at wholesale prices.
        </p>
        <Link href="/wholesale" className="inline-flex items-center gap-2 bg-foreground px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-background hover:bg-gold hover:text-gold-foreground transition-colors">
          Learn More <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
