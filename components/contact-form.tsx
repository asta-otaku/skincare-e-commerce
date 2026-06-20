"use client"

import { useState } from "react"
import { Check } from "lucide-react"

export function ContactForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  const fieldClass =
    "w-full border border-border bg-background px-4 py-3 text-sm font-light text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center border border-gold/50 bg-accent/40 px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-gold text-gold-foreground">
          <Check className="size-5" />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-medium text-foreground">Message Received</h3>
        <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
          Thank you for reaching out. Our concierge team will respond within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-[11px] font-light uppercase tracking-[0.18em] text-foreground">
            Name
          </label>
          <input id="name" name="name" type="text" required placeholder="Your name" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[11px] font-light uppercase tracking-[0.18em] text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className={fieldClass}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="text-[11px] font-light uppercase tracking-[0.18em] text-foreground">
          Subject
        </label>
        <input id="subject" name="subject" type="text" placeholder="How can we help?" className={fieldClass} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-[11px] font-light uppercase tracking-[0.18em] text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a little more..."
          className={`${fieldClass} resize-none`}
        />
      </div>
      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center border border-foreground bg-foreground px-9 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-background transition-all duration-300 hover:border-gold hover:bg-gold hover:text-gold-foreground"
      >
        Send Message
      </button>
    </form>
  )
}
