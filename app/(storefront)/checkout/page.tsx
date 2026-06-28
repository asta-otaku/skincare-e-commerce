"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Check, Lock, Truck, ArrowLeft, ShieldCheck, Zap, Building2, Smartphone } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/products"
import { cn } from "@/lib/utils"

type Step = "shipping" | "payment" | "review" | "confirmed"

const STEPS: { id: Step; label: string }[] = [
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
]

function StepIndicator({ current }: { current: Step }) {
  const ids: Step[] = ["shipping", "payment", "review"]
  const currentIdx = ids.indexOf(current)
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-[11px] font-medium transition-all",
                  done
                    ? "border-gold bg-gold text-gold-foreground"
                    : active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[11px] uppercase tracking-[0.15em]",
                  active ? "font-medium text-foreground" : done ? "text-gold" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-3 size-3.5 text-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}

type ShippingData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  apartment: string
  city: string
  state: string
  zip: string
  country: string
  shippingMethod: "standard" | "express"
}

type PaymentMethod = "card" | "bank_transfer" | "ussd" | "mobile_money"

const SHIPPING_METHODS = [
  { id: "standard" as const, label: "Standard Shipping", desc: "5–7 business days", price: 0, priceLabel: "Free" },
  { id: "express" as const, label: "Express Shipping", desc: "2–3 business days", price: 18, priceLabel: "$18" },
]

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState<Step>("shipping")

  const [shipping, setShipping] = useState<ShippingData>({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", apartment: "", city: "", state: "", zip: "", country: "United States",
    shippingMethod: "standard",
  })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")

  const shippingCost = shipping.shippingMethod === "express" ? 18 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  function handleConfirm() {
    clearCart()
    setStep("confirmed")
  }

  if (step === "confirmed") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-gold/20 mb-6">
          <Check className="size-8 text-gold" />
        </div>
        <p className="text-[11px] font-light uppercase tracking-[0.25em] text-gold mb-3">Order Confirmed</p>
        <h1 className="font-serif text-4xl font-medium text-foreground mb-4">Thank you for your order</h1>
        <p className="max-w-md text-sm font-light text-muted-foreground leading-relaxed mb-2">
          Your Aurelia ritual is on its way. A confirmation email has been sent to{" "}
          <span className="font-medium text-foreground">{shipping.email}</span>.
        </p>
        <p className="mb-8 text-[11px] font-light uppercase tracking-[0.18em] text-muted-foreground">
          Order #{Math.random().toString(36).slice(2, 10).toUpperCase()}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="border border-foreground px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="bg-gold px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] text-gold-foreground transition-opacity hover:opacity-80"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0 && step !== "confirmed") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-5 text-center">
        <p className="font-serif text-2xl font-medium">Your cart is empty</p>
        <p className="text-sm font-light text-muted-foreground">Add items to your cart before checking out.</p>
        <Link href="/shop" className="bg-foreground px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] text-background">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="font-serif text-2xl font-medium tracking-[0.25em]">
            AURELIA
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="size-3" /> Secure checkout
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        {/* Breadcrumb / Steps */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to shop
          </Link>
          <StepIndicator current={step} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: Form */}
          <div>
            {step === "shipping" && (
              <ShippingForm
                data={shipping}
                onChange={setShipping}
                onNext={() => setStep("payment")}
              />
            )}
            {step === "payment" && (
              <PaystackPaymentStep
                method={paymentMethod}
                onMethodChange={setPaymentMethod}
                total={total}
                email={shipping.email}
                onBack={() => setStep("shipping")}
                onNext={() => setStep("review")}
              />
            )}
            {step === "review" && (
              <ReviewStep
                shipping={shipping}
                paymentMethod={paymentMethod}
                shippingCost={shippingCost}
                tax={tax}
                total={total}
                onBack={() => setStep("payment")}
                onConfirm={handleConfirm}
              />
            )}
          </div>

          {/* Right: Order summary */}
          <OrderSummary items={items} subtotal={subtotal} shippingCost={shippingCost} tax={tax} total={total} />
        </div>
      </div>
    </div>
  )
}

