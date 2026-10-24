import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Shipping — HAYDA SKINCo.",
  description:
    "Free standard delivery nationwide in 5–7 business days. Express delivery is ₦3,000 and arrives in 2–3 business days.",
}

const linkClass = "text-gold underline-offset-2 hover:underline"

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help"
        title="Shipping"
        description="Free standard delivery nationwide, or express if you need it sooner."
      />

      <div className="mx-auto max-w-3xl px-5 py-16 md:py-20 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-foreground">Standard</h2>
            <p className="font-serif text-4xl font-medium text-foreground">Free</p>
            <p className="text-sm font-light leading-relaxed text-foreground/85">
              5–7 business days, nationwide.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-foreground">Express</h2>
            <p className="font-serif text-4xl font-medium text-foreground">₦3,000</p>
            <p className="text-sm font-light leading-relaxed text-foreground/85">
              2–3 business days, nationwide.
            </p>
          </section>
        </div>

        <div className="mt-12 space-y-4 text-sm font-light leading-relaxed text-foreground/85">
          <p>
            You choose standard or express at checkout. The estimates above are in business days,
            and delivery is available nationwide.
          </p>
          <p>
            After you pay, the status of the order is listed under{" "}
            <Link href="/account/orders" className={linkClass}>Orders</Link> in your account.
          </p>
        </div>

        <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-[11px] font-light uppercase tracking-[0.14em] text-muted-foreground">
          <Link href="/faq" className="hover:text-foreground">FAQs</Link>
          <Link href="/returns" className="hover:text-foreground">Returns</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </>
  )
}
