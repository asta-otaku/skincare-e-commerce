"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import type { Product } from "@/lib/products"
import { getDiscountedProducts } from "@/lib/supabase/products"
import { ProductCard } from "@/components/product-card"
import { Tag, SlidersHorizontal } from "lucide-react"

const SORT_OPTIONS = [
  { label: "Best Discount", value: "discount" },
  { label: "Price: Low–High", value: "price-asc" },
  { label: "Price: High–Low", value: "price-desc" },
  { label: "Best Rated", value: "rating" },
]

export function OffersGrid() {
  const searchParams = useSearchParams()
  const category = searchParams?.get("category") ?? "All"

  const [sort, setSort] = useState("discount")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDiscountedProducts({
      category: category !== "All" ? category : undefined,
      sort,
    }).then(data => {
      if (!cancelled) setProducts(data)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [sort, category])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-light text-muted-foreground">
          <span className="font-medium text-foreground">{loading ? "…" : products.length}</span>{" "}
          products on discount
        </p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-xs font-light outline-none focus:border-foreground transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Tag className="size-10 text-muted-foreground/40 mb-4" />
          <p className="font-serif text-2xl font-medium text-muted-foreground">No discounted products right now.</p>
          <p className="mt-2 text-sm font-light text-muted-foreground">
            Set a discount % on products in Admin to list them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
