import Link from "next/link"

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Serums", href: "/shop" },
      { label: "Face Oils", href: "/shop" },
      { label: "Moisturizers", href: "/shop" },
      { label: "Cleansers", href: "/shop" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Ingredients", href: "/about" },
      { label: "Sustainability", href: "/about" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping", href: "/contact" },
      { label: "Returns", href: "/contact" },
      { label: "FAQ", href: "/contact" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link
              href="/"
              className="font-serif text-2xl font-medium tracking-[0.25em] text-foreground"
            >
              AURELIA
            </Link>
            <p className="mt-5 max-w-xs text-pretty text-sm font-light leading-relaxed text-muted-foreground">
              Elevated skincare rituals crafted with rare botanicals and clinically proven actives.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-light text-muted-foreground transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center md:flex-row md:text-left">
          <p className="text-xs font-light text-muted-foreground">
            © {new Date().getFullYear()} Aurelia Skincare. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Accessibility"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs font-light text-muted-foreground transition-colors hover:text-gold"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
