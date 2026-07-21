import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Leaf, FlaskConical, Sparkles, Heart } from "lucide-react"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Our Story — HAYDA SKINCo.",
  description:
    "Discover the story behind HAYDA SKINCo. — Nigeria's hub for premium skincare, stocking trusted brands and delivering nationwide.",
}

const values = [
  {
    icon: Leaf,
    title: "100% Authentic",
    body: "Every product is sourced directly from authorised distributors. No fakes, no grey-market imports — ever.",
  },
  {
    icon: FlaskConical,
    title: "Dermatologist-Approved",
    body: "We stock only clinically-backed, proven brands recommended by dermatologists worldwide.",
  },
  {
    icon: Sparkles,
    title: "Curated for Nigeria",
    body: "Our selection is tailored for Nigerian skin types, climate, and lifestyles — from Lagos heat to harmattan.",
  },
  {
    icon: Heart,
    title: "Nationwide Delivery",
    body: "Order from anywhere in Nigeria and receive your skincare fast, safely packaged and tracked.",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Nigeria's hub for all your skin needs"
        description="HAYDA SKINCo. was built to make premium skincare accessible — no fakes, no guesswork, just authentic products delivered to your door."
      />

      {/* Intro split */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="/brand-story.png"
            alt="HAYDA SKINCo. curated skincare products"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <span className="pointer-events-none absolute inset-3 border border-gold/40" />
        </div>
        <div>
          <p className="text-xs font-light uppercase tracking-[0.3em] text-gold">Lagos, Nigeria</p>
          <h2 className="mt-5 text-balance font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
            Premium skincare, finally accessible
          </h2>
          <p className="mt-6 text-pretty text-base font-light leading-relaxed text-muted-foreground">
            HAYDA SKINCo. was born from a simple frustration: finding authentic, dermatologist-trusted skincare in Nigeria was unnecessarily hard. Products were overpriced, often counterfeit, and always scattered across multiple stores.
          </p>
          <p className="mt-4 text-pretty text-base font-light leading-relaxed text-muted-foreground">
            We built HAYDA to fix that. One destination, only verified brands — CeraVe, The Ordinary, La Roche-Posay, COSRX, Paula's Choice, and more — curated for every skin type, concern, and budget, with nationwide delivery from Lagos.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-secondary">
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
