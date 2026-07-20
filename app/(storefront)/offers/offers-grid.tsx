"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { type Product } from "@/lib/products"
import { getAllProducts } from "@/lib/supabase/products"
import { ProductCard } from "@/components/product-card"
import { Tag, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const SORT_OPTIONS = [
  { label: "Best Discount", value: "discount" },
  { label: "Price: Low–High", value: "price-asc" },
  { label: "Price: High–Low", value: "price-desc" },
  { label: "Best Rated", value: "rating" },
]

export function OffersGrid() {
  const searchParams = useSearchParams()
  const initCategory = searchParams?.get("category") ?? "All"

  const [sort, setSort] = useState("discount")
  const [category, setCategory] = useState(initCategory)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    getAllProducts().then(setAllProducts)
  }, [])

  // Products on sale: tag === "Sale" or low stock clearance
  const offerProducts = useMemo(() => {
    let list = allProducts.filter(p => p.tag === "Sale" || p.tag === "Low Stock" || p.tag === "Bestseller")
    if (category !== "All") list = list.filter(p => p.category.toLowerCase().includes(category.toLowerCase()))

    if (sort === "price-asc")  list = [...list].sort((a, b) => a.price - b.price)
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price)
    if (sort === "rating")     list = [...list].sort((a, b) => b.rating - a.rating)

    return list
  }, [sort, category])

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-light text-muted-foreground">
          <span className="font-medium text-foreground">{offerProducts.length}</span> deals available
        </p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-xs font-light outline-none focus:border-foreground transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {offerProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Tag className="size-10 text-muted-foreground/40 mb-4" />
          <p className="font-serif text-2xl font-medium text-muted-foreground">No offers in this category right now.</p>
          <p className="mt-2 text-sm font-light text-muted-foreground">Check back soon — new deals are added weekly.</p>
        </div>
      ) : (
        <>
          {/* Deal badges legend */}
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-none border border-gold/30 bg-gold/5 px-5 py-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Active promotions:</span>
            {[
              { label: "Sale", color: "bg-gold text-gold-foreground" },
              { label: "Low Stock", color: "bg-orange-100 text-orange-700" },
              { label: "Bestseller", color: "bg-foreground text-background" },
            ].map(b => (
              <span key={b.label} className={cn("px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]", b.color)}>
                {b.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {offerProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
