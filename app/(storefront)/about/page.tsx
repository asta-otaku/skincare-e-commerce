import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Leaf, FlaskConical, Sparkles, Heart } from "lucide-react"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Our Story — Aurelia",
  description:
    "Discover the philosophy behind Aurelia — clean, gold-infused skincare crafted in small batches with rare botanicals and clinically proven actives.",
}

const values = [
  {
    icon: Leaf,
    title: "Clean by Conviction",
    body: "Every formula is free from parabens, sulfates, and synthetic fragrance — only what your skin truly needs.",
  },
  {
    icon: FlaskConical,
    title: "Clinically Proven",
    body: "We pair rare botanicals with dermatologist-validated actives, tested for real, visible results.",
  },
  {
    icon: Sparkles,
    title: "Crafted in Small Batches",
    body: "Each product is blended in limited quantities and finished by hand to preserve potency.",
  },
  {
    icon: Heart,
    title: "Kind to All",
    body: "100% cruelty-free and thoughtfully packaged with recyclable, responsibly sourced materials.",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Skincare as a quiet, golden ritual"
        description="Aurelia was born from a belief that true luxury lies in restraint — in doing less, but doing it exquisitely well."
      />

      {/* Intro split */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="/brand-story.png"
            alt="Hands gently holding an Aurelia skincare bottle"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <span className="pointer-events-none absolute inset-3 border border-gold/40" />
        </div>
        <div>
          <p className="text-xs font-light uppercase tracking-[0.3em] text-gold">Est. 2019</p>
          <h2 className="mt-5 text-balance font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
            A devotion to the essential
          </h2>
          <p className="mt-6 text-pretty text-base font-light leading-relaxed text-muted-foreground">
            Founded in a small atelier, Aurelia began with a single serum and an uncompromising
            standard. We were tired of excess — of crowded shelves and empty promises. So we
            stripped everything back to what matters: efficacy, purity, and a sensorial ritual
            worth savoring.
          </p>
          <p className="mt-4 text-pretty text-base font-light leading-relaxed text-muted-foreground">
            Today, every Aurelia formula is still made in small batches, infused with 24k gold and
            rare botanicals, and finished by hand. No shortcuts. No excess. Only what your skin
            truly needs to glow.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-14 flex flex-col items-center text-center">
            <p className="text-xs font-light uppercase tracking-[0.3em] text-gold">What We Stand For</p>
            <h2 className="mt-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
              Our Promise
            </h2>
            <span className="mt-7 h-px w-16 bg-gold" />
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="flex flex-col items-center text-center">
                <span className="flex size-14 items-center justify-center rounded-full border border-gold/50 text-gold">
                  <value.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-medium text-foreground">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <h2 className="text-balance font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
          Begin your ritual
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-pretty text-sm font-light leading-relaxed text-muted-foreground md:text-base">
          Discover the formulas that have become quiet daily devotions for thousands.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-3 border border-foreground px-9 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-all duration-300 hover:border-gold hover:bg-gold hover:text-gold-foreground"
        >
          Explore the Collection
        </Link>
      </section>
    </>
  )
}
