"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { BRANDS, type Product } from "@/lib/products"
import { getFeaturedProducts } from "@/lib/supabase/products"
import { deals, dealAsProduct } from "@/lib/deals"
import { journals } from "@/lib/journals"
import { useCart } from "@/components/cart-provider"
import { cn } from "@/lib/utils"

/* ─── Hero data ─────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    eyebrow: "New Arrivals",
    title: "Niacinamide\n& Beyond",
    subtitle: "Discover targeted serums and treatments from The Ordinary, COSRX & Paula's Choice.",
    cta: "Shop Serums",
    href: "/shop?category=serums",
    gradient: "from-[#E8D5F5] via-[#F0EBF5] to-[#FAF7FD]",
    image: "/product-serum.png",
    productName: "Niacinamide 10% + Zinc",
    productBrand: "The Ordinary",
    productPrice: "₦3,800",
    productHref: "/product/ordinary-niacinamide",
  },
  {
    eyebrow: "Bestsellers",
    title: "Skin Barrier\nEssentials",
    subtitle: "CeraVe and La Roche-Posay formulas trusted by dermatologists worldwide.",
    cta: "Shop Moisturisers",
    href: "/shop?category=moisturisers",
    gradient: "from-[#D5E8F5] via-[#EBF3F9] to-[#F5FAFD]",
    image: "/product-cream.png",
    productName: "Moisturising Cream",
    productBrand: "CeraVe",
    productPrice: "₦8,900",
    productHref: "/product/cerave-moisturising-cream",
  },
  {
    eyebrow: "Sun Protection",
    title: "SPF Every\nSingle Day",
    subtitle: "Premium sunscreens for Lagos weather — lightweight, no white cast, daily protection.",
    cta: "Shop Sunscreen",
    href: "/shop?category=sunscreen",
    gradient: "from-[#F5EBD5] via-[#FAF3EB] to-[#FFFAF5]",
    image: "/product-cleanser.png",
    productName: "Anthelios UVMune SPF 50+",
    productBrand: "La Roche-Posay",
    productPrice: "₦16,000",
    productHref: "/product/lrp-anthelios-spf50",
  },
]

const CATEGORIES = [
  { label: "Face",         href: "/shop?category=face",        emoji: "✨", desc: "Cleanse · Treat · Protect" },
  { label: "Bath & Body",  href: "/shop?category=bath-body",   emoji: "🛁", desc: "Lotions · Oils · Scrubs" },
  { label: "Fragrance",    href: "/shop?category=fragrance",   emoji: "🌸", desc: "Perfumes · Mists · Roll-ons" },
  { label: "Makeup",       href: "/shop?category=makeup",      emoji: "💄", desc: "Lips · Eyes · Face" },
  { label: "Sunscreen",    href: "/shop?category=sunscreen",   emoji: "☀️", desc: "SPF 30 · SPF 50+ · Tinted" },
  { label: "Combo Deals",  href: "/deals",                     emoji: "🎁", desc: "Save up to 20%" },
]

const CONCERNS = [
  { label: "Acne",            href: "/concern/acne",              color: "bg-red-50 border-red-100 hover:border-red-300" },
  { label: "Hyperpigmentation", href: "/concern/hyperpigmentation", color: "bg-amber-50 border-amber-100 hover:border-amber-300" },
  { label: "Anti-Ageing",     href: "/concern/anti-ageing",       color: "bg-purple-50 border-purple-100 hover:border-purple-300" },
  { label: "Dry Skin",        href: "/concern/dry-skin",          color: "bg-blue-50 border-blue-100 hover:border-blue-300" },
  { label: "Oily Skin",       href: "/concern/oily-skin",         color: "bg-green-50 border-green-100 hover:border-green-300" },
  { label: "Sensitive Skin",  href: "/concern/sensitive-skin",    color: "bg-pink-50 border-pink-100 hover:border-pink-300" },
]

// Pull first 3 active deals from shared data layer
const COMBO_DEALS = deals.filter(d => d.status === "active").slice(0, 3)

/* ─── Hero slider ───────────────────────────────────────────── */
function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  // Fix: use functional setState everywhere — no stale-closure bug
  function goTo(next: number) {
    setFading(true)
    setTimeout(() => {
      setCurrent(next)
      setFading(false)
    }, 200)
  }

  function advance() {
    setCurrent(prev => {
      const next = (prev + 1) % HERO_SLIDES.length
      setFading(true)
      setTimeout(() => setFading(false), 200)
      return next
    })
  }

  useEffect(() => {
    const t = setInterval(advance, 5500)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slide = HERO_SLIDES[current]

  return (
    <section className={cn("relative overflow-hidden transition-colors duration-700 bg-linear-to-br", slide.gradient)}>
      <div className="mx-auto grid min-h-[82vh] max-w-7xl grid-cols-1 items-center px-5 lg:grid-cols-2 lg:px-8">

        {/* ── Left: Text ── */}
        <div className={cn(
          "flex flex-col justify-center py-16 lg:py-0 transition-opacity duration-200",
          fading ? "opacity-0" : "opacity-100",
        )}>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold">
            {slide.eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-[1.1] text-foreground md:text-6xl lg:text-[4.5rem] whitespace-pre-line">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-sm text-base font-light leading-relaxed text-muted-foreground">
            {slide.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={slide.href}
              className="flex items-center gap-2 bg-foreground px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-background transition-all hover:bg-gold hover:text-gold-foreground"
            >
              {slide.cta} <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-2 border border-foreground/30 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-all hover:border-foreground"
            >
              View All
            </Link>
          </div>

          {/* Slide dots */}
          <div className="mt-10 flex items-center gap-2.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === current ? "w-8 bg-foreground" : "w-2 bg-foreground/25 hover:bg-foreground/50",
                )}
              />
            ))}
          </div>
        </div>

        {/* ── Right: Product image — centered, fills height ── */}
        <div className={cn(
          "relative hidden lg:flex items-center justify-center h-[82vh] transition-opacity duration-200",
          fading ? "opacity-0" : "opacity-100",
        )}>
          {/* Image fills the column, centered — mix-blend-mode removes white bg */}
          <div className="relative w-[80%] h-[82%]">
            <Image
              src={slide.image}
              alt={slide.productName}
              fill
              sizes="35vw"
              className="object-contain mix-blend-multiply"
              priority={current === 0}
            />
          </div>

          {/* Product badge — bottom-left of image column */}
          <Link
            href={slide.productHref}
            className={cn(
              "absolute bottom-8 left-4 flex items-center gap-3 border border-border/60 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-md transition-all hover:shadow-lg hover:border-gold/50",
              fading ? "opacity-0" : "opacity-100",
            )}
          >
            <div className="relative size-10 shrink-0 overflow-hidden border border-border bg-muted/40">
              <Image src={slide.image} alt={slide.productName} fill sizes="40px" className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-light uppercase tracking-[0.15em] text-gold">{slide.productBrand}</p>
              <p className="text-xs font-medium leading-snug">{slide.productName}</p>
              <p className="text-[11px] font-light text-muted-foreground">{slide.productPrice}</p>
            </div>
            <ArrowRight className="size-3.5 ml-1 shrink-0 text-muted-foreground" />
          </Link>
        </div>

      </div>

      {/* Prev / Next arrows — bottom-right corner */}
      <div className="absolute bottom-6 right-5 flex gap-2 lg:right-8">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => goTo(c => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="flex size-9 items-center justify-center border border-foreground/20 bg-background/60 backdrop-blur-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => goTo(c => (c + 1) % HERO_SLIDES.length)}
          className="flex size-9 items-center justify-center border border-foreground/20 bg-background/60 backdrop-blur-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
/* ─── Home deal card with cart button ───────────────────────── */
function HomeDealCard({ deal }: { deal: typeof deals[number] }) {
  const { addItem, openCart } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(dealAsProduct(deal))
    setAdded(true)
    setTimeout(() => { setAdded(false); openCart() }, 400)
  }

  return (
    <div className="group border border-border p-6 transition-all hover:border-gold/60 hover:bg-muted/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gold">{deal.brand}</p>
          <h3 className="mt-1 font-serif text-xl font-medium">{deal.title}</h3>
        </div>
        <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold-foreground">
          {deal.badge}
        </span>
      </div>
      <ul className="space-y-1.5 mb-5">
        {deal.items.map(item => (
          <li key={item.name} className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <span className="size-1.5 rounded-full bg-gold shrink-0" /> {item.name}
          </li>
        ))}
      </ul>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-light line-through text-muted-foreground">
            ₦{deal.originalPrice.toLocaleString()}
          </p>
          <p className="font-serif text-xl font-medium text-foreground">₦{deal.salePrice.toLocaleString()}</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] transition-all",
            added ? "bg-gold text-gold-foreground" : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
          )}
        >
          <ShoppingBag className="size-3" />
          {added ? "Added!" : "Add Bundle"}
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const recentArticles = journals.filter(j => j.status === "published").slice(0, 3)

  useEffect(() => {
    getFeaturedProducts(4).then(setNewArrivals)
  }, [])

  return (
    <>
      <HeroSlider />

      {/* ── Shop by Category ── */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">Explore</p>
            <h2 className="mt-1.5 font-serif text-3xl font-medium">Shop by Category</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors sm:flex">
            All Products <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group flex flex-col items-center gap-3 border border-border p-5 text-center transition-all hover:border-gold/60 hover:bg-muted/30"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <p className="text-sm font-medium group-hover:text-gold transition-colors">{cat.label}</p>
                <p className="mt-0.5 text-[10px] font-light text-muted-foreground">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Shop by Concern ── */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">Personalised for you</p>
            <h2 className="mt-1.5 font-serif text-3xl font-medium">What&rsquo;s your skin concern?</h2>
            <p className="mt-2 text-sm font-light text-muted-foreground">We&rsquo;ll guide you to the right products.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CONCERNS.map(c => (
              <Link
                key={c.label}
                href={c.href}
                className={cn("group flex flex-col items-center gap-2 border p-5 text-center transition-all", c.color)}
              >
                <p className="text-sm font-medium group-hover:underline underline-offset-2">{c.label}</p>
                <ArrowRight className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">Just dropped</p>
            <h2 className="mt-1.5 font-serif text-3xl font-medium">Featured Products</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors sm:flex">
            View All <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 border border-border px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors">
            View All Products <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Brands We Stock ── */}
      <section className="border-y border-border bg-background py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="mb-8 text-center text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Trusted brands in stock
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {BRANDS.map(brand => (
              <Link
                key={brand.id}
                href={`/brands#${brand.id}`}
                className="group flex items-center justify-center border border-border px-5 py-3 transition-all hover:border-gold/60 hover:bg-muted/30 min-w-[120px]"
              >
                <span className="text-sm font-medium text-foreground/60 group-hover:text-foreground transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/brands" className="text-xs font-medium uppercase tracking-[0.15em] text-gold hover:underline underline-offset-2">
              View all brands →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Combo Deals ── */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">Save more</p>
            <h2 className="mt-1.5 font-serif text-3xl font-medium">Combo Deals & Kits</h2>
            <p className="mt-1 text-sm font-light text-muted-foreground">Curated bundles at discounted prices.</p>
          </div>
          <Link href="/deals" className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors sm:flex">
            All Deals <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {COMBO_DEALS.map(deal => (
            <HomeDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* ── Loyalty CTA ── */}
      <section className="bg-foreground py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left md:justify-between">
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Sparkles className="size-4 text-gold" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Rewards Programme</span>
              </div>
              <h2 className="font-serif text-3xl font-medium text-background">Earn points with every purchase</h2>
              <p className="mt-2 text-sm font-light text-background/60 max-w-md">
                Join HAYDA Rewards and earn 1 point for every ₦100 spent. Redeem points for discounts, free products, and exclusive member perks.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row shrink-0">
              <Link href="/register" className="flex items-center gap-2 bg-gold px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-foreground transition-all hover:bg-gold/90">
                Join Free <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/login" className="flex items-center gap-2 border border-background/30 px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-background transition-all hover:border-background/60">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skin Blog ── */}
      {recentArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">Knowledge & Rituals</p>
              <h2 className="mt-1.5 font-serif text-3xl font-medium">From the Skin Blog</h2>
            </div>
            <Link href="/journal" className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors sm:flex">
              All Articles <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {recentArticles.map(article => (
              <Link key={article.id} href={`/journal/${article.slug}`} className="group">
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-muted/40 group-hover:border-gold/60 transition-colors">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="pt-4">
                  <div className="flex items-center gap-3 text-[10px] font-light uppercase tracking-[0.18em]">
                    <span className="text-gold">{article.category}</span>
                    <span className="text-muted-foreground">{article.readTime} min read</span>
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-medium leading-snug group-hover:text-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-light text-muted-foreground line-clamp-2">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
