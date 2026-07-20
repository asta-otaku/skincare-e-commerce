import Link from "next/link"

const MESSAGES = [
  "🚚 Free delivery on orders ₦50,000 and above",
  "📦 Nationwide delivery across Nigeria",
  "💬 WhatsApp us: +234 813 730 9609",
  "✨ New arrivals from CeraVe, The Ordinary & COSRX",
  "🎁 Combo deals — save up to 20% on bundles",
  "💳 Pay securely with Paystack or Flutterwave",
]

export function AnnouncementBar() {
  // Duplicate for seamless infinite scroll
  const doubled = [...MESSAGES, ...MESSAGES]

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
