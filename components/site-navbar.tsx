"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingBag, User, Menu, X, ChevronDown, ChevronRight, Tag, LogOut } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useSearch } from "@/components/search-modal"
import { useUserAuth } from "@/components/user-auth-provider"
import { cn } from "@/lib/utils"
import { whatsAppHref } from "@/lib/whatsapp"

/* ─── Navigation data ───────────────────────────────────────── */
const NAV = [
  {
    label: "Face",
    items: [
      { label: "Cleansers", href: "/shop?category=cleansers" },
      { label: "Toners", href: "/shop?category=toners" },
      { label: "Serums", href: "/shop?category=serums" },
      { label: "Moisturisers", href: "/shop?category=moisturisers" },
      { label: "Sunscreen", href: "/shop?category=sunscreen" },
      { label: "Eye Care", href: "/shop?category=eye-care" },
      { label: "Treatments", href: "/shop?category=treatments" },
    ],
  },
  {
    label: "Bath & Body",
    items: [
      { label: "Body Lotions", href: "/shop?category=body-lotions" },
      { label: "Scrubs", href: "/shop?category=scrubs" },
      { label: "Shower Gels", href: "/shop?category=shower-gels" },
      { label: "Body Oils", href: "/shop?category=body-oils" },
    ],
  },
  {
    label: "Fragrance",
    items: [
      { label: "Perfumes", href: "/shop?category=perfumes" },
      { label: "Body Mists", href: "/shop?category=body-mists" },
      { label: "Roll-ons", href: "/shop?category=roll-ons" },
    ],
  },
  {
    label: "Makeup",
    items: [
      { label: "Lip", href: "/shop?category=lip" },
      { label: "Face", href: "/shop?category=makeup-face" },
      { label: "Eyes", href: "/shop?category=eyes" },
    ],
  },
  { label: "Brands", href: "/brands" },
  { label: "Combo Deals", href: "/deals", highlight: true },
  { label: "Offers", href: "/offers", sale: true },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Skin Blog", href: "/journal" },
]

const CONCERNS = ["Acne", "Hyperpigmentation", "Anti-Ageing", "Dry Skin", "Oily Skin", "Sensitive Skin"]
const INGREDIENTS = ["Vitamin C", "Retinol", "Niacinamide", "AHA/BHA", "Hyaluronic Acid", "SPF"]

