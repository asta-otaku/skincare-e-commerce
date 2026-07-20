"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, MapPin, Mail, Phone, Package, CreditCard,
  Truck, Clock, CheckCircle2, ChevronDown, Copy, Check,
} from "lucide-react"
import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/orders"
import { getOrderByReference, updateOrderStatus } from "@/lib/supabase/orders"
import { cn } from "@/lib/utils"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n)
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const STATUS_TIMELINE: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "pending",    label: "Order placed", icon: Clock },
  { status: "processing", label: "Processing",   icon: Package },
  { status: "shipped",    label: "Shipped",      icon: Truck },
  { status: "fulfilled",  label: "Delivered",    icon: CheckCircle2 },
]

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusOpen, setStatusOpen] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)

  useEffect(() => {
    getOrderByReference(id).then(o => {
      setOrder(o)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="h-8 w-48 bg-muted/50 animate-pulse mb-6" />
        <div className="h-64 w-full bg-muted/30 animate-pulse" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <p className="font-serif text-2xl font-medium">Order not found</p>
        <Link href="/admin/orders" className="text-xs uppercase tracking-[0.15em] text-gold hover:underline">
          Back to orders
        </Link>
      </div>
    )
  }

  const statusMeta = ORDER_STATUS_META[order.status]
  const paymentMeta = PAYMENT_STATUS_META[order.paymentStatus]
  const isCancelled = order.status === "cancelled" || order.status === "refunded"
  const progressStatuses: OrderStatus[] = ["pending", "processing", "shipped", "fulfilled"]
  const progressIdx = isCancelled ? -1 : progressStatuses.indexOf(order.status)

  async function updateStatus(status: OrderStatus) {
    setOrder(prev => prev ? { ...prev, status, updatedAt: new Date().toISOString() } : prev)
    setStatusOpen(false)
    await updateOrderStatus(order!.id, status)
  }

  function copyRef() {
    navigator.clipboard.writeText(order!.reference)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 1800)
  }

  return (
    <div className="flex-1 overflow-auto" onClick={() => setStatusOpen(false)}>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="flex size-8 items-center justify-center border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-medium font-mono">{order.id}</h1>
            <p className="text-xs font-light text-muted-foreground">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setStatusOpen(v => !v)}
            className={cn(
              "flex items-center gap-2 border px-4 py-2 text-xs font-medium uppercase tracking-[0.12em]",
              statusMeta.border, statusMeta.bg, statusMeta.color,
            )}
          >
            {statusMeta.label} <ChevronDown className="size-3.5" />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-44 border border-border bg-background shadow-lg">
              {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(s)}
                  className="block w-full px-4 py-2.5 text-left text-xs font-light capitalize hover:bg-muted/40"
                >
                  {ORDER_STATUS_META[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-8 lg:px-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="border border-border p-6">
            <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.15em]">Status</h2>
            <div className="flex justify-between gap-2">
              {STATUS_TIMELINE.map((step, i) => {
                const done = progressIdx >= i
                const Icon = step.icon
                return (
                  <div key={step.status} className="flex flex-1 flex-col items-center gap-2 text-center">
                    <div className={cn(
                      "flex size-9 items-center justify-center rounded-full border",
                      done ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground",
                    )}>
                      <Icon className="size-4" />
                    </div>
                    <p className={cn("text-[10px] uppercase tracking-[0.12em]", done ? "text-foreground" : "text-muted-foreground")}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Items */}
          <div className="border border-border">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.15em]">Items</h2>
            </div>
            <ul className="divide-y divide-border">
              {order.items.map(item => (
                <li key={item.productId + item.name} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative size-14 shrink-0 overflow-hidden border border-border bg-muted/40">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs font-light text-muted-foreground">{item.category} · Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-6 py-4 space-y-1.5">
              <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
              <Row label="Shipping" value={order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost)} />
              <Row label="Tax" value={formatCurrency(order.tax)} />
              <Row label="Total" value={formatCurrency(order.total)} bold />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="border border-border p-5 space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.15em]">Customer</h2>
            <p className="text-sm font-medium">{order.customer.name}</p>
            <p className="flex items-center gap-2 text-xs font-light text-muted-foreground">
              <Mail className="size-3.5" /> {order.customer.email}
            </p>
            {order.shippingAddress.phone && (
              <p className="flex items-center gap-2 text-xs font-light text-muted-foreground">
                <Phone className="size-3.5" /> {order.shippingAddress.phone}
              </p>
            )}
          </div>

          <div className="border border-border p-5 space-y-2">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.15em] flex items-center gap-2">
              <MapPin className="size-3.5" /> Shipping
            </h2>
            <p className="text-sm font-light">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="text-xs font-light text-muted-foreground leading-relaxed">
              {order.shippingAddress.address}
              {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              <br />
              {order.shippingAddress.country}
            </p>
            <p className="text-xs font-light text-muted-foreground pt-1 capitalize">
              {order.shippingMethod} shipping
            </p>
          </div>

          <div className="border border-border p-5 space-y-2">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.15em] flex items-center gap-2">
              <CreditCard className="size-3.5" /> Payment
            </h2>
            <p className={cn("text-sm font-medium", paymentMeta.color)}>{paymentMeta.label}</p>
            <p className="text-xs font-light text-muted-foreground">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <button
              type="button"
              onClick={copyRef}
              className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground"
            >
              {copiedRef ? <Check className="size-3" /> : <Copy className="size-3" />}
              {order.reference}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="font-light text-muted-foreground">{label}</span>
      <span className={bold ? "font-medium" : "font-light"}>{value}</span>
    </div>
  )
}
