"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/products"
import { cn } from "@/lib/utils"

export function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, removeItem, updateQuantity } = useCart()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [closeCart])

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={cn(
          "fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-400",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-[18px] text-foreground/70" />
            <span className="font-serif text-lg font-medium tracking-wide">
              Your Cart
            </span>
            {count > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-gold-foreground">
                {count}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex size-8 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-serif text-xl font-medium">Your cart is empty</p>
              <p className="mt-1.5 text-sm font-light text-muted-foreground">
                Discover our curated rituals and add your favourites.
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="mt-2 border border-foreground px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
            >
              <Link href="/shop" onClick={closeCart}>
                Shop Now
              </Link>
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-5">
                    {/* Image — bundles show a gift icon tile instead of broken product link */}
                    {item.id.startsWith("deal__") ? (
                      <div className="relative flex size-20 shrink-0 items-center justify-center border border-gold/30 bg-lavender">
                        <ShoppingBag className="size-7 text-gold/60" />
                      </div>
                    ) : (
                      <Link
                        href={`/product/${item.id}`}
                        onClick={closeCart}
                        className="relative size-20 shrink-0 overflow-hidden border border-border bg-muted"
                      >
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-contain mix-blend-multiply"
                        />
                      </Link>
                    )}

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gold">
                            {item.id.startsWith("deal__") ? "Bundle Deal" : item.category}
                          </p>
                          {item.id.startsWith("deal__") ? (
                            <span className="text-sm font-medium leading-snug">{item.name}</span>
                          ) : (
                            <Link
                              href={`/product/${item.id}`}
                              onClick={closeCart}
                              className="text-sm font-medium leading-snug transition-colors hover:text-gold"
                            >
                              {item.name}
                            </Link>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="mt-0.5 text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-light text-muted-foreground">{item.tagline}</p>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Qty controls */}
                        <div className="flex items-center border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex size-7 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex size-7 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-5 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-serif text-lg font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] font-light text-muted-foreground">
                Shipping &amp; taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full bg-foreground py-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-background transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                Proceed to Checkout
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="block w-full py-2 text-center text-xs font-light uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
