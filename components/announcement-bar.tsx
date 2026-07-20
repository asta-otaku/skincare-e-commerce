import Link from "next/link"
import { getWhatsAppDisplay } from "@/lib/whatsapp"

export function AnnouncementBar() {
  const messages = [
    "🚚 Free delivery on orders ₦50,000 and above",
    "📦 Nationwide delivery across Nigeria",
    `💬 WhatsApp us: ${getWhatsAppDisplay()}`,
    "✨ New arrivals from CeraVe, The Ordinary & COSRX",
    "🎁 Combo deals — save up to 20% on bundles",
    "💳 Pay securely with Paystack or Flutterwave",
  ]
  const doubled = [...messages, ...messages]

  return (
    <div className="relative overflow-hidden bg-foreground py-2.5 text-background">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((msg, i) => (
          <span key={i} className="mx-8 text-[11px] font-light uppercase tracking-[0.18em] shrink-0">
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
