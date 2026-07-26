"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Building2, Package, Truck, HeadphonesIcon } from "lucide-react"
import type { Product } from "@/lib/products"
import { getWholesaleProducts } from "@/lib/supabase/products"
import { getActiveBrands, type Brand } from "@/lib/supabase/brands"
import { WholesaleProductCard } from "@/components/wholesale-product-card"

const PERKS = [
  { icon: Package, title: "Wholesale Pricing", desc: "Tiered discounts based on order volume — the more you buy, the more you save." },
  { icon: Truck, title: "Nationwide Delivery", desc: "We deliver to salons, clinics, spas, and retailers across all states in Nigeria." },
  { icon: Building2, title: "Authentic Products", desc: "All products are 100% authentic, sourced from authorised distributors." },
  { icon: HeadphonesIcon, title: "Dedicated Support", desc: "A dedicated account manager to handle your orders and enquiries." },
]

const MINIMUMS = [
  { tier: "Starter", min: "₦100,000", discount: "10% off", note: "Perfect for small businesses" },
  { tier: "Growth", min: "₦250,000", discount: "15% off", note: "For growing salons & clinics" },
  { tier: "Scale", min: "₦500,000+", discount: "20% off", note: "For distributors & large retailers" },
]

export default function WholesalePage() {
  const [form, setForm] = useState({
    name: "", business: "", email: "", phone: "", type: "", volume: "", message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setProductsLoading(true)
      const [tiered, brandList] = await Promise.all([
        getWholesaleProducts(48),
        getActiveBrands(),
      ])
      if (cancelled) return
      setProducts(tiered)
      setBrands(brandList)
      setProductsLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not submit enquiry.")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Could not submit enquiry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold mb-2">For Businesses</p>
        <h1 className="font-serif text-4xl font-medium">Wholesale Store</h1>
        <p className="mt-2 text-base font-light text-muted-foreground max-w-xl">
          Supply your salon, spa, clinic, or store with authentic premium skincare brands at competitive wholesale prices. We partner with businesses of all sizes across Nigeria.
        </p>
      </div>

      {/* Volume-priced products */}
      <section className="mb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-medium">Volume pricing</h2>
            <p className="mt-1 text-sm font-light text-muted-foreground max-w-xl">
              Products with quantity breaks — buy more, pay less per unit. Tap through to order on the product page.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-medium uppercase tracking-[0.15em] text-gold hover:underline"
          >
            Browse full shop →
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-border">
                <div className="aspect-square bg-muted/50 animate-pulse" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-3/4 bg-muted/50 animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted/40 animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted/50 animate-pulse mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-14 text-center">
            <p className="font-serif text-xl font-medium">No volume deals yet</p>
            <p className="mt-2 text-sm font-light text-muted-foreground max-w-md mx-auto">
              Products with tiered wholesale pricing will appear here once they&apos;re set up in the catalogue.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block border border-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors"
            >
              Shop all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <WholesaleProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-14 lg:grid-cols-2">
        {/* Left: info */}
        <div className="space-y-10">
          {/* Perks */}
          <div>
            <h2 className="font-serif text-2xl font-medium mb-6">Why partner with HAYDA?</h2>
            <div className="space-y-5">
              {PERKS.map(perk => (
                <div key={perk.title} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center border border-border bg-secondary">
                    <perk.icon className="size-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{perk.title}</p>
                    <p className="mt-0.5 text-sm font-light text-muted-foreground">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing tiers */}
          <div>
            <h2 className="font-serif text-2xl font-medium mb-5">Account tiers</h2>
            <div className="space-y-3">
              {MINIMUMS.map((tier, i) => (
                <div key={tier.tier} className={`border p-4 ${i === 1 ? "border-gold/60 bg-lavender" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{tier.tier}</p>
                    <span className="border border-gold/40 bg-lavender px-2.5 py-0.5 text-[11px] font-medium text-gold">
                      {tier.discount}
                    </span>
                  </div>
                  <p className="text-xs font-light text-muted-foreground">Minimum order: <span className="font-medium text-foreground">{tier.min}</span></p>
                  <p className="text-[10px] font-light text-muted-foreground mt-0.5">{tier.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Brands supplied */}
          <div>
            <h2 className="font-serif text-xl font-medium mb-3">Brands we supply</h2>
            <div className="flex flex-wrap gap-2">
              {(brands.length
                ? brands.map(b => b.name)
                : ["CeraVe", "The Ordinary", "La Roche-Posay", "COSRX", "Paula's Choice", "Neutrogena", "Cetaphil", "Bioderma"]
              ).map(b => (
                <span key={b} className="border border-border px-3 py-1.5 text-xs font-light text-muted-foreground">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: enquiry form */}
        <div className="border border-border p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="flex size-14 items-center justify-center rounded-full bg-green-50 mb-4">
                <Check className="size-6 text-green-600" />
              </div>
              <h3 className="font-serif text-2xl font-medium mb-2">Enquiry Received!</h3>
              <p className="text-sm font-light text-muted-foreground max-w-xs">
                Thank you for your interest. Our wholesale team will contact you within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-medium mb-1">Wholesale Enquiry</h2>
              <p className="text-sm font-light text-muted-foreground mb-6">Fill the form and we&apos;ll be in touch within 24 hours.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Full Name *</span>
                    <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Jane Adeyemi" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Business Name *</span>
                    <input required type="text" value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))} className="input-field" placeholder="Glow Studio" />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Email Address *</span>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="jane@glowstudio.com" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Phone Number *</span>
                  <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+234 813 730 9609" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Business Type *</span>
                  <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                    <option value="">Select…</option>
                    {["Salon / Spa", "Skincare Clinic / Dermatology", "Pharmacy / Chemist", "Retail Store", "Online Reseller", "Distributor", "Other"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Monthly Order Volume</span>
                  <select value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))} className="input-field">
                    <option value="">Select…</option>
                    {["Under ₦100,000", "₦100,000 – ₦250,000", "₦250,000 – ₦500,000", "₦500,000+"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Additional Notes</span>
                  <textarea rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-field resize-none" placeholder="Tell us what products or brands you're interested in…" />
                </label>
                {error && (
                  <p className="text-sm font-light text-destructive">{error}</p>
                )}
                <button type="submit" disabled={loading} className="w-full bg-foreground py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-background transition-all hover:bg-gold hover:text-gold-foreground disabled:opacity-60">
                  {loading ? "Submitting…" : "Submit Enquiry"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 300;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: var(--foreground);
        }
      `}</style>
    </div>
  )
}
