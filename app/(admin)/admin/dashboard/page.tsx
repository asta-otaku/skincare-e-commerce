"use client"

import { useEffect, useState } from "react"
import {
  AreaChart, Area, BarChart, Bar, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Package, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  formatPrice,
  formatTrend,
  getDashboardStats,
  type DashboardStats,
} from "@/lib/supabase/admin-dashboard"

const STATUS_STYLES: Record<string, string> = {
  fulfilled: "bg-green-50 text-green-700 border-green-200",
  processing: "bg-gold/10 text-gold-foreground border-gold/30",
  shipped: "bg-lavender text-lavender-foreground border-lavender",
  pending: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-destructive/10 text-destructive border-destructive/20",
}

function StatCard({
  label, value, subvalue, icon: Icon, trend, trendUp,
}: {
  label: string
  value: string
  subvalue: string
  icon: React.ElementType
  trend: string
  trendUp: boolean
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-light uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-2 font-serif text-3xl font-medium">{value}</p>
          <p className="mt-1 text-xs font-light text-muted-foreground">{subvalue}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        {trendUp ? (
          <TrendingUp className="size-3.5 text-green-600" />
        ) : (
          <TrendingDown className="size-3.5 text-destructive" />
        )}
        <span className={cn("text-[11px] font-medium", trendUp ? "text-green-600" : "text-destructive")}>
          {trend}
        </span>
        <span className="text-[11px] font-light text-muted-foreground">vs prior 30 days</span>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border bg-background px-4 py-3 shadow-md text-xs">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-light text-muted-foreground">
          <span className="font-medium text-foreground">{entry.name}:</span>{" "}
          {typeof entry.value === "number" && entry.name.toLowerCase().includes("revenue")
            ? formatPrice(entry.value)
            : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  const revenueTrend = formatTrend(stats?.revenue30d ?? 0, stats?.revenuePrev30d ?? 0)
  const aovTrend = formatTrend(stats?.avgOrderValue ?? 0, stats?.aovPrev ?? 0)
  const year = new Date().getFullYear()

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div>
          <h1 className="font-serif text-2xl font-medium">Dashboard</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">
            Live storefront metrics from Supabase.
          </p>
        </div>
        {stats && stats.pendingOrders > 0 && (
          <Link
            href="/admin/orders"
            className="border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-medium text-gold-foreground hover:bg-gold/20 transition-colors"
          >
            {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? "s" : ""}
          </Link>
        )}
      </div>

      <div className="px-6 py-6 lg:px-8 lg:py-8 space-y-8">
        {loading || !stats ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 border border-border bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Revenue (30d)"
                value={formatPrice(stats.revenue30d)}
                subvalue={`${stats.paidOrders30d} paid order${stats.paidOrders30d !== 1 ? "s" : ""}`}
                icon={DollarSign}
                trend={revenueTrend.label}
                trendUp={revenueTrend.up}
              />
              <StatCard
                label="Customers"
                value={stats.customerCount.toLocaleString()}
                subvalue={`${stats.customersThisMonth} new this month`}
                icon={Users}
                trend={`${stats.customersThisMonth >= 0 ? "+" : ""}${stats.customersThisMonth}`}
                trendUp
              />
              <StatCard
                label="Products Listed"
                value={String(stats.productCount)}
                subvalue={`${stats.inStockCount} in stock`}
                icon={Package}
                trend={`${stats.pendingOrders} pending orders`}
                trendUp={stats.pendingOrders === 0}
              />
              <StatCard
                label="Avg. Order Value"
                value={formatPrice(stats.avgOrderValue)}
                subvalue="Paid orders · last 30 days"
                icon={ShoppingBag}
                trend={aovTrend.label}
                trendUp={aovTrend.up}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 border border-border bg-card p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-medium">Revenue Overview</h2>
                    <p className="text-xs font-light text-muted-foreground mt-0.5">
                      Monthly paid revenue & orders — {year}
                    </p>
                  </div>
                  <span className={cn(
                    "flex items-center gap-1 text-[11px] font-medium",
                    revenueTrend.up ? "text-green-600" : "text-destructive",
                  )}>
                    {revenueTrend.up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                    {revenueTrend.label} (30d)
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={stats.monthly} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                      width={48}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-gold)" strokeWidth={2} fill="url(#revenueGrad)" />
                    <Line type="monotone" dataKey="orders" name="Orders" stroke="var(--color-foreground)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-border bg-card p-6">
                <h2 className="mb-1 text-sm font-medium">Sales by Category</h2>
                <p className="mb-4 text-xs font-light text-muted-foreground">% of paid order value ({year})</p>
                {stats.categoryShare.length === 0 ? (
                  <p className="text-sm font-light text-muted-foreground py-16 text-center">No paid sales yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={stats.categoryShare}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {stats.categoryShare.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5">
                      {stats.categoryShare.slice(0, 4).map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                            <span className="font-light text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3 border border-border bg-card p-6">
                <div className="mb-5">
                  <h2 className="text-sm font-medium">Orders this week</h2>
                  <p className="text-xs font-light text-muted-foreground mt-0.5">Paid orders & revenue by weekday</p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.ordersByWeekday} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 12 }} />
                    <Bar dataKey="orders" name="Orders" fill="var(--color-muted)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="revenue" name="Revenue" fill="var(--color-gold)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-2 border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-sm font-medium">Top Products</h2>
                  <Link href="/admin/products" className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2">
                    View all <ArrowUpRight className="size-3" />
                  </Link>
                </div>
                {stats.topProducts.length === 0 ? (
                  <p className="text-sm font-light text-muted-foreground py-8 text-center">No sales data yet</p>
                ) : (
                  <ul className="space-y-3">
                    {stats.topProducts.map((product, i) => (
                      <li key={product.name} className="flex items-center gap-3">
                        <span className="w-4 text-[11px] font-light text-muted-foreground shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-[10px] font-light text-muted-foreground">{product.sales} sold</p>
                        </div>
                        <p className="text-xs font-medium shrink-0">{formatPrice(product.revenue)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-sm font-medium">Recent Orders</h2>
                  <p className="text-xs font-light text-muted-foreground mt-0.5">Latest transactions across the store</p>
                </div>
                <Link href="/admin/orders" className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2">
                  View all <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">Order</th>
                      <th className="px-6 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">Customer</th>
                      <th className="px-6 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground hidden sm:table-cell">Product</th>
                      <th className="px-6 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">Amount</th>
                      <th className="px-6 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground font-light">
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      stats.recentOrders.map((order) => (
                        <tr key={order.reference} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-muted-foreground">
                            <Link href={`/admin/orders/${order.reference}`} className="hover:text-foreground">
                              {order.reference}
                            </Link>
                          </td>
                          <td className="px-6 py-4 font-medium">{order.customer.name}</td>
                          <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell truncate max-w-[180px]">
                            {order.items[0]?.name ?? "—"}
                            {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                          </td>
                          <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]",
                              STATUS_STYLES[order.status] ?? STATUS_STYLES.pending,
                            )}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
