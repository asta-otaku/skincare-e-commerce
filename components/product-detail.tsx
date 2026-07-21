"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Check, Minus, Plus, ChevronRight, Heart, Star,
  Truck, ShieldCheck, RotateCcw,
} from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useFavorites } from "@/components/favorites-provider"
import { formatPrice, getEffectivePrice, hasDiscount, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"

type Tab = "description" | "how-to-use" | "ingredients" | "reviews"

/* ─── Star row helper ─────────────────────────────────────────── */
function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "size-4" : "size-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn(cls, "transition-colors", rating >= i ? "fill-gold text-gold" : "fill-muted text-border")}
        />
      ))}
    </div>
  )
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { isFavorited, toggleFavorite } = useFavorites()

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image]
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState<Tab>("description")
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? 0 : null
  )
  const favorited = isFavorited(product.id)

  const listPrice = selectedVariant !== null && product.variants
    ? product.variants[selectedVariant].price
    : product.price
  const activePrice = getEffectivePrice({ price: listPrice, discountPct: product.discountPct })

  function handleAdd() {
    const item =
      selectedVariant !== null && product.variants
        ? {
            ...product,
            price: product.variants[selectedVariant].price,
            name: `${product.name} — ${product.variants[selectedVariant].label}`,
          }
        : product
    for (let i = 0; i < qty; i++) addItem(item)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 10

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:py-16 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.18em] text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-gold">Home</Link>
        <ChevronRight className="size-3" />
        <Link href="/shop" className="transition-colors hover:text-gold">Shop</Link>
        <ChevronRight className="size-3" />
        <Link href={`/shop?category=${product.category.toLowerCase()}`} className="transition-colors hover:text-gold">
          {product.category}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

        {/* ── Left: Image gallery ── */}
        <div className="flex gap-4">
          {/* Thumbnails — vertical strip on desktop, hidden on mobile */}
          {gallery.length > 1 && (
            <div className="hidden sm:flex flex-col gap-2.5 shrink-0">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "relative size-[72px] overflow-hidden border transition-all duration-200",
                    i === activeImg ? "border-gold" : "border-border hover:border-gold/60",
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    sizes="72px"
                    className="object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="relative flex-1 overflow-hidden border border-border bg-secondary">
            {product.tag && (
              <span className={cn(
                "absolute left-4 top-4 z-10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
                product.tag === "Bestseller" ? "bg-gold text-gold-foreground" : "bg-accent text-accent-foreground",
              )}>
                {product.tag}
              </span>
            )}
            <div className="relative aspect-4/5">
              <Image
                src={gallery[activeImg] || product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain mix-blend-multiply transition-opacity duration-300"
              />
            </div>

            {/* Mobile thumbnail dots */}
            {gallery.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:hidden">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "size-1.5 rounded-full transition-all",
                      i === activeImg ? "bg-foreground w-4" : "bg-foreground/30",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Product info ── */}
        <div className="flex flex-col">
          <p className="text-[11px] font-light uppercase tracking-[0.24em] text-gold">{product.brand}</p>
          <h1 className="mt-2 text-balance font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
            {product.name}
          </h1>

          {/* Stars + review count */}
          <div className="mt-3 flex items-center gap-2">
            <StarRow rating={Math.round(product.rating)} size="md" />
            <span className="text-sm font-light text-muted-foreground">
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            {hasDiscount(product) && (
              <p className="font-serif text-xl font-light text-muted-foreground line-through">
                {formatPrice(listPrice)}
              </p>
            )}
            <p className="font-serif text-3xl font-medium text-foreground">
              {formatPrice(activePrice)}
            </p>
            {hasDiscount(product) && (
              <span className="border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                {product.discountPct}% off
              </span>
            )}
          </div>

          {/* Stock status */}
          <p className={cn(
            "mt-2 text-sm font-light",
            inStock ? (lowStock ? "text-amber-600" : "text-emerald-700") : "text-destructive",
          )}>
            {inStock
              ? (lowStock ? `● Only ${product.stock} left in stock` : "● In stock — ships within 24 hours")
              : "● Currently out of stock"}
          </p>

          <span className="my-6 h-px w-full bg-border" />

          <p className="text-pretty text-sm font-light leading-relaxed text-muted-foreground md:text-[15px]">
            {product.description}
          </p>

          {/* Key ingredients chips */}
          {product.ingredients.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Key Ingredients</p>
              <div className="flex flex-wrap gap-1.5">
                {product.ingredients.map(i => (
                  <span key={i} className="border border-border px-3 py-1 text-xs font-light text-foreground/80">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variant / size selector */}
          {product.variants && product.variants.length > 0 ? (
            <div className="mt-5">
              <div className="mb-2 flex items-baseline gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Size / Variant</p>
                {selectedVariant !== null && (
                  <span className="text-xs font-light text-muted-foreground">
                    — {product.variants[selectedVariant].label}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => setSelectedVariant(idx)}
                    className={cn(
                      "flex flex-col items-center border px-4 py-2 text-xs transition-all",
                      selectedVariant === idx
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground",
                    )}
                  >
                    <span className="font-medium">{v.label}</span>
                    <span className={cn("text-[11px] mt-0.5", selectedVariant === idx ? "text-background/70" : "text-muted-foreground")}>
                      {formatPrice(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : product.size ? (
            <div className="mt-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Size</p>
              <span className="inline-flex border border-foreground px-4 py-2 text-sm font-light">
                {product.size}
              </span>
            </div>
          ) : null}

          {/* Qty + Add to cart + Wishlist */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            {/* Wishlist */}
            <button
              type="button"
              onClick={() => toggleFavorite(product)}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              className={cn(
                "flex items-center justify-center size-12 border transition-all duration-300 shrink-0",
                favorited
                  ? "border-gold bg-lavender text-gold"
                  : "border-border text-muted-foreground hover:border-gold hover:text-gold",
              )}
            >
              <Heart className={cn("size-5 transition-all", favorited && "fill-gold")} />
            </button>

            {/* Qty stepper */}
            <div className="flex items-center border border-border sm:w-32 shrink-0">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="flex size-12 items-center justify-center text-foreground transition-colors hover:text-gold"
              >
                <Minus className="size-4" />
              </button>
              <span className="flex-1 text-center text-sm font-light tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty(q => q + 1)}
                className="flex size-12 items-center justify-center text-foreground transition-colors hover:text-gold"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inStock}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-300",
                !inStock
                  ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                  : added
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-foreground bg-foreground text-background hover:border-gold hover:bg-gold hover:text-gold-foreground",
              )}
            >
              {added ? <><Check className="size-4" /> Added to Cart</> : "Add to Cart"}
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-gold shrink-0" />
              <span className="font-light">Nationwide delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-gold shrink-0" />
              <span className="font-light">100% authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="size-4 text-gold shrink-0" />
              <span className="font-light">Easy returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs: Description / How to Use / Ingredients ── */}
      <div className="mt-16">
        <div className="flex border-b border-border gap-0">
          {(["description", "how-to-use", "ingredients"] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "pb-4 pr-8 text-sm capitalize transition-colors",
                tab === t
                  ? "border-b-2 border-foreground text-foreground font-medium -mb-px"
                  : "text-muted-foreground hover:text-foreground font-light",
              )}
            >
              {t === "how-to-use" ? "How to Use" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="py-8 max-w-3xl text-[15px] text-muted-foreground leading-relaxed">
          {tab === "description" && (
            <>
              <p>{product.description}</p>
              {product.benefits.length > 0 && (
                <>
                  <h4 className="mt-7 mb-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground">Benefits</h4>
                  <ul className="space-y-2">
                    {product.benefits.map(b => (
                      <li key={b} className="flex items-center gap-3 text-sm">
                        <Check className="size-4 text-gold shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {product.concerns.length > 0 && (
                <>
                  <h4 className="mt-7 mb-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground">Best for</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.concerns.map(c => (
                      <Link
                        key={c}
                        href={`/concern/${c.toLowerCase().replace(/\s+/g, "-")}`}
                        className="border border-border px-3 py-1 text-xs font-light transition-colors hover:border-gold hover:text-gold"
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === "how-to-use" && (
            <>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground">Application</h4>
              <p>
                Apply a small amount to clean, {product.category === "Sunscreen" ? "dry" : "slightly damp"} skin.
                {product.category === "Serums" || product.category === "Treatments"
                  ? " Use 3–4 drops and gently press into the skin. Allow to absorb fully before applying moisturiser and SPF in the AM."
                  : product.category === "Cleansers"
                  ? " Massage gently over face and neck for 30 seconds. Rinse thoroughly with lukewarm water. Pat dry."
                  : " Massage gently using upward circular motions until fully absorbed. Follow with SPF in the AM."}
              </p>
              <h4 className="mt-7 mb-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground">When to use</h4>
              <p>
                {product.category === "Sunscreen"
                  ? "Apply as the last step in your morning routine, 15 minutes before sun exposure. Reapply every 2 hours outdoors."
                  : product.category === "Treatments"
                  ? "Evening use recommended. Start 2–3 times per week and increase frequency as tolerated. Always follow with SPF the next morning."
                  : "Use morning and/or evening as part of your regular skincare routine."}
              </p>
              <h4 className="mt-7 mb-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground">Tips</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Patch test on the inner arm before first use if you have sensitive skin</li>
                <li>Store in a cool, dry place away from direct sunlight</li>
                <li>Consistent use over 4–6 weeks is recommended to see full results</li>
              </ul>
            </>
          )}

          {tab === "ingredients" && (
            <>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground">Key Ingredients</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {product.ingredients.map(i => (
                  <Link
                    key={i}
                    href={`/ingredient/${i.toLowerCase().replace(/\s+/g, "-").replace("/", "-")}`}
                    className="border border-gold/40 bg-lavender px-3 py-1.5 text-xs font-light text-gold transition-colors hover:bg-lavender"
                  >
                    {i}
                  </Link>
                ))}
              </div>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground">Full Ingredient List</h4>
              <p className="text-sm font-light leading-relaxed">
                Aqua, {product.ingredients.join(", ")}, Glycerin, Sodium Hyaluronate, Panthenol, Allantoin, Tocopherol, Carbomer, Sodium Hydroxide, Phenoxyethanol, Ethylhexylglycerin.
              </p>
              <p className="mt-4 text-xs font-light text-muted-foreground/70">
                * Full ingredient list for reference purposes. Always check physical packaging for the most accurate information.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
