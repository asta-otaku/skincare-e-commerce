"use client"

import Link from "next/link"
import { Gift, Star, ShoppingBag, Zap, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Mock data ─────────────────────────────────────────────── */
const POINTS_BALANCE = 1250
const POINTS_TO_NEXT = 2000
const TIER_LABEL = "Silver"
const TIER_NEXT  = "Gold"

const HISTORY = [
  { id: "1", type: "earn",  label: "Order #HA-2847", points: +150, date: "12 Jun 2026" },
  { id: "2", type: "earn",  label: "Product review — CeraVe Cleanser", points: +50, date: "10 Jun 2026" },
  { id: "3", type: "redeem",label: "Discount redeemed — ₦500 off", points: -500, date: "5 Jun 2026" },
  { id: "4", type: "earn",  label: "Order #HA-2601", points: +200, date: "28 May 2026" },
  { id: "5", type: "earn",  label: "Birthday bonus", points: +100, date: "20 May 2026" },
  { id: "6", type: "earn",  label: "Order #HA-2490", points: +120, date: "14 May 2026" },
]

const REWARDS = [
  { id: "r1", label: "₦500 off your next order", cost: 500,  available: true },
  { id: "r2", label: "₦1,000 off your next order", cost: 1000, available: true },
  { id: "r3", label: "Free delivery (next order)", cost: 250,  available: true },
  { id: "r4", label: "₦2,000 off your next order", cost: 2000, available: false },
  { id: "r5", label: "Exclusive product sample bag", cost: 800, available: true },
  { id: "r6", label: "VIP early access (next drop)", cost: 1500, available: false },
]

const WAYS_TO_EARN = [
  { icon: ShoppingBag, label: "Place an order",        desc: "Earn 1 point per ₦10 spent" },
  { icon: Star,        label: "Write a product review", desc: "+50 points per review" },
  { icon: Gift,        label: "Refer a friend",         desc: "+200 points when they place their first order" },
  { icon: Zap,         label: "Complete your profile",  desc: "+100 points one-time bonus" },
]

export default function RewardsPage() {
  const progress = Math.round((POINTS_BALANCE / POINTS_TO_NEXT) * 100)

  return (
    <div className="space-y-10">

      {/* Balance card */}
      <div className="border border-gold/40 bg-gradient-to-br from-gold/5 via-background to-gold/10 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">HAYDA Rewards</p>
            <p className="mt-1 font-serif text-5xl font-medium tabular-nums">{POINTS_BALANCE.toLocaleString()}</p>
            <p className="mt-1 text-sm font-light text-muted-foreground">points available</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <Gift className="size-3.5" /> {TIER_LABEL} Member
            </span>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-light text-muted-foreground">
            <span>{TIER_LABEL}</span>
            <span>{POINTS_BALANCE.toLocaleString()} / {POINTS_TO_NEXT.toLocaleString()} pts to {TIER_NEXT}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gold transition-all duration-700"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-light text-muted-foreground">
            {(POINTS_TO_NEXT - POINTS_BALANCE).toLocaleString()} more points to reach {TIER_NEXT} status
          </p>
        </div>
      </div>

      {/* Redeem rewards */}
      <div>
        <h2 className="mb-4 font-serif text-xl font-medium">Redeem Points</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REWARDS.map(r => {
            const canRedeem = POINTS_BALANCE >= r.cost && r.available
            return (
              <div
                key={r.id}
                className={cn(
                  "flex flex-col justify-between gap-4 border p-4 transition-all",
                  canRedeem ? "border-border hover:border-gold/60" : "border-border/50 opacity-60",
                )}
              >
                <div>
                  <p className="text-sm font-medium leading-snug">{r.label}</p>
                  <p className="mt-1 text-xs font-light text-muted-foreground">{r.cost.toLocaleString()} points</p>
                </div>
                <button
                  type="button"
                  disabled={!canRedeem}
                  className={cn(
                    "flex items-center justify-center gap-1.5 border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-all",
                    canRedeem
                      ? "border-foreground text-foreground hover:bg-foreground hover:text-background"
                      : "cursor-not-allowed border-border text-muted-foreground",
                  )}
                >
                  {canRedeem ? "Redeem" : "Not enough points"}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Ways to earn */}
      <div>
        <h2 className="mb-4 font-serif text-xl font-medium">Ways to Earn Points</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {WAYS_TO_EARN.map(w => (
            <div key={w.label} className="flex items-start gap-4 border border-border p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                <w.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{w.label}</p>
                <p className="mt-0.5 text-xs font-light text-muted-foreground">{w.desc}</p>
              </div>
              <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="mb-4 font-serif text-xl font-medium">Points History</h2>
        <div className="divide-y divide-border border border-border">
          {HISTORY.map(h => (
            <div key={h.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium">{h.label}</p>
                <p className="mt-0.5 text-xs font-light text-muted-foreground">{h.date}</p>
              </div>
              <span className={cn(
                "font-medium tabular-nums text-sm",
                h.points > 0 ? "text-green-600" : "text-red-600",
              )}>
                {h.points > 0 ? `+${h.points}` : h.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border border-border p-6 text-center">
        <p className="font-serif text-xl font-medium">Start earning faster</p>
        <p className="mt-2 text-sm font-light text-muted-foreground max-w-sm mx-auto">
          Shop new arrivals or leave a review on a recent purchase to boost your points balance.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="border border-foreground px-7 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-all hover:bg-foreground hover:text-background"
          >
            Shop Now
          </Link>
          <Link
            href="/account/reviews"
            className="border border-border px-7 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          >
            Write a Review
          </Link>
        </div>
      </div>
    </div>
  )
}