/* ─── Shipping Form ────────────────────────────────────────── */
function ShippingForm({
  data, onChange, onNext,
}: {
  data: ShippingData
  onChange: (d: ShippingData) => void
  onNext: () => void
}) {
  const set = (key: keyof ShippingData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [key]: e.target.value })

  return (
    <div>
      <h2 className="font-serif text-2xl font-medium mb-6">Shipping Information</h2>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" value={data.firstName} onChange={set("firstName")} required />
          <FormField label="Last Name" value={data.lastName} onChange={set("lastName")} required />
        </div>
        <FormField label="Email Address" type="email" value={data.email} onChange={set("email")} required />
        <FormField label="Phone Number" type="tel" value={data.phone} onChange={set("phone")} />
        <FormField label="Address" value={data.address} onChange={set("address")} required />
        <FormField label="Apartment, suite, etc. (optional)" value={data.apartment} onChange={set("apartment")} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" value={data.city} onChange={set("city")} required />
          <FormField label="State / Province" value={data.state} onChange={set("state")} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="ZIP / Postal Code" value={data.zip} onChange={set("zip")} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Country</label>
            <select
              value={data.country}
              onChange={set("country")}
              className="border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors"
            >
              {["United States", "United Kingdom", "Canada", "Australia", "France", "Germany"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shipping method */}
        <div>
          <p className="mb-3 text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
            Shipping Method
          </p>
          <div className="space-y-2">
            {SHIPPING_METHODS.map((method) => (
              <label
                key={method.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between border p-4 transition-colors",
                  data.shippingMethod === method.id
                    ? "border-foreground bg-muted/30"
                    : "border-border hover:border-foreground/50",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-4 rounded-full border-2 transition-all",
                      data.shippingMethod === method.id
                        ? "border-gold bg-gold"
                        : "border-border",
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">{method.label}</p>
                    <p className="text-xs font-light text-muted-foreground">{method.desc}</p>
                  </div>
                </div>
                <p className="text-sm font-medium">{method.priceLabel}</p>
                <input
                  type="radio"
                  className="sr-only"
                  checked={data.shippingMethod === method.id}
                  onChange={() => onChange({ ...data, shippingMethod: method.id })}
                />
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="mt-4 w-full bg-foreground py-4 text-xs font-medium uppercase tracking-[0.18em] text-background transition-colors hover:bg-gold hover:text-gold-foreground"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}

/* ─── Paystack Payment Step ────────────────────────────────── */
const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "card", label: "Debit / Credit Card", desc: "Visa, Mastercard, Verve", icon: Zap },
  { id: "bank_transfer", label: "Bank Transfer", desc: "Pay directly from your bank", icon: Building2 },
  { id: "ussd", label: "USSD", desc: "Pay via mobile USSD code", icon: Smartphone },
  { id: "mobile_money", label: "Mobile Money", desc: "MTN, Airtel, Glo Money", icon: Smartphone },
]

function PaystackPaymentStep({
  method, onMethodChange, total, email, onBack, onNext,
}: {
  method: PaymentMethod
  onMethodChange: (m: PaymentMethod) => void
  total: number
  email: string
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-medium mb-2">Payment</h2>
      <p className="mb-6 text-sm font-light text-muted-foreground flex items-center gap-1.5">
        <Lock className="size-3.5" /> Your payment is processed securely by Paystack.
      </p>

      {/* Paystack brand banner */}
      <div className="mb-6 border border-border bg-muted/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Paystack wordmark (text-based since no asset) */}
            <div className="flex items-center gap-1.5">
              <div className="flex size-7 items-center justify-center rounded-full bg-[#00C3F7]">
                <span className="text-[11px] font-bold text-white">P</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">Paystack</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-green-600" />
            <span className="text-[10px] font-light text-green-700 uppercase tracking-[0.12em]">Secured</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-light uppercase tracking-[0.18em] text-muted-foreground">Amount to pay</p>
            <p className="mt-0.5 font-serif text-2xl font-medium">{formatPrice(total)}</p>
          </div>
          {email && (
            <div className="text-right">
              <p className="text-[10px] font-light uppercase tracking-[0.18em] text-muted-foreground">Paying as</p>
              <p className="mt-0.5 text-sm font-medium">{email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment method selector */}
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
          Select Payment Method
        </p>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              onClick={() => onMethodChange(m.id)}
              className={cn(
                "flex cursor-pointer items-center gap-4 border p-4 transition-colors",
                method === m.id
                  ? "border-foreground bg-muted/30"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <div className={cn(
                "size-4 rounded-full border-2 transition-all shrink-0",
                method === m.id ? "border-gold bg-gold" : "border-border",
              )} />
              <div className="flex-1">
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs font-light text-muted-foreground">{m.desc}</p>
              </div>
              <m.icon className="size-4 text-muted-foreground shrink-0" />
            </label>
          ))}
        </div>
      </div>

      {/* Info note */}
      <div className="mb-6 flex items-start gap-3 border border-border/60 bg-muted/20 p-4 text-xs font-light text-muted-foreground">
        <Lock className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
        <p>
          You will be redirected to a secure Paystack checkout page to complete your payment.
          Your financial details are never stored on our servers.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 border border-border px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:border-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 bg-foreground py-4 text-xs font-medium uppercase tracking-[0.18em] text-background transition-colors hover:bg-gold hover:text-gold-foreground"
        >
          Review Order
        </button>
      </div>
    </div>
  )
}

/* ─── Review Step ──────────────────────────────────────────── */
const METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "Debit / Credit Card",
  bank_transfer: "Bank Transfer",
  ussd: "USSD",
  mobile_money: "Mobile Money",
}

function ReviewStep({
  shipping, paymentMethod, shippingCost, tax, total, onBack, onConfirm,
}: {
  shipping: ShippingData
  paymentMethod: PaymentMethod
  shippingCost: number
  tax: number
  total: number
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-medium mb-6">Review Order</h2>

      <div className="space-y-5">
        {/* Shipping summary */}
        <div className="border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-[0.15em]">Shipping</span>
            </div>
            <button
              type="button"
              onClick={() => onBack()}
              className="text-[11px] font-light uppercase tracking-[0.15em] text-gold underline-offset-2 hover:underline"
            >
              Edit
            </button>
          </div>
          <p className="text-sm font-light">
            {shipping.firstName} {shipping.lastName}
          </p>
          <p className="text-sm font-light text-muted-foreground">
            {shipping.address}{shipping.apartment && `, ${shipping.apartment}`}, {shipping.city}, {shipping.state} {shipping.zip}
          </p>
          <p className="text-sm font-light text-muted-foreground">{shipping.country}</p>
          <p className="mt-2 text-xs font-light text-muted-foreground">
            {shipping.shippingMethod === "express" ? "Express Shipping (2–3 days)" : "Standard Shipping (5–7 days)"}
          </p>
        </div>

        {/* Payment summary — Paystack */}
        <div className="border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded-full bg-[#00C3F7]">
                <span className="text-[9px] font-bold text-white">P</span>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.15em]">Payment via Paystack</span>
            </div>
          </div>
          <p className="text-sm font-light">{METHOD_LABELS[paymentMethod]}</p>
          <p className="mt-1 text-xs font-light text-muted-foreground">
            You will be redirected to Paystack to complete this payment securely.
          </p>
        </div>

        {/* Totals */}
        <div className="border border-border p-5 space-y-2.5">
          <LineItem label="Subtotal" value={formatPrice(total - shippingCost - tax)} />
          <LineItem label={shippingCost === 0 ? "Shipping (Free)" : "Express Shipping"} value={shippingCost === 0 ? "Free" : formatPrice(shippingCost)} />
          <LineItem label="Estimated Tax" value={formatPrice(tax)} />
          <div className="border-t border-border pt-2.5">
            <LineItem label="Total" value={formatPrice(total)} bold />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 border border-border px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:border-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-[#00C3F7] py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
          >
            <Lock className="size-3.5" /> Pay with Paystack
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Order Summary Sidebar ─────────────────────────────────── */
function OrderSummary({
  items, subtotal, shippingCost, tax, total,
}: {
  items: ReturnType<typeof useCart>["items"]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
}) {
  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="border border-border p-6">
        <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.2em]">Order Summary</h3>
        <ul className="divide-y divide-border mb-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 py-3.5">
              <div className="relative size-16 shrink-0 overflow-hidden border border-border bg-muted/40">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="64px" className="object-cover" />
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] text-background">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-xs font-medium leading-snug">{item.name}</p>
                <p className="text-xs font-light text-muted-foreground">{item.tagline}</p>
              </div>
              <p className="text-xs font-medium self-center">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-border pt-4">
          <LineItem label="Subtotal" value={formatPrice(subtotal)} small />
          <LineItem label="Shipping" value={shippingCost === 0 ? "Free" : formatPrice(shippingCost)} small />
          <LineItem label="Tax (est.)" value={formatPrice(tax)} small />
          <div className="border-t border-border pt-2 mt-2">
            <LineItem label="Total" value={formatPrice(total)} bold />
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-4 flex flex-col gap-2 text-center text-[10px] font-light uppercase tracking-[0.18em] text-muted-foreground">
        <span className="flex items-center justify-center gap-1.5">
          <Lock className="size-3" /> Secure & encrypted checkout
        </span>
        <span>Free returns within 30 days</span>
      </div>
    </aside>
  )
}

/* ─── Shared helpers ───────────────────────────────────────── */
function FormField({
  label, value, onChange, type = "text", required, placeholder, inputMode,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
        {label}{required && <span className="text-gold ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        required={required}
        className="border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"
      />
    </div>
  )
}

function LineItem({ label, value, bold, small }: { label: string; value: string; bold?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("font-light text-muted-foreground", small ? "text-[11px]" : "text-xs uppercase tracking-[0.12em]")}>
        {label}
      </span>
      <span className={cn(bold ? "font-serif text-lg font-medium" : small ? "text-xs" : "text-sm")}>
        {value}
      </span>
    </div>
  )
}
