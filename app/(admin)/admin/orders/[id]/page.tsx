"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { use } from "react"
import {
  ArrowLeft, MapPin, Mail, Phone, Package, CreditCard,
  Truck, Clock, CheckCircle2, XCircle, RotateCcw,
  ChevronDown, ExternalLink, Copy, Check,
} from "lucide-react"
import {
  orders,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
} from "@/lib/orders"
import { cn } from "@/lib/utils"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n)
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

/* Order status timeline */
const STATUS_TIMELINE: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "pending",    label: "Order placed",   icon: Clock },
  { status: "processing", label: "Processing",      icon: Package },
  { status: "shipped",    label: "Shipped",         icon: Truck },
  { status: "fulfilled",  label: "Delivered",       icon: CheckCircle2 },
]

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [orderList, setOrderList] = useState(orders)
  const [statusOpen, setStatusOpen] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)
  const [noteValue, setNoteValue] = useState("")
  const [saving, setSaving] = useState(false)

  const order = orderList.find(o => o.id === id)
  if (!order) notFound()

  const statusMeta = ORDER_STATUS_META[order.status]
  const paymentMeta = PAYMENT_STATUS_META[order.paymentStatus]
  const isCancelled = order.status === "cancelled" || order.status === "refunded"

  function updateStatus(status: OrderStatus) {
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    setStatusOpen(false)
  }

  function copyRef() {
    navigator.clipboard.writeText(order.reference)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 1800)
  }

  async function saveNote() {
    if (!noteValue.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, notes: (o.notes ? o.notes + "\n" : "") + `[${new Date().toLocaleDateString()}] ${noteValue}` } : o))
    setNoteValue("")
    setSaving(false)
  }

  /* Determine timeline progress */
  const progressStatuses: OrderStatus[] = ["pending", "processing", "shipped", "fulfilled"]
  const progressIdx = isCancelled ? -1 : progressStatuses.indexOf(order.status)

  return (
    <div className="flex-1 overflow-auto" onClick={() => setStatusOpen(false)}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-light text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]"
          >
            <ArrowLeft className="size-3.5" /> Orders
          </button>
          <span className="text-border">/</span>
          <h1 className="font-mono text-sm font-medium">{order.id}</h1>
          <span className={cn(
            "border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em]",
            statusMeta.bg, statusMeta.color, statusMeta.border,
          )}>
            {statusMeta.label}
          </span>
        </div>

        {/* Status changer */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setStatusOpen(v => !v)}
            className="flex items-center gap-2 border border-border bg-background px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors"
          >
            Update Status <ChevronDown className="size-3.5" />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-11 z-40 min-w-44 border border-border bg-background shadow-lg">
              {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map(s => {
                const m = ORDER_STATUS_META[s]
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateStatus(s)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-xs transition-colors hover:bg-muted",
                      order.status === s ? "font-medium" : "font-light text-muted-foreground",
                    )}
                  >
                    <span className={cn("size-2 rounded-full shrink-0 border", m.bg, m.border)} />
                    {m.label}
                    {order.status === s && <Check className="ml-auto size-3 text-gold" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Order timeline */}
            {!isCancelled ? (
              <section className="border border-border p-6">
                <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em]">Order Progress</h2>
                <div className="relative flex items-start">
                  {/* Connecting line */}
                  <div className="absolute left-4 top-4 h-0.5 w-[calc(100%-2rem)] bg-border" />
                  <div
                    className="absolute left-4 top-4 h-0.5 bg-gold transition-all duration-700"
                    style={{ width: progressIdx >= 0 ? `${(progressIdx / (STATUS_TIMELINE.length - 1)) * 100}%` : "0%" }}
                  />
                  {STATUS_TIMELINE.map((step, i) => {
                    const done = i <= progressIdx
                    const current = i === progressIdx
                    return (
                      <div key={step.status} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                        <div className={cn(
                          "relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-all",
                          done
                            ? "border-gold bg-gold text-gold-foreground"
                            : "border-border bg-background text-muted-foreground",
                          current && "ring-2 ring-gold/30 ring-offset-1",
                        )}>
                          <step.icon className="size-3.5" />
                        </div>
                        <div>
                          <p className={cn("text-[10px] font-medium uppercase tracking-[0.12em]", done ? "text-foreground" : "text-muted-foreground")}>
                            {step.label}
                          </p>
                          {current && (
                            <p className="text-[9px] font-light text-gold mt-0.5">Current</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ) : (
              <section className="border border-destructive/30 bg-destructive/5 p-5">
                <div className="flex items-center gap-3">
                  {order.status === "refunded" ? (
                    <RotateCcw className="size-5 text-destructive shrink-0" />
                  ) : (
                    <XCircle className="size-5 text-destructive shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-destructive capitalize">{order.status}</p>
                    {order.notes && <p className="text-xs font-light text-muted-foreground mt-0.5">{order.notes}</p>}
                  </div>
                </div>
              </section>
            )}

            {/* Items */}
            <section className="border border-border">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em]">
                  Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
                <Link
                  href="/admin/products"
                  className="flex items-center gap-1 text-[11px] font-light text-muted-foreground hover:text-gold transition-colors"
                >
                  Manage products <ExternalLink className="size-3" />
                </Link>
              </div>
              <ul className="divide-y divide-border">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="relative size-16 shrink-0 overflow-hidden border border-border bg-muted/40">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/products/${item.productId}/edit`} className="text-sm font-medium hover:text-gold transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gold mt-0.5">{item.category}</p>
                      <p className="text-xs font-light text-muted-foreground mt-0.5">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              {/* Pricing breakdown */}
              <div className="border-t border-border px-6 py-4 space-y-2">
                <PriceLine label="Subtotal" value={formatCurrency(order.subtotal)} />
                <PriceLine
                  label={order.shippingMethod === "express" ? "Express Shipping" : "Standard Shipping"}
                  value={order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost)}
                />
                <PriceLine label="Tax" value={formatCurrency(order.tax)} />
                <div className="border-t border-border pt-2 mt-1">
                  <PriceLine label="Total" value={formatCurrency(order.total)} bold />
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="border border-border p-6">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em]">Internal Notes</h2>
              {order.notes && (
                <div className="mb-4 whitespace-pre-line rounded-sm border border-border bg-muted/30 px-4 py-3 text-xs font-light text-muted-foreground">
                  {order.notes}
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={noteValue}
                  onChange={e => setNoteValue(e.target.value)}
                  placeholder="Add a note about this order…"
                  rows={2}
                  className="flex-1 resize-none border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={saving || !noteValue.trim()}
                  className={cn(
                    "shrink-0 self-stretch px-4 text-xs font-medium uppercase tracking-[0.15em] transition-all",
                    saving || !noteValue.trim()
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
                  )}
                >
                  {saving ? <span className="size-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin block" /> : "Save"}
                </button>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Customer */}
            <section className="border border-border p-5">
              <h2 className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Customer</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {order.customer.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{order.customer.name}</p>
                  <p className="text-xs font-light text-muted-foreground">{order.customer.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2 text-xs font-light text-muted-foreground hover:text-gold transition-colors">
                  <Mail className="size-3.5 shrink-0" /> {order.customer.email}
                </a>
                {order.shippingAddress.phone && (
                  <div className="flex items-center gap-2 text-xs font-light text-muted-foreground">
                    <Phone className="size-3.5 shrink-0" /> {order.shippingAddress.phone}
                  </div>
                )}
              </div>
              <Link
                href={`/admin/users`}
                className="mt-4 flex items-center gap-1.5 text-[11px] font-light text-gold hover:underline underline-offset-2"
              >
                View customer profile <ExternalLink className="size-3" />
              </Link>
            </section>

            {/* Shipping address */}
            <section className="border border-border p-5">
              <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Shipping Address</h2>
              <div className="flex items-start gap-2">
                <MapPin className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="text-xs font-light leading-relaxed text-muted-foreground">
                  <p className="font-medium text-foreground">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address}{order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-light text-muted-foreground">
                <Truck className="size-3.5" />
                {order.shippingMethod === "express" ? "Express (2–3 days)" : "Standard (5–7 days)"}
              </div>
            </section>

            {/* Payment */}
            <section className="border border-border p-5">
              <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Payment</h2>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-[#00C3F7]">
                      <span className="text-[9px] font-bold text-white">P</span>
                    </div>
                    <span className="text-xs font-light text-muted-foreground">Paystack</span>
                  </div>
                  <span className={cn("text-xs font-medium", paymentMeta.color)}>{paymentMeta.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-light text-muted-foreground">Method</span>
                  <span className="text-xs font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-light text-muted-foreground">Reference</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground truncate max-w-28">{order.reference}</span>
                    <button
                      type="button"
                      onClick={copyRef}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Copy reference"
                    >
                      {copiedRef ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-light text-muted-foreground">Amount charged</span>
                  <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </section>

            {/* Meta */}
            <section className="border border-border p-5 space-y-2.5">
              <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Order Info</h2>
              <MetaLine label="Placed" value={formatDateTime(order.createdAt)} />
              <MetaLine label="Updated" value={formatDateTime(order.updatedAt)} />
              <MetaLine label="Order ID" value={order.id} mono />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function PriceLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-xs font-light", bold ? "font-medium uppercase tracking-[0.1em]" : "text-muted-foreground")}>{label}</span>
      <span className={cn(bold ? "font-serif text-lg font-medium" : "text-sm font-light")}>{value}</span>
    </div>
  )
}

function MetaLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-[11px] text-right", mono ? "font-mono text-muted-foreground" : "font-light")}>{value}</span>
    </div>
  )
}
