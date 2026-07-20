import { createAdminBrowserClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/products"
import { rowToOrder } from "@/lib/supabase/orders"
import type { Order } from "@/lib/orders"

export type DashboardStats = {
  revenue30d: number
  revenuePrev30d: number
  paidOrders30d: number
  pendingOrders: number
  customerCount: number
  customersThisMonth: number
  productCount: number
  inStockCount: number
  avgOrderValue: number
  aovPrev: number
  monthly: { month: string; revenue: number; orders: number }[]
  categoryShare: { name: string; value: number; color: string }[]
  topProducts: { name: string; sales: number; revenue: number }[]
  recentOrders: Order[]
  ordersByWeekday: { day: string; orders: number; revenue: number }[]
}

const CATEGORY_COLORS = [
  "var(--color-gold)",
  "oklch(0.439 0 0)",
  "var(--color-lavender)",
  "oklch(0.371 0 0)",
  "oklch(0.269 0 0)",
  "oklch(0.85 0 0)",
  "oklch(0.55 0 0)",
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function pctChange(current: number, prev: number) {
  if (prev <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - prev) / prev) * 1000) / 10
}

export function formatTrend(current: number, prev: number) {
  const pct = pctChange(current, prev)
  return {
    label: `${pct >= 0 ? "+" : ""}${pct}%`,
    up: pct >= 0,
  }
}

export { formatPrice }

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminBrowserClient()
  const empty: DashboardStats = {
    revenue30d: 0,
    revenuePrev30d: 0,
    paidOrders30d: 0,
    pendingOrders: 0,
    customerCount: 0,
    customersThisMonth: 0,
    productCount: 0,
    inStockCount: 0,
    avgOrderValue: 0,
    aovPrev: 0,
    monthly: MONTHS.map(month => ({ month, revenue: 0, orders: 0 })),
    categoryShare: [],
    topProducts: [],
    recentOrders: [],
    ordersByWeekday: WEEKDAYS.map(day => ({ day, orders: 0, revenue: 0 })),
  }
  if (!supabase) return empty

  const now = new Date()
  const d30 = new Date(now)
  d30.setDate(d30.getDate() - 30)
  const d60 = new Date(now)
  d60.setDate(d60.getDate() - 60)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const [
    { data: orders, error: ordersErr },
    { count: customerCount },
    { count: customersThisMonth },
    { data: products },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .gte("created_at", yearStart.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", monthStart.toISOString()),
    supabase.from("products").select("id, stock"),
  ])

  if (ordersErr) {
    console.error("[dashboard] orders:", ordersErr.message)
  }

  const all = orders ?? []
  const paid = all.filter(o => o.payment_status === "paid")

  const paid30 = paid.filter(o => new Date(o.created_at) >= d30)
  const paidPrev = paid.filter(o => {
    const t = new Date(o.created_at)
    return t >= d60 && t < d30
  })

  const revenue30d = paid30.reduce((s, o) => s + Number(o.total), 0)
  const revenuePrev30d = paidPrev.reduce((s, o) => s + Number(o.total), 0)
  const pendingOrders = all.filter(o => o.status === "pending").length

  const avgOrderValue = paid30.length ? revenue30d / paid30.length : 0
  const aovPrev = paidPrev.length
    ? paidPrev.reduce((s, o) => s + Number(o.total), 0) / paidPrev.length
    : 0

  const monthlyMap = new Map<number, { revenue: number; orders: number }>()
  for (let i = 0; i < 12; i++) monthlyMap.set(i, { revenue: 0, orders: 0 })
  for (const o of paid) {
    const d = new Date(o.created_at)
    if (d.getFullYear() !== now.getFullYear()) continue
    const bucket = monthlyMap.get(d.getMonth())!
    bucket.revenue += Number(o.total)
    bucket.orders += 1
  }
  const monthly = MONTHS.map((month, i) => ({
    month,
    revenue: Math.round(monthlyMap.get(i)!.revenue),
    orders: monthlyMap.get(i)!.orders,
  }))

  // Category + top products from paid order line items
  const categoryTotals = new Map<string, number>()
  const productTotals = new Map<string, { sales: number; revenue: number }>()
  for (const o of paid) {
    const items = Array.isArray(o.items) ? o.items : []
    for (const item of items) {
      const cat = String(item.category || "Other")
      const name = String(item.name || "Product")
      const qty = Number(item.quantity) || 0
      const line = Number(item.price) * qty
      categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + line)
      const prev = productTotals.get(name) ?? { sales: 0, revenue: 0 }
      productTotals.set(name, {
        sales: prev.sales + qty,
        revenue: prev.revenue + line,
      })
    }
  }
  const catSum = Array.from(categoryTotals.values()).reduce((s, n) => s + n, 0) || 1
  const categoryShare = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, total], i) => ({
      name,
      value: Math.round((total / catSum) * 100),
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))

  const topProducts = Array.from(productTotals.entries())
    .map(([name, v]) => ({ name, sales: v.sales, revenue: Math.round(v.revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const weekdayMap = new Map<number, { orders: number; revenue: number }>()
  for (let i = 0; i < 7; i++) weekdayMap.set(i, { orders: 0, revenue: 0 })
  for (const o of paid) {
    const d = new Date(o.created_at)
    if (d < weekStart) continue
    const bucket = weekdayMap.get(d.getDay())!
    bucket.orders += 1
    bucket.revenue += Number(o.total)
  }
  // Display Mon→Sun
  const ordersByWeekday = [1, 2, 3, 4, 5, 6, 0].map(i => ({
    day: WEEKDAYS[i],
    orders: weekdayMap.get(i)!.orders,
    revenue: Math.round(weekdayMap.get(i)!.revenue),
  }))

  const productRows = products ?? []
  const recentOrders = all.slice(0, 8).map(rowToOrder)

  return {
    revenue30d: Math.round(revenue30d),
    revenuePrev30d: Math.round(revenuePrev30d),
    paidOrders30d: paid30.length,
    pendingOrders,
    customerCount: customerCount ?? 0,
    customersThisMonth: customersThisMonth ?? 0,
    productCount: productRows.length,
    inStockCount: productRows.filter(p => Number(p.stock) > 0).length,
    avgOrderValue: Math.round(avgOrderValue),
    aovPrev: Math.round(aovPrev),
    monthly,
    categoryShare,
    topProducts,
    recentOrders,
    ordersByWeekday,
  }
}
