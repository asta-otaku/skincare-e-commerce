import { ANNOUNCEMENT_MESSAGES, FREE_STANDARD_DELIVERY } from "@/lib/storefront-copy"

export function AnnouncementBar() {
  const messages = [
    FREE_STANDARD_DELIVERY,
    ...ANNOUNCEMENT_MESSAGES.filter(message => message !== FREE_STANDARD_DELIVERY),
  ]
  const doubled = [...messages, ...messages]

  return (
    <div className="relative overflow-hidden bg-foreground py-2.5 text-background">
      <div className="flex animate-marquee whitespace-nowrap motion-reduce:animate-none">
        {doubled.map((msg, i) => (
          <span key={i} className="mx-8 shrink-0 text-[11px] font-light uppercase tracking-[0.18em]">
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
