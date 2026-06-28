"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Package, ArrowRight, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

type OrderStatus = "fulfilled" | "shipped" | "processing" | "pending" | "cancelled"

type CustomerOrder = {
  id: string
  date: string
  total: number
  status: OrderStatus
  items: { name: string; image: string; price: number; qty: number }[]
  shippingMethod: string
}

const ORDERS: CustomerOrder[] = [
  {
    id: "ORD-8842", date: "2024-12-14", total: 257.76, status: "fulfilled",
    shippingMethod: "Express",
    items: [
      { name: "Radiance Renewal Serum", image: "/product-serum.png", price: 128, qty: 1 },
      { name: "Velvet Hydration Cream", image: "/product-cream.png", price: 94,  qty: 1 },
    ],
  },
  {
    id: "ORD-8837", date: "2024-12-10", total: 216.72, status: "fulfilled",
    shippingMethod: "Express",
    items: [
      { name: "Radiance Renewal Serum",    image: "/product-serum.png",    price: 128, qty: 1 },
      { name: "Gentle Resurfacing Cleanser", image: "/product-cleanser.png", price: 56,  qty: 1 },
    ],
  },
  {
    id: "ORD-8830", date: "2024-11-22", total: 128.00, status: "fulfilled",
    shippingMethod: "Standard",
    items: [{ name: "Gold Infusion Face Oil", image: "/product-oil.png", price: 156, qty: 1 }],
  },
  {
    id: "ORD-8821", date: "2024-10-30", total: 94.00, status: "fulfilled",
    shippingMethod: "Standard",
    items: [{ name: "Velvet Hydration Cream", image: "/product-cream.png", price: 94, qty: 1 }],
  },
  {
    id: "ORD-8810", date: "2024-10-08", total: 184.96, status: "fulfilled",
    shippingMethod: "Express",
    items: [
      { name: "Illuminating Eye Concentrate", image: "/product-eye.png",     price: 112, qty: 1 },
      { name: "Lavender Calm Toner",           image: "/product-toner.png",   price: 68,  qty: 1 },
    ],
  },
  {
    id: "ORD-8798", date: "2024-09-15", total: 128.00, status: "cancelled",
    shippingMethod: "Standard",
    items: [{ name: "Radiance Renewal Serum", image: "/product-serum.png", price: 128, qty: 1 }],
  },
]

const STATUS_STYLE: Record<OrderStatus, { label: string; cls: string }> = {
  fulfilled:  { label: "Delivered",  cls: "text-green-700 bg-green-50 border-green-200" },
  shipped:    { label: "Shipped",    cls: "text-purple-700 bg-purple-50 border-purple-200" },
  processing: { label: "Processing", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  pending:    { label: "Pending",    cls: "text-gold-foreground bg-gold/10 border-gold/30" },
  cancelled:  { label: "Cancelled",  cls: "text-muted-foreground bg-muted border-border" },
}

export default function AccountOrdersPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | OrderStatus>("all")

  const filtered = ORDERS.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !search || o.id.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q))
    const matchFilter = filter === "all" || o.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-medium">Order History</h2>
        <p className="mt-1 text-sm font-light text-muted-foreground">{ORDERS.length} orders placed</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search orders or products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm font-light outline-none focus:border-foreground transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {(["all", "fulfilled", "shipped", "processing", "pending", "cancelled"] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "shrink-0 border px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.1em] transition-all capitalize",
                filter === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : STATUS_STYLE[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
          <ShoppingBag className="size-10 text-muted-foreground mb-3" />
          <p className="font-serif text-lg font-medium">No orders found</p>
          <p className="mt-1 text-sm font-light text-muted-foreground">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const s = STATUS_STYLE[order.status]
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group block border border-border hover:border-gold/40 transition-colors"
              >
                {/* Order header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-4">
                    <p className="font-mono text-xs font-medium">{order.id}</p>
                    <span className={cn("border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]", s.cls)}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-light text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-gold transition-colors" />
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="relative size-10 overflow-hidden border border-background bg-muted/40 ring-1 ring-background">
                        <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-light text-muted-foreground truncate">
                      {order.items.map(i => i.name).join(", ")}
                    </p>
                    <p className="text-[10px] font-light text-muted-foreground mt-0.5">
                      {order.items.reduce((s, i) => s + i.qty, 0)} item{order.items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}
                      {" · "}{order.shippingMethod} Shipping
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
