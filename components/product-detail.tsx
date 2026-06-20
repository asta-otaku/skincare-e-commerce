"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Minus, Plus, ChevronRight } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    for (let i = 0; i < qty; i++) addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:py-16 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.18em] text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-gold">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <Link href="/shop" className="transition-colors hover:text-gold">
          Shop
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden border border-border bg-muted/40">
          {product.tag && (
            <span
              className={cn(
                "absolute left-5 top-5 z-10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
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
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-[11px] font-light uppercase tracking-[0.24em] text-gold">
            {product.category}
          </p>
          <h1 className="mt-3 text-balance font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-sm font-light text-muted-foreground">{product.tagline}</p>
          <p className="mt-6 text-2xl font-light tracking-wide text-foreground">
            {formatPrice(product.price)}
          </p>

          <span className="my-7 h-px w-full bg-border" />

          <p className="text-pretty text-sm font-light leading-relaxed text-muted-foreground md:text-base">
            {product.description}
          </p>

          <ul className="mt-7 space-y-3">
            {product.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 text-sm font-light text-foreground"
              >
                <Check className="size-4 text-gold" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <div className="flex items-center justify-between border border-border sm:w-32">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex size-12 items-center justify-center text-foreground transition-colors hover:text-gold"
              >
                <Minus className="size-4" />
              </button>
              <span className="text-sm font-light tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="flex size-12 items-center justify-center text-foreground transition-colors hover:text-gold"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-300",
                added
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-foreground bg-foreground text-background hover:border-gold hover:bg-gold hover:text-gold-foreground",
              )}
            >
              {added ? (
                <>
                  <Check className="size-4" /> Added to Cart
                </>
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>

          <div className="mt-9 border-t border-border pt-7">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground">
              Key Ingredients
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
              {product.ingredients}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
