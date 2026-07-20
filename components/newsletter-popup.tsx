"use client"

import { useState, useEffect } from "react"
import { X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "hayda_newsletter_dismissed"

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only show once — respect dismissal stored in sessionStorage
    if (typeof window !== "undefined" && !sessionStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 8000)
      return () => clearTimeout(t)
    }
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

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px]"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Newsletter signup"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background p-8 shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2",
        )}
      >
        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close newsletter popup"
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold mb-2">
            The HAYDA List
          </p>
          <h2 className="font-serif text-2xl font-medium md:text-3xl">
            Get 10% off your first order
          </h2>
          <p className="mt-3 text-sm font-light text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Sign up for early access to new arrivals, skincare guides, and exclusive member-only offers.
          </p>

          {submitted ? (
            <div className="mt-7 flex flex-col items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-gold/10">
                <Check className="size-6 text-gold" />
              </div>
              <p className="text-sm font-medium">You're on the list!</p>
              <p className="text-xs font-light text-muted-foreground">
                Check your inbox for your 10% discount code.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="shrink-0 bg-foreground px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
              >
                {loading ? "…" : "Subscribe"}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-3 text-xs font-light text-destructive">{error}</p>
          )}

          <p className="mt-4 text-[10px] font-light text-muted-foreground">
            No spam, ever. Unsubscribe any time.{" "}
            <button type="button" onClick={dismiss} className="underline underline-offset-2 hover:text-foreground transition-colors">
              No thanks
            </button>
          </p>
        </div>
      </div>
    </>
  )
}
