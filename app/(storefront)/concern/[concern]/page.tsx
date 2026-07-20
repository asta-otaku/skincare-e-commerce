import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { ALL_CONCERNS } from "@/lib/products"
import { queryProducts } from "@/lib/supabase/products"

function slugToLabel(slug: string) {
  return ALL_CONCERNS.find(c => c.toLowerCase().replace(/\s+/g, "-").replace("/", "-") === slug) ?? null
}

export function generateStaticParams() {
  return ALL_CONCERNS.map(c => ({ concern: c.toLowerCase().replace(/\s+/g, "-").replace("/", "-") }))
}

export async function generateMetadata({ params }: { params: Promise<{ concern: string }> }): Promise<Metadata> {
  const { concern } = await params
  const label = slugToLabel(concern)
  if (!label) return {}
  return {
    title: `${label} — Shop by Concern · HAYDA SKINCo.`,
    description: `Browse products formulated for ${label.toLowerCase()}. Trusted brands, authentic products, delivered nationwide.`,
  }
}

const CONCERN_INFO: Record<string, { desc: string; tip: string }> = {
  "Acne":            { desc: "Targeted formulas to clear breakouts, reduce inflammation, and prevent future blemishes.",   tip: "Look for salicylic acid, niacinamide, and benzoyl peroxide." },
  "Hyperpigmentation":{ desc: "Brightening actives to fade dark spots, even skin tone, and restore a luminous complexion.", tip: "Vitamin C, niacinamide, and AHAs are your go-to ingredients." },
  "Anti-Ageing":     { desc: "Clinically proven anti-ageing formulas to smooth fine lines, firm skin, and boost elasticity.", tip: "Retinol, peptides, and antioxidants deliver the best results." },
  "Dry Skin":        { desc: "Rich, barrier-repairing formulas that lock in moisture and soothe tightness and flaking.",    tip: "Ceramides, hyaluronic acid, and glycerin are essential." },
  "Oily Skin":       { desc: "Lightweight, non-comedogenic formulas that balance sebum, minimise pores, and mattify.",      tip: "Niacinamide, BHA, and clay-based products work best." },
  "Sensitive Skin":  { desc: "Gentle, fragrance-free formulas that calm redness, reduce reactivity, and strengthen the skin barrier.", tip: "Avoid fragrance and alcohol; choose ceramide-rich formulas." },
}

export default async function ConcernPage({ params }: { params: Promise<{ concern: string }> }) {
  const { concern } = await params
  const label = slugToLabel(concern)
  if (!label) notFound()

  const filtered = await queryProducts({ concern: label })
  const info = CONCERN_INFO[label]

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <Link href="/shop" className="mb-6 flex items-center gap-1.5 text-xs font-light uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-3.5" /> Shop
      </Link>

      <div className="mb-10 border-b border-border pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold mb-2">Shop by Concern</p>
        <h1 className="font-serif text-4xl font-medium">{label}</h1>
        {info && (
          <>
            <p className="mt-3 text-base font-light text-muted-foreground max-w-xl">{info.desc}</p>
            <div className="mt-4 inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-4 py-2.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-gold">Pro tip:</span>
              <span className="text-xs font-light text-foreground/80">{info.tip}</span>
            </div>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-2xl font-medium text-muted-foreground">More products coming soon.</p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 border border-border px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors">
            Browse all products
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm font-light text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""} for {label}</p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </>
      )}

      {/* Other concerns */}
      <div className="mt-16 border-t border-border pt-10">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Other Concerns</p>
        <div className="flex flex-wrap gap-2">
          {ALL_CONCERNS.filter(c => c !== label).map(c => (
            <Link
              key={c}
              href={`/concern/${c.toLowerCase().replace(/\s+/g, "-").replace("/", "-")}`}
              className="border border-border px-4 py-2 text-xs font-light hover:border-gold hover:text-gold transition-colors"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
