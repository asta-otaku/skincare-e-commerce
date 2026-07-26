"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/products"
import { getProductsByTag, getDiscountedProducts } from "@/lib/supabase/products"
import { getActiveBrands, type Brand } from "@/lib/supabase/brands"
import { dealAsProduct, type Deal } from "@/lib/deals"
import { getActiveDeals } from "@/lib/supabase/deals"
import { getPublishedJournals } from "@/lib/supabase/journals"
import type { Journal } from "@/lib/journals"
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
    gradient: "from-[#C026D3] via-[#E879F9] to-[#FAE8FF]",
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
    gradient: "from-[#7C3AED] via-[#A78BFA] to-[#EDE9FE]",
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
    gradient: "from-[#9333EA] via-[#D946EF] to-[#FDF4FF]",
    image: "/product-cleanser.png",
    productName: "Anthelios UVMune SPF 50+",
    productBrand: "La Roche-Posay",
    productPrice: "₦16,000",
    productHref: "/product/lrp-anthelios-spf50",
  },
]

const CATEGORIES = [
  { label: "Face", href: "/shop?category=face", emoji: "✨", desc: "Cleanse · Treat · Protect" },
  { label: "Bath & Body", href: "/shop?category=bath-body", emoji: "🛁", desc: "Lotions · Oils · Scrubs" },
  { label: "Fragrance", href: "/shop?category=fragrance", emoji: "🌸", desc: "Perfumes · Mists · Roll-ons" },
  { label: "Makeup", href: "/shop?category=makeup", emoji: "💄", desc: "Lips · Eyes · Face" },
  { label: "Sunscreen", href: "/shop?category=sunscreen", emoji: "☀️", desc: "SPF 30 · SPF 50+ · Tinted" },
  { label: "Combo Deals", href: "/deals", emoji: "🎁", desc: "Save up to 20%" },
]

const CONCERNS = [
  { label: "Acne", href: "/concern/acne", color: "bg-red-50 border-red-100 hover:border-red-300" },
  { label: "Hyperpigmentation", href: "/concern/hyperpigmentation", color: "bg-amber-50 border-amber-100 hover:border-amber-300" },
  { label: "Anti-Ageing", href: "/concern/anti-ageing", color: "bg-purple-50 border-purple-100 hover:border-purple-300" },
  { label: "Dry Skin", href: "/concern/dry-skin", color: "bg-blue-50 border-blue-100 hover:border-blue-300" },
  { label: "Oily Skin", href: "/concern/oily-skin", color: "bg-green-50 border-green-100 hover:border-green-300" },
  { label: "Sensitive Skin", href: "/concern/sensitive-skin", color: "bg-pink-50 border-pink-100 hover:border-pink-300" },
]

