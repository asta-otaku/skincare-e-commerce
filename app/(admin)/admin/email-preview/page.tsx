"use client"

import { useMemo, useState } from "react"
import {
  contactNotifyHtml,
  newsletterWelcomeHtml,
  orderConfirmationHtml,
  orderFulfilledHtml,
  orderShippedHtml,
  rewardPromoHtml,
  welcomeHtml,
  wholesaleNotifyHtml,
} from "@/lib/email/templates"

const PREVIEWS = [
  {
    id: "order-confirmation",
    label: "Order confirmation",
    html: () =>
      orderConfirmationHtml({
        name: "Adaora Okonkwo",
        reference: "HAYDA-240730-A1B2",
        shippingMethod: "standard",
        total: 42800,
        items: [
          {
            name: "CeraVe Moisturising Cream — 16 oz",
            quantity: 1,
            price: 18900,
            image: "/product-cream.png",
          },
          {
            name: "The Ordinary Niacinamide 10%",
            quantity: 2,
            price: 6800,
            image: "/product-serum.png",
          },
        ],
      }),
  },
  {
    id: "order-shipped",
    label: "Order shipped",
    html: () =>
      orderShippedHtml({
        name: "Adaora Okonkwo",
        reference: "HAYDA-240730-A1B2",
        items: [
          { name: "CeraVe Moisturising Cream — 16 oz", quantity: 1, price: 18900, image: "/product-cream.png" },
          { name: "The Ordinary Niacinamide 10%", quantity: 2, price: 6800, image: "/product-serum.png" },
        ],
      }),
  },
  {
    id: "order-fulfilled",
    label: "Order delivered",
    html: () =>
      orderFulfilledHtml({
        name: "Adaora Okonkwo",
        reference: "HAYDA-240730-A1B2",
        items: [
          { name: "CeraVe Moisturising Cream — 16 oz", quantity: 1, price: 18900, image: "/product-cream.png" },
          { name: "The Ordinary Niacinamide 10%", quantity: 2, price: 6800, image: "/product-serum.png" },
        ],
      }),
  },
  {
    id: "welcome",
    label: "Welcome",
    html: () => welcomeHtml({ name: "Adaora" }),
  },
  {
    id: "reward",
    label: "Reward promo",
    html: () =>
      rewardPromoHtml({
        name: "Adaora",
        promoCode: "REWARD1000",
        discountNgn: 1000,
      }),
  },
  {
    id: "newsletter",
    label: "Newsletter welcome",
    html: () => newsletterWelcomeHtml({ promoCode: "WELCOME10" }),
  },
  {
    id: "contact",
    label: "Contact notify (admin)",
    html: () =>
      contactNotifyHtml({
        name: "Chinedu Eze",
        email: "chinedu@example.com",
        subject: "Product authenticity",
        message:
          "Hi HAYDA team,\n\nI wanted to confirm that the CeraVe products on your site are authentic before ordering in bulk.\n\nThanks!",
      }),
  },
  {
    id: "wholesale",
    label: "Wholesale notify (admin)",
    html: () =>
      wholesaleNotifyHtml({
        name: "Amaka Bello",
        business: "Glow Studio Lagos",
        email: "amaka@glowstudio.ng",
        phone: "+234 801 234 5678",
        type: "Salon / Spa",
        volume: "₦500k–₦1m / month",
        message: "Interested in a wholesale account for face and body care.",
      }),
  },
] as const

export default function EmailPreviewPage() {
  const [active, setActive] = useState<(typeof PREVIEWS)[number]["id"]>("order-confirmation")

  const current = useMemo(
    () => PREVIEWS.find(p => p.id === active) ?? PREVIEWS[0],
    [active],
  )

  const html = useMemo(() => current.html(), [current])

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-auto">
      <div className="admin-page-header">
        <div>
          <h1 className="font-serif text-2xl font-medium">Email preview</h1>
          <p className="mt-0.5 text-xs font-light text-muted-foreground">
            Sample data · logo uses NEXT_PUBLIC_SITE_URL
          </p>
        </div>
      </div>

      <div className="admin-page-body grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {PREVIEWS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className={
                active === p.id
                  ? "shrink-0 border border-foreground bg-foreground px-3 py-2.5 text-left text-xs font-medium uppercase tracking-[0.12em] text-background"
                  : "shrink-0 border border-border px-3 py-2.5 text-left text-xs font-light uppercase tracking-[0.12em] text-muted-foreground hover:border-foreground hover:text-foreground"
              }
            >
              {p.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 border border-border bg-muted/40 p-3 sm:p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {current.label}
          </p>
          <iframe
            title={current.label}
            srcDoc={html}
            className="h-[min(80vh,900px)] w-full border border-border bg-white"
          />
        </div>
      </div>
    </div>
  )
}
