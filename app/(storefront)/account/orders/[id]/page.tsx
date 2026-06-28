"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Package, Truck, CheckCircle2, Clock, ShoppingBag, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/* Reuse the same orders data from the list page */
type OrderStatus = "fulfilled" | "shipped" | "processing" | "pending" | "cancelled"

const ORDERS = [
  {
    id: "ORD-8842", date: "2024-12-14T09:22:00Z", updatedAt: "2024-12-16T14:05:00Z",
    total: 257.76, subtotal: 222, shipping: 18, tax: 17.76,
    status: "fulfilled" as OrderStatus, shippingMethod: "Express (2–3 days)",
    paymentMethod: "Card (via Paystack)",
    trackingNumber: "DHL-GB-8842-01",
    address: { name: "Sophie Laurent", line1: "12 Rue de Rivoli", city: "Paris", state: "Île-de-France", zip: "75001", country: "France" },
    items: [
      { name: "Radiance Renewal Serum", image: "/product-serum.png", category: "Serums", price: 128, qty: 1, productId: "radiance-serum" },
      { name: "Velvet Hydration Cream", image: "/product-cream.png", category: "Moisturizers", price: 94, qty: 1, productId: "velvet-cream" },
    ],
    timeline: [
      { status: "pending",    label: "Order Placed",    date: "Dec 14, 2024 · 9:22 AM",  done: true },
      { status: "processing", label: "Payment Confirmed", date: "Dec 14, 2024 · 9:30 AM", done: true },
      { status: "shipped",    label: "Dispatched",       date: "Dec 15, 2024 · 11:00 AM", done: true },
      { status: "fulfilled",  label: "Delivered",        date: "Dec 16, 2024 · 2:05 PM",  done: true },
    ],
  },
  {
    id: "ORD-8837", date: "2024-12-10T14:20:00Z", updatedAt: "2024-12-12T09:00:00Z",
    total: 216.72, subtotal: 184, shipping: 18, tax: 14.72,
    status: "fulfilled" as OrderStatus, shippingMethod: "Express (2–3 days)",
    paymentMethod: "Bank Transfer (via Paystack)",
    trackingNumber: "DHL-NG-8837-01",
    address: { name: "Sophie Laurent", line1: "12 Rue de Rivoli", city: "Paris", state: "Île-de-France", zip: "75001", country: "France" },
    items: [
      { name: "Radiance Renewal Serum", image: "/product-serum.png", category: "Serums", price: 128, qty: 1, productId: "radiance-serum" },
      { name: "Gentle Resurfacing Cleanser", image: "/product-cleanser.png", category: "Cleansers", price: 56, qty: 1, productId: "gentle-cleanser" },
    ],
    timeline: [
      { status: "pending",    label: "Order Placed",    date: "Dec 10, 2024 · 2:20 PM",  done: true },
      { status: "processing", label: "Payment Confirmed", date: "Dec 10, 2024 · 3:00 PM", done: true },
      { status: "shipped",    label: "Dispatched",       date: "Dec 11, 2024 · 10:00 AM", done: true },
      { status: "fulfilled",  label: "Delivered",        date: "Dec 12, 2024 · 9:00 AM",  done: true },
    ],
  },
  {
    id: "ORD-8798", date: "2024-09-15T10:00:00Z", updatedAt: "2024-09-15T14:22:00Z",
    total: 128.00, subtotal: 128, shipping: 0, tax: 10.24,
    status: "cancelled" as OrderStatus, shippingMethod: "Standard (5–7 days)",
    paymentMethod: "Card (via Paystack)",
    trackingNumber: "",
    address: { name: "Sophie Laurent", line1: "12 Rue de Rivoli", city: "Paris", state: "Île-de-France", zip: "75001", country: "France" },
    items: [
      { name: "Radiance Renewal Serum", image: "/product-serum.png", category: "Serums", price: 128, qty: 1, productId: "radiance-serum" },
    ],
    timeline: [
      { status: "pending",    label: "Order Placed",  date: "Sep 15, 2024 · 10:00 AM", done: true },
      { status: "processing", label: "Payment Confirmed", date: "Sep 15, 2024 · 10:05 AM", done: true },
      { status: "shipped",    label: "Dispatched",    date: "",  done: false },
      { status: "fulfilled",  label: "Delivered",     date: "",  done: false },
    ],
  },
]

