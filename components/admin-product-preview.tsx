import { formatPrice, getEffectivePrice, hasDiscount } from "@/lib/products"
import { cn } from "@/lib/utils"

/**
 * Static storefront card for the product editor.
 * Mirrors the shop card (light image field, object-contain, small-caps brand,
 * serif name, naira price) without cart or favourites providers.
 */
export function AdminProductPreview({
  name,
  brand,
  tagline,
  price,
  discountPct,
  imageSrc,
  className,
}: {
  name: string
  brand: string
  tagline: string
  price: string
  discountPct: string
  imageSrc?: string
  className?: string
}) {
  const priceNum = Number(price)
  const discount = Math.min(100, Math.max(0, parseInt(discountPct, 10) || 0))
  const hasPrice = price.trim() !== "" && Number.isFinite(priceNum) && priceNum > 0
  const priced = { price: hasPrice ? priceNum : 0, discountPct: discount }
  const showDiscount = hasPrice && hasDiscount(priced)
  const displayName = name.trim()
  const displayBrand = brand.trim()
  const displayTagline = tagline.trim()
  const image = imageSrc?.trim()

  return (
    <section aria-label="Storefront card preview" className={cn("border border-border p-6", className)}>
      <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em]">Storefront preview</h2>
      <article className="mx-auto flex w-full max-w-[240px] flex-col">
        <div className="relative aspect-4/5 overflow-hidden border border-border bg-secondary">
          {showDiscount && (
            <span className="absolute left-3 top-3 z-10 bg-foreground px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-background">
              -{discount}%
            </span>
          )}
          {image ? (
            <div className="absolute inset-0 p-4">
              {/* Plain img so unsaved blob: previews render. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={displayName || "Product image"}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[10px] font-light uppercase tracking-[0.16em] text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col items-center px-1 pt-4 text-center">
          <p
            className={cn(
              "text-[10px] font-light uppercase tracking-[0.22em]",
              displayBrand ? "text-gold" : "text-muted-foreground/50",
            )}
          >
            {displayBrand || "Brand"}
          </p>
          <h3
            className={cn(
              "mt-2 line-clamp-2 font-serif text-lg font-medium leading-snug",
              displayName ? "text-foreground" : "text-muted-foreground/50",
            )}
          >
            {displayName || "Product name"}
          </h3>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-xs font-light",
              displayTagline ? "text-muted-foreground" : "text-muted-foreground/50",
            )}
          >
            {displayTagline || "Tagline"}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {showDiscount ? (
              <>
                <p className="text-sm font-light tracking-wide text-muted-foreground line-through">
                  {formatPrice(priceNum)}
                </p>
                <p className="text-sm font-medium tracking-wide text-foreground">
                  {formatPrice(getEffectivePrice(priced))}
                </p>
              </>
            ) : hasPrice ? (
              <p className="text-sm font-light tracking-wide text-foreground">{formatPrice(priceNum)}</p>
            ) : (
              <p className="text-sm font-light tracking-wide text-muted-foreground/50">₦—</p>
            )}
          </div>
        </div>
      </article>
    </section>
  )
}
