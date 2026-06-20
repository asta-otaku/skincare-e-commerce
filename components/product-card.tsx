"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Plus } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <article
      className="group flex flex-col"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <Link
        href={`/product/${product.id}`}
        aria-label={`View ${product.name}`}
        className="relative aspect-[4/5] overflow-hidden border border-border bg-muted/40 transition-colors duration-500 group-hover:border-gold/60"
      >
        {product.tag && (
          <span
            className={cn(
              "absolute left-4 top-4 z-10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
              product.tag === "Bestseller"
                ? "bg-gold text-gold-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            {product.tag}
          </span>
        )}

        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Quick add to cart */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "flex w-full items-center justify-center gap-2 border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm transition-all duration-300",
              added
                ? "border-gold bg-gold text-gold-foreground"
                : "border-foreground bg-background/90 text-foreground hover:border-gold hover:bg-gold hover:text-gold-foreground",
            )}
          >
            {added ? (
              <>
                <Check className="size-3.5" /> Added
              </>
            ) : (
              <>
                <Plus className="size-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col items-center px-1 pt-5 text-center">
        <p className="text-[10px] font-light uppercase tracking-[0.22em] text-gold">
          {product.category}
        </p>
        <h3 className="mt-2 font-serif text-xl font-medium leading-snug text-foreground">
          <Link href={`/product/${product.id}`} className="transition-colors hover:text-gold">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-light text-muted-foreground">{product.tagline}</p>
        <p className="mt-3 text-sm font-light tracking-wide text-foreground">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  )
}
