"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const HERO_SLIDES = [
  {
    eyebrow: "New Arrivals",
    title: "Niacinamide\n& Beyond",
    subtitle: "Discover targeted serums and treatments from The Ordinary, COSRX & Paula's Choice.",
    cta: "Shop Serums",
    href: "/shop?category=serums-treatment",
    gradient: "from-[#293049] via-[#5C6B86] to-[#FACBD3]",
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
    href: "/shop?category=face-moisturizers",
    gradient: "from-[#293049] via-[#FACBD3] to-[#FDF0F3]",
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
    href: "/shop?category=sunscreens",
    gradient: "from-[#E8919E] via-[#FACBD3] to-[#FDF0F3]",
    image: "/product-cleanser.png",
    productName: "Anthelios UVMune SPF 50+",
    productBrand: "La Roche-Posay",
    productPrice: "₦16,000",
    productHref: "/product/lrp-anthelios-spf50",
  },
]

export function HomeHeroSlider() {
  const n = HERO_SLIDES.length
  const track = [HERO_SLIDES[n - 1], ...HERO_SLIDES, HERO_SLIDES[0]]
  const [index, setIndex] = useState(1)
  const [animate, setAnimate] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const indexRef = useRef(index)

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const activeSlide = ((index - 1) % n + n) % n

  function goToSlide(slideIdx: number) {
    setAnimate(true)
    setIndex(slideIdx + 1)
  }

  function next() {
    setAnimate(true)
    setIndex(i => i + 1)
  }

  function prev() {
    setAnimate(true)
    setIndex(i => i - 1)
  }

  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return
    const i = indexRef.current
    if (i === n + 1) {
      setAnimate(false)
      setIndex(1)
    } else if (i === 0) {
      setAnimate(false)
      setIndex(n)
    }
  }

  useEffect(() => {
    if (animate) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true))
    })
    return () => cancelAnimationFrame(id)
  }, [animate, index])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [reduceMotion])

  return (
    <section className="relative overflow-hidden" aria-roledescription="carousel" aria-label="Featured campaigns">
      <div
        className={cn(
          "flex will-change-transform",
          animate && !reduceMotion && "transition-transform duration-700 ease-in-out",
        )}
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {track.map((slide, i) => {
          const isActive = i === index
          return (
            <div
              key={`${slide.title}-${i}`}
              className={cn("w-full shrink-0 bg-linear-to-br", slide.gradient)}
              aria-hidden={!isActive}
            >
              <div className="mx-auto grid min-h-[82vh] max-w-7xl grid-cols-1 items-center px-5 lg:grid-cols-2 lg:px-8">
                <div className="flex flex-col justify-center py-8 md:py-16 lg:py-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-4 min-h-[2.2em] font-serif text-3xl font-medium leading-[1.1] text-white md:text-6xl lg:min-h-[calc(2*1.1*4.5rem)] lg:text-[4.5rem] whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <p className="mt-5 min-h-[4.5rem] max-w-sm text-base font-light leading-relaxed text-white">
                    {slide.subtitle}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={slide.href}
                      className="flex items-center gap-2 bg-gold px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-foreground transition-colors hover:bg-gold/90"
                      tabIndex={isActive ? undefined : -1}
                    >
                      {slide.cta} <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      href="/shop"
                      className="flex items-center gap-2 border border-white/30 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
                      tabIndex={isActive ? undefined : -1}
                    >
                      View All
                    </Link>
                  </div>
                  <div className="mt-10 h-1" aria-hidden />
                </div>

                <div className="flex flex-col justify-center pb-16 lg:h-[82vh] lg:pb-0">
                  <div className="relative mx-auto aspect-4/5 w-full max-h-[46vh] max-w-md bg-white lg:max-h-[62vh] lg:max-w-none">
                    <div className="absolute inset-4 sm:inset-8">
                      <Image
                        src={slide.image}
                        alt={isActive ? slide.productName : ""}
                        fill
                        sizes="(max-width: 1024px) 90vw, 40vw"
                        className="object-contain"
                        priority={i === 1}
                      />
                    </div>
                  </div>

                  <Link
                    href={slide.productHref}
                    className="mx-auto mt-3 flex w-full max-w-md items-center gap-3 border border-border bg-white px-3 py-3 shadow-md transition-colors hover:border-[#293049] lg:max-w-none"
                    tabIndex={isActive ? undefined : -1}
                  >
                    <div className="relative size-12 shrink-0 bg-secondary">
                      <Image
                        src={slide.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gold">
                        {slide.productBrand}
                      </p>
                      <p className="truncate text-sm font-medium leading-snug text-foreground">{slide.productName}</p>
                      <p className="text-xs font-light text-muted-foreground">{slide.productPrice}</p>
                    </div>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pointer-events-none absolute bottom-6 left-5 flex items-center gap-2.5 lg:left-8">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === activeSlide ? "true" : undefined}
            className={cn(
              "pointer-events-auto h-1 rounded-full transition-all duration-300",
              i === activeSlide ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>

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
