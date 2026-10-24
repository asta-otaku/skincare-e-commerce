"use client"

import { useState } from "react"
import { Check, Plus, Heart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useFavorites } from "@/components/favorites-provider"
import type { Product } from "@/lib/products"
import { cn } from "@/lib/utils"

/** Client islands for ProductCard — keeps the card shell RSC-friendly. */
export function ProductCardFavoriteButton({ product }: { product: Product }) {
  const { isFavorited, toggleFavorite } = useFavorites()
  const favorited = isFavorited(product.id)

  return (
    <button
      type="button"
      onClick={e => {
        e.preventDefault()
        toggleFavorite(product)
      }}
      aria-label={favorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
      className={cn(
        "absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-full border backdrop-blur-sm transition-opacity duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none md:size-8",
        favorited
          ? "border-gold/40 bg-lavender text-gold opacity-100"
          : "border-background/30 bg-background/60 text-foreground/60 opacity-0 group-hover:opacity-100 hover:border-gold/40 hover:text-gold",
      )}
    >
      <Heart className={cn("size-2.5 md:size-3.5 transition-all", favorited && "fill-gold")} />
    </button>
  )
}

export function ProductCardAddButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  return (
    <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:opacity-100 motion-reduce:transition-none">
      <button
        type="button"
        onClick={e => {
          e.preventDefault()
          addItem(product)
          setAdded(true)
          window.setTimeout(() => setAdded(false), 1600)
        }}
        aria-label={`Add ${product.name} to cart`}
        className={cn(
          "flex w-full items-center justify-center gap-2 border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm transition-colors duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none",
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
  )
}
