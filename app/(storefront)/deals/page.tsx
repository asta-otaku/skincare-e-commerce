"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Tag, ArrowRight, Check } from "lucide-react"
import { type Deal, dealAsProduct } from "@/lib/deals"
import { getActiveDeals } from "@/lib/supabase/deals"
import { useCart } from "@/components/cart-provider"
import { cn } from "@/lib/utils"
import { whatsAppHref } from "@/lib/whatsapp"

export default function DealsPage() {
  const [activeDeals, setActiveDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveDeals().then(data => {
      setActiveDeals(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold mb-2">Save More</p>
        <h1 className="font-serif text-4xl font-medium">Combo Deals & Kits</h1>
        <p className="mt-2 text-base font-light text-muted-foreground max-w-xl">
          Expertly curated skincare bundles at discounted prices. All products are authentic and sourced directly from authorised distributors.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Free delivery on all bundles", "Authentic guaranteed", "Same-day dispatch"].map(b => (
            <span key={b} className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-light text-muted-foreground">
              <Tag className="size-3 text-gold" /> {b}
            </span>
          ))}
        </div>
      </div>

      {/* Deals grid — only active deals shown on storefront */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="border border-border p-6 space-y-3">
                <div className="h-4 w-24 bg-muted/50 animate-pulse" />
                <div className="h-6 w-full bg-muted/50 animate-pulse" />
                <div className="h-3 w-40 bg-muted/30 animate-pulse" />
                <div className="h-20 w-full bg-muted/20 animate-pulse mt-4" />
              </div>
            ))
          : activeDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))
        }
      </div>

      {/* Custom bundle CTA */}
      <div className="mt-14 bg-muted/40 border border-border p-8 text-center">
        <h3 className="font-serif text-2xl font-medium mb-2">Need a custom bundle?</h3>
        <p className="text-sm font-light text-muted-foreground mb-5 max-w-md mx-auto">
          Can't find the right combination? Chat with us on WhatsApp and we'll curate a personalised skincare kit just for you.
        </p>
        <a
          href={whatsAppHref("Hi! I'd like a custom skincare bundle recommendation.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
        >
          Chat on WhatsApp <ArrowRight className="size-3.5" />
        </a>
      </div>
    </div>
  )
}

function DealCard({ deal }: { deal: Deal }) {
  const { addItem, openCart } = useCart()
  const [added, setAdded] = useState(false)

  function handleAddBundle() {
    addItem(dealAsProduct(deal))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    // Open cart drawer to confirm
    setTimeout(() => openCart(), 300)
  }

  return (
    <div
      className={cn(
        "flex flex-col border p-6 transition-all hover:shadow-md",
        deal.highlight ? "border-gold/60 bg-gold/5" : "border-border hover:border-gold/40",
      )}
    >
      {/* Badge + brand */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-light uppercase tracking-[0.18em] text-gold">{deal.brand}</span>
        <span className="bg-gold text-gold-foreground px-2 py-0.5 text-[11px] font-medium">{deal.badge}</span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl font-medium">{deal.title}</h3>
      <p className="mt-0.5 text-xs font-light text-muted-foreground">{deal.subtitle}</p>
      <p className="mt-1.5 text-[10px] font-light text-gold">{deal.concern}</p>

      {/* Items list */}
      <div className="mt-4 flex-1 space-y-2 border-t border-border pt-4">
        {deal.items.map(item => (
          <div key={item.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="size-1.5 shrink-0 rounded-full bg-gold" />
              <span className="text-xs font-light text-foreground/80 truncate">{item.name}</span>
            </div>
            <span className="text-[11px] font-light text-muted-foreground shrink-0">
              {item.size} · ₦{item.price.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Price + CTA */}
      <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs font-light line-through text-muted-foreground">
            ₦{deal.originalPrice.toLocaleString()}
          </p>
          <p className="font-serif text-2xl font-medium">₦{deal.salePrice.toLocaleString()}</p>
        </div>
        <button
          type="button"
          onClick={handleAddBundle}
          className={cn(
            "flex items-center gap-1.5 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] transition-all",
            added
              ? "bg-gold text-gold-foreground"
              : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
          )}
        >
          {added ? (
            <><Check className="size-3.5" /> Added!</>
          ) : (
            <><ShoppingBag className="size-3.5" /> Add Bundle</>
          )}
        </button>
      </div>

      {/* View deal details link */}
      <Link
        href={`/cart`}
        className="mt-3 text-center text-[11px] font-light text-muted-foreground underline-offset-2 hover:text-gold hover:underline transition-colors"
      >
        View cart →
      </Link>
    </div>
  )
}
