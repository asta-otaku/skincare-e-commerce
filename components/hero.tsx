"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const slides = [
  {
    eyebrow: "The Gold Standard in Skincare",
    title: "Luminous skin,\nelevated to ritual",
    description:
      "Discover gold-infused serums and botanical formulas crafted to reveal your most radiant complexion.",
    cta: "Shop the Collection",
  },
  {
    eyebrow: "New — Gold Infusion Face Oil",
    title: "A single drop\nof pure radiance",
    description:
      "24k gold suspended in marula and rosehip botanicals for a luminous, dewy finish that lasts all day.",
    cta: "Discover the Oil",
  },
  {
    eyebrow: "Dermatologist Formulated",
    title: "Quiet luxury\nfor every ritual",
    description:
      "Clean, clinically proven actives in considered formulations — because your skin deserves the finest.",
    cta: "Explore Rituals",
  },
]

export function Hero() {
  const [active, setActive] = useState(0)

  const next = useCallback(() => setActive((v) => (v + 1) % slides.length), [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:py-20 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        {/* Copy */}
        <div className="relative order-2 lg:order-1">
          {slides.map((slide, index) => (
            <div
              key={slide.title}
              className={cn(
                "transition-all duration-700 ease-out",
                index === active
                  ? "relative opacity-100 blur-0"
                  : "pointer-events-none absolute inset-0 opacity-0 blur-sm",
              )}
              aria-hidden={index !== active}
            >
              <p className="mb-5 text-xs font-light uppercase tracking-[0.3em] text-gold">
                {slide.eyebrow}
              </p>
              <h1 className="text-pretty font-serif text-5xl font-light leading-[1.05] text-foreground md:text-6xl lg:text-7xl">
                {slide.title.split("\n").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="mt-6 max-w-md text-pretty text-base font-light leading-relaxed text-muted-foreground">
                {slide.description}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#featured"
                  className="group inline-flex items-center gap-3 border border-gold bg-gold px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-foreground transition-all duration-300 hover:bg-transparent hover:text-foreground"
                >
                  {slide.cta}
                </a>
                <a
                  href="#story"
                  className="text-xs font-light uppercase tracking-[0.18em] text-foreground underline-offset-8 transition-colors hover:text-gold hover:underline"
                >
                  Our Story
                </a>
              </div>
            </div>
          ))}

          {/* Slide indicators */}
          <div className="mt-12 flex items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-px transition-all duration-500",
                  index === active ? "w-12 bg-gold" : "w-6 bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden">
            {slides.map((slide, index) => (
              <Image
                key={index}
                src="/hero-skincare.png"
                alt="Aurelia luxury skincare serum bottle with gold accents"
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className={cn(
                  "object-cover transition-all duration-[1200ms] ease-out",
                  index === active ? "scale-100 opacity-100" : "scale-105 opacity-0",
                )}
              />
            ))}
            {/* Gold corner frame */}
            <span className="pointer-events-none absolute left-4 top-4 size-10 border-l border-t border-gold/70" />
            <span className="pointer-events-none absolute bottom-4 right-4 size-10 border-b border-r border-gold/70" />
          </div>
        </div>
      </div>

      {/* Marquee-style trust bar */}
      <div className="border-y border-border bg-muted">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-4 text-center text-[11px] font-light uppercase tracking-[0.22em] text-muted-foreground lg:justify-between lg:px-8">
          <span>Clinically Proven Actives</span>
          <span className="hidden sm:inline">Cruelty-Free &amp; Vegan</span>
          <span>Complimentary Shipping</span>
          <span className="hidden md:inline">Dermatologist Tested</span>
        </div>
      </div>
    </section>
  )
}
