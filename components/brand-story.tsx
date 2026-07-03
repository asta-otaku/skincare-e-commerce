import Image from "next/image"

export function BrandStory() {
  return (
    <section id="story" className="bg-muted/40">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative order-1">
          <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-[5/6]">
            <Image
              src="/brand-story.png"
              alt="HAYDA SKINCo. curated skincare products"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="pointer-events-none absolute inset-3 border border-gold/40" />
          </div>
        </div>

        <div className="order-2">
          <p className="text-xs font-light uppercase tracking-[0.3em] text-gold">Our Philosophy</p>
          <h2 className="mt-5 text-balance font-serif text-4xl font-light leading-[1.1] text-foreground md:text-5xl">
            Skincare as a quiet, golden ritual
          </h2>
          <p className="mt-6 text-pretty text-base font-light leading-relaxed text-muted-foreground">
            HAYDA SKINCo. was built to make premium skincare genuinely accessible in Nigeria. Every product is
            careful balance of clinically proven actives and rare botanicals, crafted in small
            batches and finished by hand.
          </p>
          <p className="mt-4 text-pretty text-base font-light leading-relaxed text-muted-foreground">
            We never compromise — no shortcuts, no excess, only what your skin truly needs to
            glow.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              { value: "100%", label: "Clean Formulas" },
              { value: "24k", label: "Gold Infused" },
              { value: "12+", label: "Active Botanicals" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl font-light text-foreground md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-light uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
