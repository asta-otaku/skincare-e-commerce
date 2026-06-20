"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu, X } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { cn } from "@/lib/utils"

const links = [
  { label: "Shop", href: "/shop" },
  { label: "Bestsellers", href: "/shop" },
  { label: "Rituals", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
]

export function SiteNavbar() {
  const { count } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-500",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 lg:px-8">
        {/* Left: nav (desktop) */}
        <nav className="hidden flex-1 items-center gap-8 lg:flex">
          {links.slice(0, 3).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative text-xs font-light uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Center: logo */}
        <Link
          href="/"
          className="flex flex-1 items-center justify-center lg:flex-none"
          aria-label="Aurelia home"
        >
          <span className="font-serif text-2xl font-medium tracking-[0.25em] text-foreground md:text-3xl">
            AURELIA
          </span>
        </Link>

        {/* Right: actions */}
        <div className="flex flex-1 items-center justify-end gap-4 md:gap-5">
          <button
            type="button"
            aria-label="Search"
            className="hidden text-foreground/80 transition-colors hover:text-gold sm:block"
          >
            <Search className="size-[18px]" />
          </button>
          <button
            type="button"
            aria-label="Account"
            className="hidden text-foreground/80 transition-colors hover:text-gold sm:block"
          >
            <User className="size-[18px]" />
          </button>
          <button
            type="button"
            aria-label={`Cart, ${count} items`}
            className="relative text-foreground/80 transition-colors hover:text-gold"
          >
            <ShoppingBag className="size-[18px]" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-gold-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-all duration-300 lg:hidden",
          open ? "max-h-80" : "max-h-0 border-t-0",
        )}
      >
        <nav className="flex flex-col px-5 py-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3 text-xs font-light uppercase tracking-[0.18em] text-foreground/80 last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
