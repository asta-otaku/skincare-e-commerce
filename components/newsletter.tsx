"use client"

import { useState } from "react"
import { Check } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email) return
    setSubmitted(true)
    setEmail("")
    window.setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:py-24 lg:px-8">
      <div className="flex flex-col items-center border border-gold/50 px-6 py-14 text-center md:px-12 md:py-20">
        <p className="text-xs font-light uppercase tracking-[0.3em] text-gold">The HAYDA List</p>
        <h2 className="mt-4 text-balance font-serif text-3xl font-light text-foreground md:text-4xl">
          Join the ritual
        </h2>
        <p className="mt-4 max-w-md text-pretty text-base font-light leading-relaxed text-muted-foreground">
          Receive early access to new launches, considered skincare notes, and 10% off your first
          order.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            className="flex-1 border border-border bg-background px-4 py-3 text-sm font-light text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 border border-gold bg-gold px-7 py-3 text-xs font-medium uppercase tracking-[0.18em] text-gold-foreground transition-all duration-300 hover:bg-transparent hover:text-foreground"
          >
            {submitted ? (
              <>
                <Check className="size-3.5" /> Subscribed
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
      </div>
    </section>
  )
}
