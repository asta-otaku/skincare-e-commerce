"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { formatPrice, getEffectivePrice, productTags, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"

function slideEyebrow(product: Product) {
  const tags = productTags(product)
  if (tags.includes("Bestseller")) return "Bestseller"
  if (tags.includes("New")) return "New arrival"
  return product.category || "Featured"
}

function EmptyHero() {
  return (
    <section className="bg-[#293049]">
      <div className="mx-auto flex min-h-[52vh] max-w-7xl flex-col justify-center px-5 py-16 lg:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/80">
          HAYDA SKINCo.
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl font-medium leading-[1.1] text-white md:text-6xl">
          Shop the collection
        </h1>
        <p className="mt-5 max-w-md text-base font-light leading-relaxed text-white/85">
          Authentic skincare from the brands we stock, ready to browse.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex w-fit items-center gap-2 bg-white px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary"
        >
          Shop all <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}

export function HomeHeroSlider({ products }: { products: Product[] }) {
  const n = products.length
  const track = n > 0 ? [products[n - 1], ...products, products[0]] : []
  const [index, setIndex] = useState(1)
  const [animate, setAnimate] = useState(true)
  const [canAutoplay, setCanAutoplay] = useState(false)
  const indexRef = useRef(index)

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const activeSlide = n > 0 ? ((index - 1) % n + n) % n : 0

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  function goToSlide(slideIdx: number) {
    setAnimate(!reducedMotion())
    setIndex(slideIdx + 1)
  }

  function next() {
    if (reducedMotion()) {
      setAnimate(false)
      setIndex(i => {
        const current = ((i - 1) % n + n) % n
        return (current + 1) % n + 1
      })
      return
    }
    setAnimate(true)
    setIndex(i => i + 1)
  }

  function prev() {
    if (reducedMotion()) {
      setAnimate(false)
      setIndex(i => {
        const current = ((i - 1) % n + n) % n
        return (current - 1 + n) % n + 1
      })
      return
    }
    setAnimate(true)
    setIndex(i => i - 1)
  }

  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || n < 1) return
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
    const sync = () => setCanAutoplay(!media.matches && n > 1)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [n])

  useEffect(() => {
    if (!canAutoplay) return
    const timer = window.setInterval(() => {
      setAnimate(true)
      setIndex(i => i + 1)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [canAutoplay])

  if (n === 0) return <EmptyHero />

  return (
    <section className="overflow-hidden bg-[#293049]" aria-roledescription="carousel" aria-label="Featured products">
      <div
        className={cn(
          "flex will-change-transform",
          animate && "transition-transform duration-700 ease-in-out motion-reduce:transition-none",
        )}
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {track.map((product, i) => {
          const isActive = i === index
          const priceLabel = formatPrice(getEffectivePrice(product))
          const TitleTag = isActive ? "h1" : "p"
          return (
            <div
              key={`${product.id}-${i}`}
              className="w-full shrink-0"
              aria-hidden={!isActive}
            >
              <div className="mx-auto grid max-w-7xl lg:min-h-[72vh] lg:grid-cols-2">
                <div className="order-2 flex min-w-0 flex-col justify-center bg-linear-to-br from-[#293049] to-[#3a4660] px-5 py-10 text-white lg:order-1 lg:px-8 lg:py-16">
                  <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/80">
                    {slideEyebrow(product)}
                  </p>
                  <TitleTag className="mt-4 max-w-xl break-words font-serif text-4xl font-medium leading-[1.08] text-white md:text-5xl">
                    {product.name}
                  </TitleTag>
                  {product.tagline && (
                    <p className="mt-5 max-w-md break-words text-base font-light leading-relaxed text-white/85">
                      {product.tagline}
                    </p>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/product/${product.id}`}
                      className="flex items-center gap-2 bg-white px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary"
                      tabIndex={isActive ? undefined : -1}
                    >
                      Shop now <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      href="/shop"
                      className="flex items-center gap-2 border border-white/40 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
                      tabIndex={isActive ? undefined : -1}
                    >
                      View all
                    </Link>
                  </div>
                </div>

                <div className="order-1 min-w-0 bg-secondary px-5 py-6 lg:order-2 lg:flex lg:flex-col lg:justify-center lg:px-10 lg:py-12">
                  <div className="relative mx-auto aspect-4/5 w-full max-h-[46vh] max-w-md bg-white lg:max-h-[62vh] lg:max-w-none">
                    <div className="absolute inset-4 sm:inset-8">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 90vw, 40vw"
                        className="object-contain"
                        priority={i === 1}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    className="mx-auto mt-3 flex w-full max-w-md items-center gap-3 border border-border bg-white px-3 py-3 transition-colors hover:border-gold/40 lg:max-w-none"
                    tabIndex={isActive ? undefined : -1}
                  >
                    <div className="relative size-12 shrink-0 bg-secondary">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gold">
                        {product.brand}
                      </p>
                      <p className="truncate text-sm font-medium leading-snug text-foreground">{product.name}</p>
                      <p className="text-xs font-light text-muted-foreground">{priceLabel}</p>
                    </div>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {n > 1 && (
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="flex items-center justify-between bg-[#293049] px-5 py-4 lg:px-8">
            <div className="flex items-center gap-2.5">
              {products.map((product, i) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === activeSlide ? "true" : undefined}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i === activeSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prev}
                className="flex size-9 items-center justify-center border border-white/30 text-white transition-colors hover:bg-white hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={next}
                className="flex size-9 items-center justify-center border border-white/30 text-white transition-colors hover:bg-white hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div className="hidden bg-secondary lg:block" aria-hidden />
        </div>
      )}
    </section>
  )
}
