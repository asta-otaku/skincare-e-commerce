"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X, Check } from "lucide-react"

const STORAGE_KEY = "hayda_newsletter_dismissed"
const DELAY_MS = 20_000

function isCheckoutPath(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/"
  return path === "/checkout" || path === "/checkout/callback"
}

export function NewsletterPopup() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(STORAGE_KEY)) return
    const t = window.setTimeout(() => setVisible(true), DELAY_MS)
    return () => window.clearTimeout(t)
  }, [])

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "popup" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not subscribe.")
        return
      }
      setSubmitted(true)
      sessionStorage.setItem(STORAGE_KEY, "1")
      setTimeout(() => {
        setVisible(false)
        setSubmitted(false)
      }, 2500)
    } catch {
      setError("Could not subscribe. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!visible || isCheckoutPath(pathname)) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px]"
        onClick={dismiss}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-popup-title"
        className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-border bg-background p-6 pt-11 shadow-2xl sm:p-8 sm:pt-12"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close newsletter popup"
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold mb-3">
            The HAYDA List
          </p>
          <h2 id="newsletter-popup-title" className="text-balance font-serif text-2xl font-medium leading-snug">
            Early access to new arrivals
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-pretty text-sm font-light leading-relaxed text-muted-foreground">
            Join the list for a first look at new arrivals and notes from the journal.
          </p>

          {submitted ? (
            <div className="mt-7 flex flex-col items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-lavender">
                <Check className="size-6 text-gold" />
              </div>
              <p className="text-sm font-medium">You&apos;re on the list.</p>
              <p className="text-pretty text-xs font-light text-muted-foreground">
                Check your inbox for early access, and for 10% off your first order.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
              <label htmlFor="newsletter-popup-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-popup-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="min-w-0 w-full border border-border bg-background px-4 py-3 text-sm font-light outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-foreground"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
              >
                {loading ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-3 text-pretty text-xs font-light text-destructive">{error}</p>
          )}

          <p className="mt-4 text-[10px] font-light leading-relaxed text-muted-foreground">
            No spam, ever. Unsubscribe any time.{" "}
            <button type="button" onClick={dismiss} className="underline underline-offset-2 transition-colors hover:text-foreground">
              No thanks
            </button>
          </p>
        </div>
      </div>
    </>
  )
}
