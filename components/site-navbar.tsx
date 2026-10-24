"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingBag, User, Menu, X, ChevronDown, ChevronRight, Tag, LogOut } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useSearch } from "@/components/search-modal"
import { useUserAuth } from "@/components/user-auth-provider"
import { getCategoryTree, DEFAULT_CATEGORY_TREE, type CategorySection } from "@/lib/supabase/categories"
import { ALL_CONCERNS, ALL_INGREDIENTS, ALL_SKIN_TYPES, slugifyCatalogLabel } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { whatsAppHref } from "@/lib/whatsapp"

type NavItem =
  | { label: string; href: string; highlight?: boolean; sale?: boolean; items?: undefined }
  | { label: string; items: { label: string; href: string }[]; href?: undefined; highlight?: boolean; sale?: boolean }

function treeToNav(tree: CategorySection[]): NavItem[] {
  const sections: NavItem[] = tree.map(s => ({
    label: s.name,
    items: s.categories.map(c => ({
      label: c.name,
      href: `/shop?category=${encodeURIComponent(c.slug)}`,
    })),
  }))
  return [
    ...sections,
    { label: "Brands", href: "/brands" },
    { label: "Combo Deals", href: "/deals", highlight: true },
    { label: "Offers", href: "/offers", sale: true },
    { label: "Wholesale", href: "/wholesale" },
    { label: "Skin Blog", href: "/journal" },
  ]
}