const STATUS_STYLE: Record<OrderStatus, { label: string; cls: string }> = {
  fulfilled:  { label: "Delivered",  cls: "text-green-700 bg-green-50 border-green-200" },
  shipped:    { label: "Shipped",    cls: "text-purple-700 bg-purple-50 border-purple-200" },
  processing: { label: "Processing", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  pending:    { label: "Pending",    cls: "text-gold-foreground bg-gold/10 border-gold/30" },
  cancelled:  { label: "Cancelled",  cls: "text-muted-foreground bg-muted border-border" },
}

const STEP_ICONS: Record<string, React.ElementType> = {
  pending: Clock, processing: Package, shipped: Truck, fulfilled: CheckCircle2,
}

export default function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const order = ORDERS.find(o => o.id === id) ?? ORDERS[0]
  const s = STATUS_STYLE[order.status]
  const isCancelled = order.status === "cancelled"

  return (
    <div className="space-y-6">
      {/* Back + heading */}
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="flex items-center gap-1.5 text-xs font-light text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">
          <ArrowLeft className="size-3.5" /> Orders
        </Link>
        <span className="text-border">/</span>
        <span className="font-mono text-xs font-medium">{order.id}</span>
        <span className={cn("border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]", s.cls)}>
          {s.label}
        </span>
      </div>

      {/* Timeline */}
      {!isCancelled ? (
        <section className="border border-border p-6">
          <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em]">Tracking</h2>
          {order.trackingNumber && (
            <p className="mb-5 text-xs font-light text-muted-foreground">
              Tracking number:{" "}
              <span className="font-mono font-medium text-foreground">{order.trackingNumber}</span>
            </p>
          )}
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />
            {order.timeline.map((step, i) => {
              const Icon = STEP_ICONS[step.status] ?? Package
              return (
                <div key={i} className="relative flex items-start gap-4 pb-5 last:pb-0">
                  <div className={cn(
                    "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    step.done
                      ? "border-gold bg-gold text-gold-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="pt-0.5">
                    <p className={cn("text-sm font-medium", !step.done && "text-muted-foreground")}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs font-light text-muted-foreground mt-0.5">{step.date}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="flex items-center gap-3 border border-destructive/30 bg-destructive/5 p-5">
          <XCircle className="size-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Order Cancelled</p>
            <p className="text-xs font-light text-muted-foreground mt-0.5">
              This order was cancelled. If you were charged, a refund will appear in 5–10 business days.
            </p>
          </div>
        </section>
      )}

      {/* Items */}
      <section className="border border-border">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em]">
            Items ({order.items.reduce((s, i) => s + i.qty, 0)})
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-4">
              <Link href={`/product/${item.productId}`} className="relative size-16 shrink-0 overflow-hidden border border-border bg-muted/40 hover:border-gold/60 transition-colors">
                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.productId}`} className="text-sm font-medium hover:text-gold transition-colors">
                  {item.name}
                </Link>
                <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gold mt-0.5">{item.category}</p>
                <p className="text-xs font-light text-muted-foreground mt-0.5">
                  ${item.price} × {item.qty}
                </p>
              </div>
              <p className="text-sm font-medium shrink-0">${(item.price * item.qty).toFixed(2)}</p>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-5 py-4 space-y-1.5">
          {[
            { label: "Subtotal",  val: `$${order.subtotal.toFixed(2)}` },
            { label: "Shipping",  val: order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}` },
            { label: "Tax",       val: `$${order.tax.toFixed(2)}` },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="font-light text-muted-foreground">{row.label}</span>
              <span className="font-light">{row.val}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 mt-1">
            <span className="text-xs font-medium uppercase tracking-[0.12em]">Total</span>
            <span className="font-serif text-lg font-medium">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Shipping address */}
        <section className="border border-border p-5">
          <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Delivered To</h2>
          <div className="flex items-start gap-2">
            <MapPin className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="text-xs font-light leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">{order.address.name}</p>
              <p>{order.address.line1}</p>
              <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
              <p>{order.address.country}</p>
            </div>
          </div>
          <p className="mt-3 text-[10px] font-light text-muted-foreground">
            <Truck className="inline size-3 mr-1" />{order.shippingMethod}
          </p>
        </section>

        {/* Payment */}
        <section className="border border-border p-5">
          <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Payment</h2>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex size-5 items-center justify-center rounded-full bg-[#00C3F7]">
              <span className="text-[9px] font-bold text-white">P</span>
            </div>
            <span className="text-sm font-light">{order.paymentMethod}</span>
          </div>
          <p className="text-[11px] font-light text-green-700 flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> Payment confirmed
          </p>
        </section>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className="flex items-center gap-2 bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground transition-colors">
          <ShoppingBag className="size-3.5" /> Shop Again
        </Link>
        {!isCancelled && (
          <button type="button" className="border border-border px-6 py-3 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors">
            Request Return
          </button>
        )}
      </div>
    </div>
  )
}
