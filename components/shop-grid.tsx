"use client"

import { useMemo, useState } from "react"
import { products } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { cn } from "@/lib/utils"

const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))]

export function ShopGrid() {
  const [active, setActive] = useState("All")

  const filtered = useMemo(
    () => (active === "All" ? products : products.filter((p) => p.category === active)),
    [active],
  )

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8">
      <div className="mb-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              "relative pb-1 text-xs font-light uppercase tracking-[0.18em] transition-colors",
              active === category
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {category}
            <span
              className={cn(
                "absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300",
                active === category ? "w-full" : "w-0",
              )}
            />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-7 lg:grid-cols-4">
        {filtered.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  )
}
