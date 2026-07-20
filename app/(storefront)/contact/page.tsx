import type { Metadata } from "next"
import { Mail, MapPin, Clock, ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ContactForm } from "@/components/contact-form"
import { whatsAppHref } from "@/lib/whatsapp"

export const metadata: Metadata = {
  title: "Contact — HAYDA SKINCo.",
  description:
    "Reach the HAYDA SKINCo. team for skincare guidance, order support, or wholesale enquiries. We respond within one business day.",
}

const details = [
  {
    icon: Mail,
    title: "Email Us",
    lines: ["hello@haydaskinco.com", "press@haydaskinco.com"],
  },
  {
    icon: Clock,
    title: "Support Hours",
    lines: ["Mon – Fri, 9am – 6pm WAT", "Sat, 10am – 3pm WAT"],
  },
  {
    icon: MapPin,
    title: "Based In",
    lines: ["Lagos, Nigeria", "Nationwide delivery"],
  },
]

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in Touch"
        title="We're Here to Help"
        description="Whether you need help choosing a product, tracking an order, or enquiring about wholesale — we're always within reach."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          {/* Left: contact details + WhatsApp CTA */}
          <div className="flex flex-col gap-10">
            {details.map((detail) => (
              <div key={detail.title} className="flex gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
                  <detail.icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-serif text-xl font-medium text-foreground">{detail.title}</h2>
                  {detail.lines.map((line) => (
                    <p key={line} className="mt-1 text-sm font-light text-muted-foreground">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <div className="border border-[#25D366]/30 bg-[#25D366]/5 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#25D366] text-white text-sm font-bold">W</span>
                <div>
                  <p className="font-medium text-sm">Chat on WhatsApp</p>
                  <p className="text-xs font-light text-muted-foreground">Fastest response — typically under 2 hours</p>
                </div>
              </div>
              <p className="text-sm font-light text-muted-foreground mb-4">
                Need a quick answer? Chat directly with the HAYDA team on WhatsApp for product advice, order help, or anything else.
              </p>
              <a
                href={whatsAppHref("Hi HAYDA SKINCo.! I need some help.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
              >
                Start WhatsApp Chat <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>

              {/* Right: form */}
          <div>
            <ContactForm />
          </div>
        </div>

        {/* Social links row */}
        <div className="mt-16 border-t border-border pt-10">
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground text-center">Find us on</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              {
                label: "Instagram",
                href: "https://instagram.com/haydaskinco",
                icon: (
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                ),
              },
              {
                label: "TikTok",
                href: "https://tiktok.com/@haydaskinco",
                icon: (
                  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
                  </svg>
                ),
              },
              {
                label: "Facebook",
                href: "https://facebook.com/haydaskinco",
                icon: (
                  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                ),
              },
              {
                label: "WhatsApp",
                href: whatsAppHref(),
                icon: (
                  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                ),
              },
            ].map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`HAYDA SKINCo. on ${s.label}`}
                className="flex items-center gap-2.5 border border-border px-5 py-3 text-sm font-light text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
              >
                {s.icon}
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
