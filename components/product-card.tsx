"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Plus, Heart, Star } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useFavorites } from "@/components/favorites-provider"
import { formatPrice, getEffectivePrice, hasDiscount, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"

export function ProductCard({
  product,
  index = 0,
  isWhiteBackground = false,
  href,
}: {
  product: Product
  index?: number
  isWhiteBackground?: boolean
  /** Override product detail link (e.g. `/deal/[id]` for bundles). */
  href?: string
}) {
  const { addItem } = useCart()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [added, setAdded] = useState(false)
  const favorited = isFavorited(product.id)
  const detailHref = href ?? `/product/${product.id}`

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    toggleFavorite(product)
  }

  return (
    <article className="group flex flex-col" style={{ animationDelay: `${index * 90}ms` }}>
      <Link
        href={detailHref}
        aria-label={`View ${product.name}`}
        className={cn(
          "relative aspect-4/5 overflow-hidden border border-border transition-colors duration-500 group-hover:border-gold/60",
          isWhiteBackground && "bg-white",
        )}
      >
        {product.tag && (
          <span
            className={cn(
              "absolute left-4 top-4 z-10 px-3 py-1 text-[8px] md:text-[10px] font-medium uppercase tracking-[0.18em]",
              product.tag === "Bestseller"
                ? "bg-gold text-gold-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            {product.tag}
          </span>
        )}
        {hasDiscount(product) && (
          <span
            className="absolute left-4 z-10 px-3 py-1 text-[8px] md:text-[10px] font-medium uppercase tracking-[0.18em] bg-foreground text-background"
            style={{ top: product.tag ? "2.75rem" : "1rem" }}
          >
            -{product.discountPct}%
          </span>
        )}

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={favorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          className={cn(
            "absolute right-3 top-3 z-10 flex size-6 md:size-8 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300",
            favorited
              ? "border-gold/40 bg-lavender text-gold opacity-100"
              : "border-background/30 bg-background/60 text-foreground/60 opacity-0 group-hover:opacity-100 hover:border-gold/40 hover:text-gold",
          )}
        >
          <Heart className={cn("size-2.5 md:size-3.5 transition-all", favorited && "fill-gold")} />
        </button>

        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
        />

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
              <><Check className="size-2.5 md:size-3.5" /> Added</>
            ) : (
              <><Plus className="size-2.5 md:size-3.5" /> Add to Cart</>
            )}
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col items-center px-1 pt-5 text-center">
        <p className="text-[8px] md:text-[10px] font-light uppercase tracking-[0.22em] text-gold">{product.brand}</p>
        <h3 className="mt-2 font-serif text-lg md:text-xl font-medium leading-snug text-foreground">
          <Link href={detailHref} className="transition-colors hover:text-gold line-clamp-2">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[10px] md:text-xs font-light text-muted-foreground line-clamp-2">{product.tagline}</p>

        {product.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={cn(
                    "size-3",
                    product.rating >= i ? "fill-gold text-gold" : "fill-muted text-border",
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] font-light text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {hasDiscount(product) ? (
            <>
              <p className="text-sm font-light tracking-wide text-muted-foreground line-through">
                {formatPrice(product.price)}
              </p>
              <p className="text-sm font-medium tracking-wide text-foreground">
                {formatPrice(getEffectivePrice(product))}
              </p>
            </>
          ) : (
            <p className="text-sm font-light tracking-wide text-foreground">{formatPrice(product.price)}</p>
          )}
          {product.stock <= 10 && product.stock > 0 && (
            <span className="text-[10px] font-light text-amber-600">Low stock</span>
          )}
          {product.stock === 0 && (
            <span className="text-[10px] font-light text-destructive">Out of stock</span>
          )}
        </div>
      </div>
    </article>
  )
}
