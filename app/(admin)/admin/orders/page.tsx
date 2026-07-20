"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search, SlidersHorizontal, TrendingUp, ShoppingBag,
  Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowUpDown,
  ChevronDown, Download, RefreshCw,
} from "lucide-react"
import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/orders"
import { getAllOrders, updateOrderStatus } from "@/lib/supabase/orders"
import { cn } from "@/lib/utils"

const STATUSES: { value: "all" | OrderStatus; label: string }[] = [
  { value: "all",        label: "All Orders" },
  { value: "pending",    label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped" },
  { value: "fulfilled",  label: "Fulfilled" },
  { value: "cancelled",  label: "Cancelled" },
  { value: "refunded",   label: "Refunded" },
]

type SortKey = "date_desc" | "date_asc" | "total_desc" | "total_asc"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string, short = false) {
  return new Date(iso).toLocaleDateString("en-US", short
    ? { month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all")
  const [sortKey, setSortKey] = useState<SortKey>("date_desc")
  const [showSort, setShowSort] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getAllOrders()
    setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const totalRevenue = orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0)
  const pending   = orders.filter(o => o.status === "pending").length
  const shipped   = orders.filter(o => o.status === "shipped").length
  const fulfilled = orders.filter(o => o.status === "fulfilled").length

  const filtered = useMemo(() => {
    let pool = orders.filter(o => {
      const q = search.toLowerCase()
      const matchSearch = !search ||
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.reference.toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || o.status === statusFilter
      return matchSearch && matchStatus
    })

    return pool.sort((a, b) => {
      switch (sortKey) {
        case "date_asc":   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "total_desc": return b.total - a.total
        case "total_asc":  return a.total - b.total
        default:           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [orders, search, statusFilter, sortKey])

  async function updateStatus(id: string, status: OrderStatus) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    const err = await updateOrderStatus(id, status)
    if (err) console.error("Status update failed:", err)
  }

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "date_desc",  label: "Newest first" },
    { value: "date_asc",   label: "Oldest first" },
    { value: "total_desc", label: "Highest value" },
    { value: "total_asc",  label: "Lowest value" },
  ]

  return (
    <div className="flex-1 overflow-auto" onClick={() => setShowSort(false)}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div>
          <h1 className="font-serif text-2xl font-medium">Orders</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${orders.length} total orders · ${formatCurrency(totalRevenue)} revenue`}
          </p>
        </div>
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Refresh"
          className="flex size-9 items-center justify-center border border-border text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-40"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        </button>
        <button className="hidden sm:flex items-center gap-2 border border-border px-4 py-2 text-xs font-light uppercase tracking-[0.15em] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
          <Download className="size-3.5" /> Export CSV
        </button>
        </div>
      </div>

      <div className="px-6 py-6 lg:px-8 lg:py-8 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} sub={`${orders.length} orders`} icon={TrendingUp} highlight />
          <KpiCard label="Pending" value={String(pending)} sub="Awaiting processing" icon={Clock} />
          <KpiCard label="Shipped" value={String(shipped)} sub="En route to customer" icon={ShoppingBag} />
          <KpiCard label="Fulfilled" value={String(fulfilled)} sub="Successfully delivered" icon={CheckCircle2} />
        </div>

        {/* Filters row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Order ID, customer, reference…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm font-light outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowSort(v => !v)}
              className="flex items-center gap-2 border border-border px-3 py-2.5 text-xs font-light text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown className="size-3.5" />
              {SORT_OPTIONS.find(s => s.value === sortKey)?.label}
              <ChevronDown className="size-3.5" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-11 z-30 min-w-44 border border-border bg-background shadow-md">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSortKey(opt.value); setShowSort(false) }}
                    className={cn(
                      "flex w-full items-center px-4 py-2.5 text-xs font-light transition-colors hover:bg-muted",
                      sortKey === opt.value ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {STATUSES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "shrink-0 border px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.12em] transition-all",
                statusFilter === s.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {s.label}
              {s.value !== "all" && (
                <span className="ml-1.5 opacity-60">
                  {orders.filter(o => o.status === s.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-20 text-center">
            <XCircle className="size-10 text-muted-foreground mb-3" />
            <p className="font-serif text-lg font-medium">No orders found</p>
            <p className="mt-1 text-sm font-light text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="border border-border">
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(order => (
                    <OrderRow key={order.id} order={order} onStatusChange={updateStatus} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-border lg:hidden">
              {filtered.map(order => (
                <MobileOrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[11px] font-light text-muted-foreground">
          Showing {filtered.length} of {orders.length} orders
        </p>
      </div>
    </div>
  )
}

/* ─── Desktop Row ──────────────────────────────────────────── */
function OrderRow({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, s: OrderStatus) => void }) {
  const [open, setOpen] = useState(false)
  const meta = ORDER_STATUS_META[order.status]
  const pmeta = PAYMENT_STATUS_META[order.paymentStatus]

  return (
    <tr className="hover:bg-muted/20 transition-colors group">
      <td className="px-5 py-4">
        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-medium text-foreground hover:text-gold transition-colors">
          {order.id}
        </Link>
        <p className="text-[10px] font-light text-muted-foreground mt-0.5">
          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
            {order.customer.initials}
          </div>
          <div>
            <p className="text-sm font-medium">{order.customer.name}</p>
            <p className="text-[10px] font-light text-muted-foreground">{order.customer.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex -space-x-2">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="relative size-8 overflow-hidden border border-background bg-muted/40 ring-1 ring-background">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="32px" className="object-cover" />
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="flex size-8 items-center justify-center border border-background bg-muted ring-1 ring-background text-[9px] font-medium">
              +{order.items.length - 3}
            </div>
          )}
        </div>
        <p className="mt-1 text-[10px] font-light text-muted-foreground">
          {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
        <p className={cn("text-[10px] font-medium mt-0.5", pmeta.color)}>{pmeta.label}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-xs font-light text-muted-foreground">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
        <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5 truncate max-w-24">{order.reference}</p>
      </td>
      <td className="px-5 py-4">
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className={cn(
              "flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors hover:opacity-80",
              meta.bg, meta.color, meta.border,
            )}
          >
            {meta.label}
            <ChevronDown className="size-3" />
          </button>
          {open && (
            <div className="absolute left-0 top-8 z-30 min-w-40 border border-border bg-background shadow-md">
              {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { onStatusChange(order.id, s); setOpen(false) }}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2 text-xs transition-colors hover:bg-muted",
                    order.status === s ? "font-medium" : "font-light text-muted-foreground",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full shrink-0", ORDER_STATUS_META[s].bg.replace("bg-", "bg-").replace("/10", ""), ORDER_STATUS_META[s].color)} />
                  {ORDER_STATUS_META[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-xs font-light text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt, true)}</p>
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-light text-muted-foreground hover:text-gold transition-colors"
        >
          View <ArrowUpRight className="size-3" />
        </Link>
      </td>
    </tr>
  )
}

/* ─── Mobile card ──────────────────────────────────────────── */
function MobileOrderCard({ order }: { order: Order }) {
  const meta = ORDER_STATUS_META[order.status]
  return (
    <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {order.customer.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs font-medium">{order.id}</p>
          <span className={cn("border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em]", meta.bg, meta.color, meta.border)}>
            {meta.label}
          </span>
        </div>
        <p className="text-xs font-light text-muted-foreground truncate">{order.customer.name}</p>
        <p className="text-[10px] font-light text-muted-foreground">{formatDate(order.createdAt, true)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
        <p className="text-[10px] font-light text-muted-foreground">
          {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  )
}

/* ─── KPI card ─────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, highlight }: {
  label: string; value: string; sub: string; icon: React.ElementType; highlight?: boolean
}) {
  return (
    <div className={cn("border p-5", highlight ? "border-gold/40 bg-gold/5" : "border-border bg-card")}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-light uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <Icon className={cn("size-4", highlight ? "text-gold" : "text-muted-foreground")} />
      </div>
      <p className={cn("font-serif font-medium", value.startsWith("$") ? "text-2xl" : "text-3xl")}>{value}</p>
      <p className="mt-1 text-[10px] font-light text-muted-foreground">{sub}</p>
    </div>
  )
}