/* ─── Hero slider ───────────────────────────────────────────── */
function HeroSlider() {
  const [current, setCurrent] = useState(0)

  function goTo(next: number) {
    setCurrent((next + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  function next() {
    setCurrent(prev => (prev + 1) % HERO_SLIDES.length)
  }

  function prev() {
    setCurrent(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  useEffect(() => {
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.title}
            className={cn("w-full shrink-0 bg-linear-to-br", slide.gradient)}
            aria-hidden={index !== current}
          >
            <div className="mx-auto grid min-h-[82vh] max-w-7xl grid-cols-1 items-center px-5 lg:grid-cols-2 lg:px-8">

              {/* ── Left: Text ── */}
              <div className="flex flex-col justify-center py-16 lg:py-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white">
                  {slide.eyebrow}
                </p>
                <h1 className="mt-4 min-h-[2.2em] font-serif text-5xl font-medium leading-[1.1] text-white md:text-6xl lg:min-h-[calc(2*1.1*4.5rem)] lg:text-[4.5rem] whitespace-pre-line">
                  {slide.title}
                </h1>
                <p className="mt-5 min-h-[4.5rem] max-w-sm text-base font-light leading-relaxed text-white">
                  {slide.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={slide.href}
                    className="flex items-center gap-2 bg-gold px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-foreground transition-colors hover:bg-gold/90"
                    tabIndex={index === current ? undefined : -1}
                  >
                    {slide.cta} <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    href="/shop"
                    className="flex items-center gap-2 border border-white/30 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
                    tabIndex={index === current ? undefined : -1}
                  >
                    View All
                  </Link>
                </div>

                <div className="mt-10 h-1" aria-hidden />
              </div>

              {/* ── Right: Product image ── */}
              <div className="relative hidden h-[82vh] items-center justify-center lg:flex">
                <div className="relative h-[82%] w-[80%]">
                  <Image
                    src={slide.image}
                    alt={slide.productName}
                    fill
                    sizes="35vw"
                    className="object-contain mix-blend-multiply"
                    priority={index === 0}
                  />
                </div>

                <Link
                  href={slide.productHref}
                  className="absolute bottom-8 left-4 flex items-center gap-3 border border-border/60 bg-white/80 px-4 py-3 shadow-md backdrop-blur-sm transition-all hover:border-gold/50 hover:shadow-lg"
                  tabIndex={index === current ? undefined : -1}
                >
                  <div className="relative size-10 shrink-0 overflow-hidden border border-border bg-muted">
                    <Image src={slide.image} alt={slide.productName} fill sizes="40px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-light uppercase tracking-[0.15em] text-gold">{slide.productBrand}</p>
                    <p className="text-xs font-medium leading-snug">{slide.productName}</p>
                    <p className="text-[11px] font-light text-muted-foreground">{slide.productPrice}</p>
                  </div>
                  <ArrowRight className="ml-1 size-3.5 shrink-0 text-muted-foreground" />
                </Link>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Slide dots — fixed, outside sliding track */}
      <div className="pointer-events-none absolute bottom-6 left-5 flex items-center gap-2.5 lg:left-8">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
            className={cn(
              "pointer-events-auto h-1 rounded-full transition-all duration-300",
              i === current ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>

      {/* Prev / Next arrows — bottom-right corner */}
      <div className="absolute bottom-6 right-5 flex gap-2 lg:right-8">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={prev}
          className="flex size-9 items-center justify-center border border-foreground/20 bg-background/60 text-foreground/60 backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={next}
          className="flex size-9 items-center justify-center border border-foreground/20 bg-background/60 text-foreground/60 backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
/* ─── Home deal card with cart button ───────────────────────── */
function HomeDealCard({ deal }: { deal: Deal }) {
  const { addItem, openCart } = useCart()
  const [added, setAdded] = useState(false)
  const sale = deal.discountPct
    ? Math.round(deal.originalPrice * (1 - Math.min(100, deal.discountPct) / 100))
    : deal.salePrice

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(dealAsProduct(deal))
    setAdded(true)
    setTimeout(() => { setAdded(false); openCart() }, 400)
  }

  return (
    <Link
      href={`/deal/${deal.id}`}
      className="group border border-border overflow-hidden transition-all hover:border-gold/60 hover:bg-secondary block"
    >
      <div className="relative aspect-[16/10] bg-muted">
        <Image
          src={deal.image || "/product-bundle.png"}
          alt={deal.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gold">{deal.brand}</p>
            <h3 className="mt-1 font-serif text-xl font-medium">{deal.title}</h3>
          </div>
          {deal.badge && (
            <span className="border border-gold/40 bg-lavender px-2 py-0.5 text-[11px] font-medium text-gold shrink-0">
              {deal.badge}
            </span>
          )}
        </div>
        <ul className="space-y-1.5 mb-5">
          {deal.items.map(item => (
            <li key={`${item.productId}-${item.name}`} className="flex items-center gap-2 text-sm font-light text-muted-foreground">
              <span className="size-1.5 rounded-full bg-gold shrink-0" /> {item.name}
            </li>
          ))}
        </ul>
        <div className="flex items-end justify-between">
          <div>
            {deal.originalPrice > sale && (
              <p className="text-xs font-light line-through text-muted-foreground">
                ₦{deal.originalPrice.toLocaleString()}
              </p>
            )}
            <p className="font-serif text-xl font-medium text-foreground">₦{sale.toLocaleString()}</p>
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
    </Link>
  )
}

export default function HomePage() {
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [featuredNew, setFeaturedNew] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [saleDeals, setSaleDeals] = useState<Deal[]>([])
  const [recentArticles, setRecentArticles] = useState<Journal[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    void Promise.all([
      getProductsByTag("Bestseller", 4),
      getProductsByTag("New", 4),
      getDiscountedProducts({ limit: 4 }),
      getActiveDeals(),
      getPublishedJournals(),
      getActiveBrands(),
    ]).then(([best, featured, discounted, deals, journals, activeBrands]) => {
      setBestsellers(best)
      setFeaturedNew(featured)
      setSaleProducts(discounted)
      setSaleDeals(deals.slice(0, 3))
      setRecentArticles(journals.slice(0, 3))
      setBrands(activeBrands)
    })
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
              className="group flex flex-col items-center gap-3 border border-border p-5 text-center transition-all hover:border-gold/60 hover:bg-secondary"
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

      {/* ── Best Sellers ── */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">Customer favourites</p>
            <h2 className="mt-1.5 font-serif text-3xl font-medium">Best Sellers</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors sm:flex">
            View All <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {bestsellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        {bestsellers.length === 0 && (
          <p className="text-center text-sm font-light text-muted-foreground">Bestsellers are on the way.</p>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 border border-border px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors">
            View All Products <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Shop by Concern ── */}
      <section className="bg-secondary py-16">
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

      {/* ── Featured / New ── */}
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
          {featuredNew.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        {featuredNew.length === 0 && (
          <p className="text-center text-sm font-light text-muted-foreground">New products are on the way.</p>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 border border-border px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors">
            View All Products <ArrowRight className="size-3.5" />
          </Link>
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
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-muted group-hover:border-gold/60 transition-colors">
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

      {/* ── On Sale (discounted products + deals) ── */}
      {(saleProducts.length > 0 || saleDeals.length > 0) && (
        <section className="bg-secondary py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">Limited time</p>
                <h2 className="mt-1.5 font-serif text-3xl font-medium">On Sale</h2>
                <p className="mt-1 text-sm font-light text-muted-foreground">
                  Discounted favourites and curated combo deals.
                </p>
              </div>
              <div className="hidden items-center gap-4 sm:flex">
                <Link href="/offers" className="items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors flex">
                  Offers <ArrowRight className="size-3.5" />
                </Link>
                <Link href="/deals" className="items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors flex">
                  Deals <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {saleProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
                {saleProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}

            {saleDeals.length > 0 && (
              <div className={cn("grid gap-5 md:grid-cols-3", saleProducts.length > 0 && "mt-10")}>
                {saleDeals.map(deal => (
                  <HomeDealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center gap-3 sm:hidden">
              <Link href="/offers" className="inline-flex items-center gap-2 border border-border bg-background px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors">
                Offers <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/deals" className="inline-flex items-center gap-2 border border-border bg-background px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors">
                Deals <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Brands We Stock ── */}
      <section className="border-y border-border bg-background py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="mb-8 text-center text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Trusted brands in stock
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {brands.map(brand => (
              <Link
                key={brand.id}
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="group flex items-center justify-center border border-border px-5 py-3 transition-all hover:border-gold/60 hover:bg-secondary min-w-[120px]"
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
    </>
  )
}
