import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Accessibility — HAYDA SKINCo.",
  description: "Our commitment to making HAYDA SKINCo. usable for more people.",
}

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold mb-2">Legal</p>
      <h1 className="font-serif text-4xl font-medium">Accessibility</h1>
      <p className="mt-2 text-sm font-light text-muted-foreground">Last updated: July 2026</p>

      <div className="mt-10 space-y-8 text-sm font-light leading-relaxed text-foreground/85">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-foreground">Our commitment</h2>
          <p>
            We aim to make shopping on HAYDA SKINCo. usable for as many people as possible, including
            those using assistive technologies. We continue to improve contrast, keyboard navigation,
            and clear labelling across the storefront.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-foreground">Feedback</h2>
          <p>
            If you encounter a barrier, tell us what page you were on and what you were trying to do.
            Reach us via{" "}
            <Link href="/contact" className="text-gold underline-offset-2 hover:underline">
              Contact
            </Link>{" "}
            or{" "}
            <a href="mailto:hello@haydaskinco.com" className="text-gold underline-offset-2 hover:underline">
              hello@haydaskinco.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
