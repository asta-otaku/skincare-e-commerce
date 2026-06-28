"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Heart, Star, Settings, ArrowRight, Package, Check } from "lucide-react"
import { useFavorites } from "@/components/favorites-provider"
import { formatPrice } from "@/lib/products"
import { cn } from "@/lib/utils"

/* Mock data for the demo customer */
const CUSTOMER_ORDERS = [
  { id: "ORD-8842", date: "Dec 14, 2024", total: 257.76, status: "fulfilled" as const, items: 2, image: "/product-serum.png" },
  { id: "ORD-8837", date: "Dec 10, 2024", total: 216.72, status: "fulfilled" as const, items: 2, image: "/product-cleanser.png" },
  { id: "ORD-8830", date: "Nov 22, 2024", total: 128.00, status: "fulfilled" as const, items: 1, image: "/product-oil.png" },
  { id: "ORD-8821", date: "Oct 30, 2024", total: 94.00,  status: "fulfilled" as const, items: 1, image: "/product-cream.png" },
  { id: "ORD-8810", date: "Oct 08, 2024", total: 184.96, status: "fulfilled" as const, items: 2, image: "/product-eye.png" },
]

const STATUS_STYLE = {
  fulfilled:  { label: "Delivered",  cls: "text-green-700 bg-green-50 border-green-200" },
  shipped:    { label: "Shipped",    cls: "text-purple-700 bg-purple-50 border-purple-200" },
  processing: { label: "Processing", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  pending:    { label: "Pending",    cls: "text-gold-foreground bg-gold/10 border-gold/30" },
  cancelled:  { label: "Cancelled",  cls: "text-muted-foreground bg-muted border-border" },
}

const MOCK_REVIEWS = [
  { id: "r1", product: "Radiance Renewal Serum", rating: 5, date: "Nov 20, 2024" },
  { id: "r2", product: "Gold Infusion Face Oil",  rating: 5, date: "Oct 15, 2024" },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={cn("size-3", i <= rating ? "fill-gold text-gold" : "fill-muted text-border")} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function AccountPage() {
  const { favorites } = useFavorites()
  const totalSpent = CUSTOMER_ORDERS.reduce((s, o) => s + o.total, 0)

  const stats = [
    { label: "Total Orders",   value: CUSTOMER_ORDERS.length, href: "/account/orders",    icon: ShoppingBag },
    { label: "Total Spent",    value: `$${totalSpent.toFixed(0)}`, href: "/account/orders", icon: Package },
    { label: "Favourites",     value: favorites.length,        href: "/account/favorites", icon: Heart },
    { label: "Reviews",        value: MOCK_REVIEWS.length,     href: "/account/reviews",   icon: Star },
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="group border border-border p-4 transition-colors hover:border-gold/40">
            <stat.icon className="size-4 text-muted-foreground mb-3 group-hover:text-gold transition-colors" />
            <p className="font-serif text-2xl font-medium">{stat.value}</p>
            <p className="mt-0.5 text-[10px] font-light uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em]">Recent Orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="divide-y divide-border border border-border">
          {CUSTOMER_ORDERS.slice(0, 3).map(order => {
            const s = STATUS_STYLE[order.status]
            return (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                <div className="relative size-12 shrink-0 overflow-hidden border border-border bg-muted/40">
                  <Image src={order.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-medium">{order.id}</p>
                  <p className="text-xs font-light text-muted-foreground mt-0.5">{order.date} · {order.items} item{order.items !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn("hidden sm:block border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]", s.cls)}>
                    {s.label}
                  </span>
                  <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-gold transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Favorites preview */}
      {favorites.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em]">Saved Favourites</h2>
            <Link href="/account/favorites" className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {favorites.slice(0, 4).map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="group shrink-0 w-36">
                <div className="relative aspect-4/5 overflow-hidden border border-border bg-muted/40 group-hover:border-gold/60 transition-colors">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill sizes="144px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-2 text-xs font-medium leading-snug group-hover:text-gold transition-colors">{product.name}</p>
                <p className="text-xs font-light text-muted-foreground">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent reviews */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em]">Your Reviews</h2>
          <Link href="/account/reviews" className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_REVIEWS.map(r => (
            <div key={r.id} className="flex items-center justify-between border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">{r.product}</p>
                <StarRow rating={r.rating} />
              </div>
              <p className="text-xs font-light text-muted-foreground">{r.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="border border-border/60 bg-muted/20 p-5">
        <p className="mb-3 text-[11px] font-light uppercase tracking-[0.18em] text-muted-foreground">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Manage account", href: "/account/settings" },
            { label: "Track an order", href: "/account/orders" },
            { label: "Browse the shop", href: "/shop" },
            { label: "Read the journal", href: "/journal" },
          ].map(a => (
            <Link key={a.href} href={a.href} className="flex items-center gap-1.5 border border-border px-4 py-2 text-xs font-light uppercase tracking-[0.12em] hover:border-foreground hover:text-foreground transition-colors text-muted-foreground">
              {a.label} <ArrowRight className="size-3" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
