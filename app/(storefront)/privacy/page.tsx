import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — HAYDA SKINCo.",
  description: "How HAYDA SKINCo. collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold mb-2">Legal</p>
      <h1 className="font-serif text-4xl font-medium">Privacy Policy</h1>
      <p className="mt-2 text-sm font-light text-muted-foreground">Last updated: July 2026</p>

      <div className="mt-10 space-y-8 text-sm font-light leading-relaxed text-foreground/85">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-foreground">Who we are</h2>
          <p>
            HAYDA SKINCo. (“we”, “us”) operates the haydaskinco.com storefront and related services.
            We sell authentic skincare products and deliver across Nigeria.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-foreground">What we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details (name, email, phone) when you register or update your profile</li>
            <li>Shipping addresses and order information for fulfilment</li>
            <li>Payment references processed by our payment providers (we do not store full card numbers)</li>
            <li>Newsletter email if you subscribe</li>
            <li>Messages you send via contact or wholesale forms</li>
            <li>Basic usage data via privacy-friendly analytics on our live site</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-foreground">How we use it</h2>
          <p>
            We use your information to process orders, provide customer support, send transactional
            emails (order updates), and — if you opt in — marketing emails. You can turn off marketing
            preferences in your account settings or unsubscribe from newsletter emails.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-foreground">Sharing</h2>
          <p>
            We share data with service providers needed to run the store (hosting, database, email,
            and payment processors). We do not sell your personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-foreground">Your choices</h2>
          <p>
            You may update your profile, manage notification preferences, or request account-related
            help via{" "}
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

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-foreground">Contact</h2>
          <p>
            Questions about this policy:{" "}
            <a href="mailto:hello@haydaskinco.com" className="text-gold underline-offset-2 hover:underline">
              hello@haydaskinco.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
