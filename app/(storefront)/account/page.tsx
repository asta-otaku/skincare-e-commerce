"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Heart, Star, ArrowRight, Package } from "lucide-react"
import { useFavorites } from "@/components/favorites-provider"
import { getMyOrders } from "@/lib/supabase/orders"
import { getMyReviews } from "@/lib/supabase/reviews"
import type { Order, OrderStatus } from "@/lib/orders"
import { formatPrice } from "@/lib/products"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<OrderStatus, { label: string; cls: string }> = {
  fulfilled:  { label: "Delivered",  cls: "text-green-700 bg-green-50 border-green-200" },
  shipped:    { label: "Shipped",    cls: "text-purple-700 bg-purple-50 border-purple-200" },
  processing: { label: "Processing", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  pending:    { label: "Pending",    cls: "text-gold-foreground bg-gold/10 border-gold/30" },
  cancelled:  { label: "Cancelled",  cls: "text-muted-foreground bg-muted border-border" },
  refunded:   { label: "Refunded",   cls: "text-destructive bg-destructive/10 border-destructive/20" },
}

export default function AccountPage() {
  const { favorites } = useFavorites()
  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<Awaited<ReturnType<typeof getMyReviews>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyOrders(), getMyReviews()]).then(([orderData, reviewData]) => {
      setOrders(orderData)
      setReviews(reviewData)
      setLoading(false)
    })
  }, [])

  const totalSpent = orders
    .filter(o => o.paymentStatus === "paid")
    .reduce((s, o) => s + o.total, 0)

  const recent = orders.slice(0, 3)
  const reviewCount = reviews.length

  const stats = [
    {
      label: "Total Orders",
      value: loading ? "—" : orders.length,
      href: "/account/orders",
      icon: ShoppingBag,
    },
    {
      label: "Total Spent",
      value: loading ? "—" : formatPrice(totalSpent),
      href: "/account/orders",
      icon: Package,
    },
    {
      label: "Favourites",
      value: favorites.length,
      href: "/account/favorites",
      icon: Heart,
    },
    {
      label: "Reviews",
      value: loading ? "—" : reviewCount,
      href: "/account/reviews",
      icon: Star,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group border border-border p-4 transition-colors hover:border-gold/40"
          >
            <stat.icon className="size-4 text-muted-foreground mb-3 group-hover:text-gold transition-colors" />
            <p className="font-serif text-2xl font-medium">{stat.value}</p>
            <p className="mt-0.5 text-[10px] font-light uppercase tracking-[0.18em] text-muted-foreground">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em]">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {loading ? (
          <div className="h-32 border border-border bg-muted/20 animate-pulse" />
        ) : recent.length === 0 ? (
          <div className="border border-border px-5 py-10 text-center">
            <p className="font-serif text-lg font-medium">No orders yet</p>
            <p className="mt-1 text-sm font-light text-muted-foreground">
              When you check out, your orders will show up here.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.15em] text-gold hover:underline"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border">
            {recent.map(order => {
              const s = STATUS_STYLE[order.status]
              const image = order.items[0]?.image || "/placeholder.svg"
              const date = new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              const itemCount = order.items.reduce((n, i) => n + i.quantity, 0)
              return (
                <Link
                  key={order.reference}
                  href={`/account/orders/${order.reference}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden border border-border bg-muted/40">
                    <Image src={image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-medium">{order.reference}</p>
                    <p className="text-xs font-light text-muted-foreground mt-0.5">
                      {date} · {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        "hidden sm:block border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]",
                        s.cls,
                      )}
                    >
                      {s.label}
                    </span>
                    <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-gold transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {favorites.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em]">Saved Favourites</h2>
            <Link
              href="/account/favorites"
              className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {favorites.slice(0, 4).map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="group shrink-0 w-36">
                <div className="relative aspect-4/5 overflow-hidden border border-border bg-muted/40 group-hover:border-gold/60 transition-colors">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="144px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 text-xs font-medium leading-snug group-hover:text-gold transition-colors">
                  {product.name}
                </p>
                <p className="text-xs font-light text-muted-foreground">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em]">Your Reviews</h2>
          <Link
            href="/account/reviews"
            className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        {reviews.length === 0 ? (
          <div className="border border-border px-5 py-8 text-center">
            <p className="text-sm font-light text-muted-foreground">
              Reviews you write on product pages will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 2).map(r => (
              <div key={r.id} className="flex items-center justify-between border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{r.productName || r.title}</p>
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={cn(
                          "size-3",
                          i <= r.rating ? "fill-gold text-gold" : "fill-muted text-border",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-light text-muted-foreground">
                  {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-border/60 bg-muted/20 p-5">
        <p className="mb-3 text-[11px] font-light uppercase tracking-[0.18em] text-muted-foreground">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Manage account", href: "/account/settings" },
            { label: "Track an order", href: "/account/orders" },
            { label: "Browse the shop", href: "/shop" },
            { label: "Read the journal", href: "/journal" },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-1.5 border border-border px-4 py-2 text-xs font-light uppercase tracking-[0.12em] hover:border-foreground hover:text-foreground transition-colors text-muted-foreground"
            >
              {a.label} <ArrowRight className="size-3" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
