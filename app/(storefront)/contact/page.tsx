import type { Metadata } from "next"
import { Mail, MessageCircle, MapPin } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Contact — Aurelia",
  description:
    "Reach the Aurelia concierge team for skincare guidance, order support, or press enquiries. We respond within one business day.",
}

const details = [
  {
    icon: Mail,
    title: "Email",
    lines: ["concierge@aurelia.com", "press@aurelia.com"],
  },
  {
    icon: MessageCircle,
    title: "Concierge",
    lines: ["Mon – Fri, 9am – 6pm", "Live chat available"],
  },
  {
    icon: MapPin,
    title: "Atelier",
    lines: ["12 Rue des Fleurs", "Paris, France"],
  },
]

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in Touch"
        title="We&apos;re Here to Help"
        description="Whether you need guidance on your ritual or support with an order, our concierge team is always within reach."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          {/* Contact details */}
          <div className="flex flex-col gap-10">
            {details.map((detail) => (
              <div key={detail.title} className="flex gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
                  <detail.icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-serif text-xl font-medium text-foreground">{detail.title}</h2>
                  {detail.lines.map((line) => (
                    <p key={line} className="mt-1 text-sm font-light text-muted-foreground">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
