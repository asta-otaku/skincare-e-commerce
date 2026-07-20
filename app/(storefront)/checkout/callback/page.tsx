"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Check, XCircle } from "lucide-react"
import { useCart } from "@/components/cart-provider"

function CallbackInner() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  // Paystack appends `reference` and/or `trxref` on redirect
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref") ?? ""
  const mock = searchParams.get("mock") === "1"

  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!reference) {
      setStatus("fail")
      setMessage("Missing payment reference.")
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/orders/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference, mock }),
        })
        const data = await res.json()
        if (cancelled) return
        if (res.ok && data.ok) {
          clearCart()
          setStatus("ok")
          setMessage(data.message ?? "Payment confirmed.")
        } else {
          setStatus("fail")
          setMessage(data.error ?? data.message ?? "Payment could not be verified.")
        }
      } catch {
        if (!cancelled) {
          setStatus("fail")
          setMessage("Network error while verifying payment.")
        }
      }
    })()

    return () => { cancelled = true }
  }, [reference, mock, clearCart])

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="size-8 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
        <p className="text-sm font-light text-muted-foreground">Confirming your payment…</p>
        <p className="text-[11px] font-mono text-muted-foreground">{reference}</p>
      </div>
    )
  }

  if (status === "fail") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-2">
          <XCircle className="size-8 text-destructive" />
        </div>
        <h1 className="font-serif text-3xl font-medium">Payment issue</h1>
        <p className="max-w-md text-sm font-light text-muted-foreground">{message}</p>
        <div className="flex gap-3 mt-4">
          <Link href="/checkout" className="border border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground">
            Back to Checkout
          </Link>
          <Link href="/shop" className="bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-background">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-gold/20 mb-2">
        <Check className="size-8 text-gold" />
      </div>
      <p className="text-[11px] font-light uppercase tracking-[0.25em] text-gold">Payment Successful</p>
      <h1 className="font-serif text-4xl font-medium">Thank you</h1>
      <p className="max-w-md text-sm font-light text-muted-foreground">
        Your order <span className="font-medium text-foreground font-mono">{reference}</span> is confirmed.
        You can track it anytime from your account.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Link
          href="/account/orders"
          className="border border-foreground px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] hover:bg-foreground hover:text-background transition-colors"
        >
          View Orders
        </Link>
        <Link
          href="/shop"
          className="bg-gold px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] text-gold-foreground hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <span className="size-8 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  )
}
