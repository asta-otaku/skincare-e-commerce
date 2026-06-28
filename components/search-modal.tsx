"use client"

import { useEffect, useRef, useState, createContext, useContext, useCallback, useMemo, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, X, ArrowRight } from "lucide-react"
import { products, formatPrice, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"

/* ─── Context ──────────────────────────────────────────────── */
type SearchContextValue = {
  isSearchOpen: boolean
  openSearch: () => void
  closeSearch: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const openSearch = useCallback(() => setIsSearchOpen(true), [])
  const closeSearch = useCallback(() => setIsSearchOpen(false), [])
  const value = useMemo(() => ({ isSearchOpen, openSearch, closeSearch }), [isSearchOpen, openSearch, closeSearch])
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) throw new Error("useSearch must be used within SearchProvider")
  return context
}

/* ─── Modal ─────────────────────────────────────────────────── */
const CATEGORIES = ["All", "Serums", "Oils", "Moisturizers", "Toners", "Eye Care", "Cleansers"]

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useSearch()
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden"
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ""
      setQuery("")
      setActiveCategory("All")
    }
    return () => { document.body.style.overflow = "" }
  }, [isSearchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [closeSearch])

  const results = useMemo<Product[]>(() => {
    let pool = products
    if (activeCategory !== "All") {
      pool = pool.filter((p) => p.category === activeCategory)
    }
    if (!query.trim()) return pool
    const q = query.toLowerCase()
    return pool.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  }, [query, activeCategory])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeSearch}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
          isSearchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex max-h-[85vh] flex-col bg-background shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isSearchOpen ? "translate-y-0" : "-translate-y-full",
        )}
      >
        {/* Search bar */}
        <div className="flex items-center gap-4 border-b border-border px-5 py-4 md:px-8 md:py-5">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search products, rituals, ingredients…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base font-light outline-none placeholder:text-muted-foreground/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={closeSearch}
            className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close search"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto border-b border-border px-5 py-3 md:px-8 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-200",
                activeCategory === cat
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-serif text-xl font-medium">No results found</p>
              <p className="mt-2 text-sm font-light text-muted-foreground">
                Try a different search term or browse all products.
              </p>
              <Link
                href="/shop"
                onClick={closeSearch}
                className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gold hover:underline"
              >
                Browse all products <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-[11px] font-light uppercase tracking-[0.18em] text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""}
                {query && <> for &ldquo;{query}&rdquo;</>}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={closeSearch}
                    className="group flex flex-col gap-2"
                  >
                    <div className="relative aspect-4/5 overflow-hidden border border-border bg-muted/40 transition-colors group-hover:border-gold/60">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-light uppercase tracking-[0.2em] text-gold">
                        {product.category}
                      </p>
                      <p className="mt-0.5 text-sm font-medium leading-snug transition-colors group-hover:text-gold">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs font-light text-muted-foreground">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