/* ─── Component ─────────────────────────────────────────────── */
export function SiteNavbar() {
  const { count, openCart } = useCart()
  const { openSearch } = useSearch()
  const { session, signOut } = useUserAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [megaOpen, setMegaOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
        setMegaOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-all duration-300",
          scrolled ? "border-border bg-background/95 backdrop-blur-md shadow-sm" : "border-transparent bg-background",
        )}
      >
        {/* Main bar */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[70px] lg:px-8">

          {/* Mobile: hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(v => !v)}
            className="flex items-center text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          {/* Logo */}
          <Link href="/" aria-label="HAYDA home" className="flex flex-1 items-center justify-center gap-2.5 lg:flex-none lg:justify-start">
            <Image
              src="/logo.png"
              alt="HAYDA SKINCo. logo mark"
              width={0}
              height={0}
              className="object-contain size-10 md:size-16"
              priority
            />

          </Link>

          {/* Desktop nav — primary shopping categories only */}
          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {/* Category dropdowns: Face, Bath & Body, Fragrance, Makeup */}
            {NAV.filter(item => item.items).map(item => (
              <div
                key={item.label}
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
                className="relative"
              >
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors whitespace-nowrap",
                    activeDropdown === item.label ? "text-foreground" : "text-foreground/65 hover:text-foreground",
                  )}
                >
                  {item.label}
                  <ChevronDown className={cn("size-3 transition-transform", activeDropdown === item.label && "rotate-180")} />
                </button>
                {activeDropdown === item.label && (
                  <div className="absolute left-0 top-full z-50 min-w-[160px] border border-border bg-background shadow-xl">
                    {item.items!.map(sub => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-4 py-2.5 text-xs font-light text-foreground/80 transition-colors hover:bg-muted hover:text-gold"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Brands & Deals — direct links */}
            <Link href="/brands" className="px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-foreground/65 hover:text-foreground transition-colors whitespace-nowrap">
              Brands
            </Link>
            <Link href="/deals" className="relative px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-gold hover:text-gold/80 transition-colors whitespace-nowrap">
              Deals
              <span className="absolute -right-0.5 -top-0.5 flex size-1.5 rounded-full bg-gold" />
            </Link>
            <Link href="/offers" className="relative px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-red-600 hover:text-red-700 transition-colors whitespace-nowrap">
              Offers
              <span className="absolute -right-0.5 -top-0.5 flex size-1.5 rounded-full bg-red-500" />
            </Link>

            {/* "More" dropdown — Skin Needs, Blog, Wholesale */}
            <div
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
              className="relative"
            >
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors",
                  megaOpen ? "text-foreground" : "text-foreground/65 hover:text-foreground",
                )}
              >
                More
                <ChevronDown className={cn("size-3 transition-transform", megaOpen && "rotate-180")} />
              </button>

              {megaOpen && (
                <div className="absolute right-0 top-full z-50 grid w-[420px] grid-cols-2 gap-0 border border-border bg-background shadow-xl">
                  {/* Left — Skin Needs */}
                  <div className="border-r border-border p-5">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Skin Needs</p>
                    <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">By Concern</p>
                    {CONCERNS.map(c => (
                      <Link key={c} href={`/concern/${c.toLowerCase().replace(/\s+/g, "-").replace("/", "-")}`}
                        className="block py-1 text-xs font-light text-foreground/80 transition-colors hover:text-gold">
                        {c}
                      </Link>
                    ))}
                    <p className="mt-3 mb-1 text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">By Ingredient</p>
                    {INGREDIENTS.map(i => (
                      <Link key={i} href={`/ingredient/${i.toLowerCase().replace(/\s+/g, "-").replace("/", "-")}`}
                        className="block py-1 text-xs font-light text-foreground/80 transition-colors hover:text-gold">
                        {i}
                      </Link>
                    ))}
                  </div>
                  {/* Right — Other links */}
                  <div className="p-5">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Explore</p>
                    {[
                      { label: "Skin Blog", href: "/journal" },
                      { label: "Wholesale Store", href: "/wholesale" },
                      { label: "About HAYDA", href: "/about" },
                      { label: "Contact Us", href: "/contact" },
                    ].map(l => (
                      <Link key={l.label} href={l.href}
                        className="block py-2 text-xs font-light text-foreground/80 transition-colors hover:text-gold">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right: icons */}
          <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              className="text-foreground/70 transition-colors hover:text-gold"
            >
              <Search className="size-[18px]" />
            </button>

            {/* Account — signed out: icon only; signed in: first name + sign-out */}
            {session ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground/80 transition-colors hover:text-gold"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-gold-foreground">
                    {session.firstName.charAt(0).toUpperCase()}
                  </span>
                  {session.firstName}
                </Link>
                <button
                  type="button"
                  onClick={() => { signOut() }}
                  aria-label="Sign out"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  title="Sign out"
                >
                  <LogOut className="size-[16px]" />
                </button>
              </div>
            ) : (
              <Link
              href="/login"
                  aria-label="Sign in"
                className="hidden text-foreground/70 transition-colors hover:text-gold sm:block"
              >
                <User className="size-[18px]" />
              </Link>
            )}

            <button
              type="button"
              onClick={openCart}
              aria-label={`Cart, ${count} items`}
              className="relative text-foreground/70 transition-colors hover:text-gold"
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
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />

          {/* Sidebar panel */}
          <div className="absolute left-0 top-0 h-full w-[320px] max-w-[85vw] overflow-y-auto bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <Image src="/logo.png" alt="HAYDA logo" width={64} height={64} className="object-contain size-12" />

              </Link>
              <button type="button" onClick={() => setMobileOpen(false)}>
                <X className="size-5 text-foreground/70" />
              </button>
            </div>

            {/* Search */}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); openSearch() }}
              className="flex w-full items-center gap-3 border-b border-border px-5 py-3.5 text-sm font-light text-foreground/70"
            >
              <Search className="size-4" />
              Search products, brands…
            </button>

            {/* Nav items */}
            <nav className="divide-y divide-border/50">
              {NAV.map(item => {
                if (!item.items) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-5 py-3.5 text-sm font-medium",
                        item.highlight ? "text-gold" : (item as any).sale ? "text-red-600" : "text-foreground",
                      )}
                    >
                      {item.label}
                      {item.highlight && <Tag className="size-3.5 text-gold" />}
                      {(item as any).sale && <Tag className="size-3.5 text-red-500" />}
                    </Link>
                  )
                }

                const expanded = mobileExpanded === item.label
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => setMobileExpanded(expanded ? null : item.label)}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium text-foreground"
                    >
                      {item.label}
                      <ChevronDown className={cn("size-4 transition-transform text-muted-foreground", expanded && "rotate-180")} />
                    </button>
                    {expanded && (
                      <div className="bg-muted/30 pb-1">
                        {item.items.map(sub => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-8 py-2.5 text-sm font-light text-foreground/70 hover:text-gold"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Skin Needs accordion */}
              {(["concerns", "ingredients"] as const).map(type => {
                const isC = type === "concerns"
                const label = isC ? "Shop by Concern" : "Shop by Ingredient"
                const items = isC ? CONCERNS : INGREDIENTS
                const expanded = mobileExpanded === label
                return (
                  <div key={label}>
                    <button
                      type="button"
                      onClick={() => setMobileExpanded(expanded ? null : label)}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium text-foreground"
                    >
                      {label}
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
                    </button>
                    {expanded && (
                      <div className="bg-muted/30 pb-1">
                        {items.map(item => (
                          <Link
                            key={item}
                            href={`/${type === "concerns" ? "concern" : "ingredient"}/${item.toLowerCase().replace(/\s+/g, "-").replace("/", "-")}`}
                            onClick={() => setMobileOpen(false)}
                            className="block px-8 py-2.5 text-sm font-light text-foreground/70 hover:text-gold"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-border p-5 space-y-2">
              {session ? (
                <>
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="flex size-7 items-center justify-center rounded-full bg-gold text-xs font-medium text-gold-foreground">
                      {session.firstName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{session.firstName}</p>
                      <p className="text-[10px] font-light text-muted-foreground">{session.email}</p>
                    </div>
                  </div>
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 text-sm font-light text-foreground/70 hover:text-foreground">
                    <User className="size-4" /> My Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => { signOut(); setMobileOpen(false) }}
                    className="flex w-full items-center gap-3 py-2 text-sm font-light text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="size-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 text-sm font-light text-foreground/70 hover:text-foreground">
                  <User className="size-4" /> Sign In / Register
                </Link>
              )}
              <a href={whatsAppHref()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2 text-sm font-light text-foreground/70 hover:text-foreground">
                <span className="flex size-4 items-center justify-center rounded-full bg-[#25D366]">
                  <span className="text-[8px] font-bold text-white">W</span>
                </span>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
