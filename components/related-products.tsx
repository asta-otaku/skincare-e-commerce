"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { getRelatedProducts } from "@/lib/supabase/products"
import type { Product } from "@/lib/products"

export function RelatedProducts({ currentId }: { currentId: string }) {
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRelatedProducts(currentId, 4).then(data => {
      setRelated(data)
      setLoading(false)
    })
  }, [currentId])

  if (!loading && related.length === 0) return null

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="text-xs font-light uppercase tracking-[0.3em] text-gold">Complete the Ritual</p>
          <h2 className="mt-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
            You May Also Love
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-7 lg:grid-cols-4">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse bg-muted/40" />
              ))
            : related.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
        </div>
      </div>
    </section>
  )
}
