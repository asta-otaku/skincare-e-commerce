"use client"

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Package, Bell, Search, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

/* ─── Mock data ─────────────────────────────────────────────── */
const revenueData = [
  { month: "Jan", revenue: 18400, orders: 124 },
  { month: "Feb", revenue: 21200, orders: 143 },
  { month: "Mar", revenue: 19800, orders: 134 },
  { month: "Apr", revenue: 24600, orders: 167 },
  { month: "May", revenue: 28900, orders: 196 },
  { month: "Jun", revenue: 31200, orders: 211 },
  { month: "Jul", revenue: 27800, orders: 188 },
  { month: "Aug", revenue: 33500, orders: 227 },
  { month: "Sep", revenue: 36100, orders: 244 },
  { month: "Oct", revenue: 38700, orders: 262 },
  { month: "Nov", revenue: 42300, orders: 286 },
  { month: "Dec", revenue: 51200, orders: 346 },
]

const categoryData = [
  { name: "Serums", value: 34, color: "var(--color-gold)" },
  { name: "Oils", value: 22, color: "oklch(0.439 0 0)" },
  { name: "Moisturizers", value: 19, color: "var(--color-lavender)" },
  { name: "Toners", value: 12, color: "oklch(0.371 0 0)" },
  { name: "Eye Care", value: 8, color: "oklch(0.269 0 0)" },
  { name: "Cleansers", value: 5, color: "oklch(0.92 0 0)" },
]

const topProducts = [
  { name: "Radiance Renewal Serum", sales: 286, revenue: 36608 },
  { name: "Gold Infusion Face Oil", sales: 198, revenue: 30888 },
  { name: "Velvet Hydration Cream", sales: 244, revenue: 22936 },
  { name: "Illuminating Eye Concentrate", sales: 167, revenue: 18704 },
  { name: "Lavender Calm Toner", sales: 143, revenue: 9724 },
]

const weeklyTraffic = [
  { day: "Mon", sessions: 1240, conversions: 48 },
  { day: "Tue", sessions: 1480, conversions: 62 },
  { day: "Wed", sessions: 1320, conversions: 54 },
  { day: "Thu", sessions: 1680, conversions: 71 },
  { day: "Fri", sessions: 1920, conversions: 84 },
  { day: "Sat", sessions: 2340, conversions: 103 },
  { day: "Sun", sessions: 2180, conversions: 94 },
]

const recentOrders = [
  { id: "ORD-8842", customer: "Sophie Laurent", product: "Radiance Serum", amount: 128, status: "fulfilled" },
  { id: "ORD-8841", customer: "Mia Chen", product: "Gold Face Oil", amount: 156, status: "processing" },
  { id: "ORD-8840", customer: "Emma Williams", product: "Velvet Cream × 2", amount: 188, status: "fulfilled" },
  { id: "ORD-8839", customer: "Isabelle Dupont", product: "Eye Concentrate", amount: 112, status: "shipped" },
  { id: "ORD-8838", customer: "Olivia Park", product: "Lavender Toner", amount: 68, status: "processing" },
]

const STATUS_STYLES: Record<string, string> = {
  fulfilled: "bg-green-50 text-green-700 border-green-200",
  processing: "bg-gold/10 text-gold-foreground border-gold/30",
  shipped: "bg-lavender text-lavender-foreground border-lavender",
}

/* ─── Stat card ─────────────────────────────────────────────── */
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
        <span className="text-[11px] font-light text-muted-foreground">vs last month</span>
      </div>
    </div>
  )
}

/* ─── Custom tooltip ────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border bg-background px-4 py-3 shadow-md text-xs">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-light text-muted-foreground">
          <span className="font-medium text-foreground">{entry.name}:</span>{" "}
          {typeof entry.value === "number" && entry.name.toLowerCase().includes("revenue")
            ? `$${entry.value.toLocaleString()}`
            : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const ytdRevenue = revenueData.reduce((s, d) => s + d.revenue, 0)
  const ytdOrders = revenueData.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="flex-1 overflow-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div>
          <h1 className="font-serif text-2xl font-medium">Dashboard</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">Welcome back — here&apos;s how Aurelia is performing.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 border border-border px-4 py-2 text-xs font-light text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
            <Search className="size-3.5" /> Search
          </button>
          <button className="relative text-foreground/70 hover:text-foreground">
            <Bell className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-gold" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 lg:px-8 lg:py-8 space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Annual Revenue"
            value={`$${(ytdRevenue / 1000).toFixed(0)}k`}
            subvalue={`${ytdOrders.toLocaleString()} total orders`}
            icon={DollarSign}
            trend="+18.4%"
            trendUp
          />
          <StatCard
            label="Active Customers"
            value="4,821"
            subvalue="386 new this month"
            icon={Users}
            trend="+12.1%"
            trendUp
          />
          <StatCard
            label="Products Listed"
            value="6"
            subvalue="All in stock"
            icon={Package}
            trend="+2 this quarter"
            trendUp
          />
          <StatCard
            label="Avg. Order Value"
            value="$114"
            subvalue="Across all channels"
            icon={ShoppingBag}
            trend="-2.3%"
            trendUp={false}
          />
        </div>

        {/* Revenue + Traffic charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Revenue area chart */}
          <div className="lg:col-span-2 border border-border bg-card p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-medium">Revenue Overview</h2>
                <p className="text-xs font-light text-muted-foreground mt-0.5">Monthly revenue & orders — 2024</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                <TrendingUp className="size-3.5" /> +18.4% YoY
              </span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={42} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-gold)" strokeWidth={2} fill="url(#revenueGrad)" />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="var(--color-foreground)" strokeWidth={1.5} dot={false} yAxisId={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie */}
          <div className="border border-border bg-card p-6">
            <h2 className="mb-1 text-sm font-medium">Sales by Category</h2>
            <p className="mb-4 text-xs font-light text-muted-foreground">% of total revenue</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {categoryData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="font-light text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic + Top products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Weekly traffic bar */}
          <div className="lg:col-span-3 border border-border bg-card p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-medium">Weekly Traffic</h2>
                <p className="text-xs font-light text-muted-foreground mt-0.5">Sessions vs. conversions</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyTraffic} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 12 }} />
                <Bar dataKey="sessions" name="Sessions" fill="var(--color-muted)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="conversions" name="Conversions" fill="var(--color-gold)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top products */}
          <div className="lg:col-span-2 border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-medium">Top Products</h2>
              <Link href="/admin/products" className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2">
                View all <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <ul className="space-y-3">
              {topProducts.map((product, i) => (
                <li key={product.name} className="flex items-center gap-3">
                  <span className="w-4 text-[11px] font-light text-muted-foreground shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{product.name}</p>
                    <p className="text-[10px] font-light text-muted-foreground">{product.sales} sold</p>
                  </div>
                  <p className="text-xs font-medium shrink-0">${product.revenue.toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent orders */}
        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-medium">Recent Orders</h2>
              <p className="text-xs font-light text-muted-foreground mt-0.5">Latest transactions across the store</p>
            </div>
            <button className="flex items-center gap-1 text-[11px] font-light text-gold hover:underline underline-offset-2">
              View all <ArrowUpRight className="size-3" />
            </button>
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-muted-foreground">{order.id}</td>
                    <td className="px-6 py-4 font-medium">{order.customer}</td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">{order.product}</td>
                    <td className="px-6 py-4 font-medium">${order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={cn("border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]", STATUS_STYLES[order.status])}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