const FALLBACK_NAV = treeToNav(DEFAULT_CATEGORY_TREE)

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
  const [nav, setNav] = useState<NavItem[]>(FALLBACK_NAV)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCategoryTree().then(tree => {
      if (tree.length) setNav(treeToNav(tree))
    })
  }, [])

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

  const categoryNav = nav.filter(item => item.items && item.items.length > 0)

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "atelier-nav sticky top-0 z-40 w-full border-b",
          scrolled
            ? "border-border bg-background/95 shadow-[0_12px_40px_-24px_rgba(41,48,73,0.55)] backdrop-blur-md"
            : "border-transparent bg-background shadow-none",
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
              width={160}
              height={200}
              sizes="80px"
              quality={100}
              className="size-16 object-contain lg:size-14"
              priority
            />

          </Link>

          {/* Desktop nav — primary shopping categories only */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            {/* Category dropdowns from admin category tree */}
            {categoryNav.map(item => (
              <div
                key={item.label}
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
                className="relative"
              >
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-0.5 whitespace-nowrap px-1.5 py-2 text-[11px] font-medium uppercase tracking-[0.04em] transition-colors xl:px-2.5 xl:tracking-[0.08em]",
                    activeDropdown === item.label ? "text-foreground" : "text-foreground/65 hover:text-foreground",
                  )}
                >
                  {item.label}
                  <ChevronDown className={cn("size-3 transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none", activeDropdown === item.label && "rotate-180")} />
                </button>
                <div
                  inert={activeDropdown !== item.label}
                  className={cn(
                    "atelier-dropdown absolute left-0 top-full z-50 max-h-[70vh] min-w-[200px] overflow-y-auto border border-border bg-background shadow-[0_16px_40px_-24px_rgba(41,48,73,0.45)]",
                    activeDropdown === item.label && "is-open",
                  )}
                >
                  {item.items!.map(sub => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      tabIndex={activeDropdown === item.label ? undefined : -1}
                      className="block px-4 py-2.5 text-xs font-light text-foreground/80 transition-colors duration-700 hover:bg-secondary hover:text-[#293049] motion-reduce:transition-none"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Brands & Deals — direct links */}
            <Link href="/brands" className="whitespace-nowrap px-1.5 py-2 text-[11px] font-medium uppercase tracking-[0.04em] text-foreground/65 transition-colors hover:text-foreground xl:px-2.5 xl:tracking-[0.08em]">
              Brands
            </Link>
            <Link href="/deals" className="relative whitespace-nowrap px-1.5 py-2 text-[11px] font-medium uppercase tracking-[0.04em] text-gold transition-colors hover:text-gold/80 xl:px-2.5 xl:tracking-[0.08em]">
              Deals
              <span className="absolute -right-0.5 -top-0.5 flex size-1.5 rounded-full bg-gold" />
            </Link>
            <Link href="/offers" className="relative whitespace-nowrap px-1.5 py-2 text-[11px] font-medium uppercase tracking-[0.04em] text-red-600 transition-colors hover:text-red-700 xl:px-2.5 xl:tracking-[0.08em]">
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
                  "flex items-center gap-0.5 whitespace-nowrap px-1.5 py-2 text-[11px] font-medium uppercase tracking-[0.04em] transition-colors xl:px-2.5 xl:tracking-[0.08em]",
                  megaOpen ? "text-foreground" : "text-foreground/65 hover:text-foreground",
                )}
              >
                More
                <ChevronDown className={cn("size-3 transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none", megaOpen && "rotate-180")} />
              </button>

              <div
                inert={!megaOpen}
                className={cn(
                  "atelier-dropdown absolute right-0 top-full z-50 grid w-[480px] grid-cols-2 gap-0 border border-border bg-background shadow-[0_16px_40px_-24px_rgba(41,48,73,0.45)]",
                  megaOpen && "is-open",
                )}
              >
                  {/* Left — Skin Needs */}
                  <div className="border-r border-border p-5">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Skin Needs</p>
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">By Concern</p>
                    <div className="mb-3 max-h-36 overflow-y-auto pr-1">
                      {ALL_CONCERNS.map(c => (
                        <Link key={c} href={`/concern/${slugifyCatalogLabel(c)}`}
                          className="block py-1 text-xs font-light text-foreground/80 transition-colors hover:text-gold">
                          {c}
                        </Link>
                      ))}
                    </div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">By Ingredient</p>
                    <div className="mb-3 max-h-28 overflow-y-auto pr-1">
                      {ALL_INGREDIENTS.map(i => (
                        <Link key={i} href={`/ingredient/${slugifyCatalogLabel(i)}`}
                          className="block py-1 text-xs font-light text-foreground/80 transition-colors hover:text-gold">
                          {i}
                        </Link>
                      ))}
                    </div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">By Skin Type</p>
                    <div className="max-h-28 overflow-y-auto pr-1">
                      {ALL_SKIN_TYPES.map(t => (
                        <Link key={t} href={`/shop?skinType=${slugifyCatalogLabel(t)}`}
                          className="block py-1 text-xs font-light text-foreground/80 transition-colors hover:text-gold">
                          {t}
                        </Link>
                      ))}
                    </div>
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
            </div>
          </nav>

          {/* Right: icons */}
          <div className="flex flex-1 items-center justify-end gap-3 md:gap-4 lg:flex-none lg:gap-3">
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
          <div className="atelier-menu absolute inset-0 bg-foreground/40 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />

          {/* Sidebar panel */}
          <div className="atelier-menu absolute left-0 top-0 h-full w-[320px] max-w-[85vw] overflow-y-auto bg-background shadow-[0_16px_40px_-24px_rgba(41,48,73,0.45)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="HAYDA logo"
                  width={96}
                  height={120}
                  sizes="48px"
                  quality={100}
                  className="object-contain size-12"
                />

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
              {nav.map(item => {
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
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none", expanded && "rotate-180")} />
                    </button>
                    {expanded && (
                      <div className="atelier-menu bg-secondary pb-1">
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
              {([
                { key: "concerns", label: "Shop by Concern", items: ALL_CONCERNS, href: (item: string) => `/concern/${slugifyCatalogLabel(item)}` },
                { key: "ingredients", label: "Shop by Ingredient", items: ALL_INGREDIENTS, href: (item: string) => `/ingredient/${slugifyCatalogLabel(item)}` },
                { key: "skinTypes", label: "Shop by Skin Type", items: ALL_SKIN_TYPES, href: (item: string) => `/shop?skinType=${slugifyCatalogLabel(item)}` },
              ] as const).map(({ key, label, items, href }) => {
                const expanded = mobileExpanded === label
                return (
                  <div key={key}>
                    <button
                      type="button"
                      onClick={() => setMobileExpanded(expanded ? null : label)}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium text-foreground"
                    >
                      {label}
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none", expanded && "rotate-180")} />
                    </button>
                    {expanded && (
                      <div className="atelier-menu max-h-56 overflow-y-auto bg-secondary pb-1">
                        {items.map(item => (
                          <Link
                            key={item}
                            href={href(item)}
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
