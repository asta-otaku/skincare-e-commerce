/**
 * Order query helpers for admin + customer UIs.
 * Falls back to mock lib/orders only when Supabase is not configured.
 */
import { createClient, createAdminBrowserClient } from "@/lib/supabase/client"
import {
  orders as mockOrders,
  type Order,
  type OrderItem,
  type OrderStatus,
  type PaymentStatus,
  type PaymentMethod,
  type ShippingAddress,
} from "@/lib/orders"

export type CheckoutItem = {
  productId: string
  name: string
  image: string
  category: string
  price: number
  quantity: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToOrder(row: any): Order {
  const addr = (row.shipping_address ?? {}) as ShippingAddress & {
    email?: string
    firstName?: string
    lastName?: string
  }
  const email = row.guest_email ?? addr.email ?? ""
  const name =
    [addr.firstName, addr.lastName].filter(Boolean).join(" ") ||
    email.split("@")[0] ||
    "Customer"
  const initials = name
    .split(/\s+/)
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CU"

  const items: OrderItem[] = Array.isArray(row.items)
    ? row.items.map((i: CheckoutItem) => ({
        productId: i.productId,
        name: i.name,
        image: i.image || "/placeholder.svg",
        category: i.category || "",
        price: Number(i.price),
        quantity: Number(i.quantity),
      }))
    : []

  return {
    id: row.reference ?? row.id,
    reference: row.reference,
    customer: {
      id: row.user_id ?? "guest",
      name,
      email,
      initials,
    },
    items,
    shippingAddress: {
      firstName: addr.firstName ?? "",
      lastName: addr.lastName ?? "",
      address: addr.address ?? "",
      apartment: addr.apartment,
      city: addr.city ?? "",
      state: addr.state ?? "",
      zip: addr.zip ?? "",
      country: addr.country ?? "Nigeria",
      phone: addr.phone,
    },
    shippingMethod: row.shipping_method === "express" ? "express" : "standard",
    shippingCost: Number(row.shipping_cost ?? 0),
    subtotal: Number(row.subtotal ?? 0),
    tax: Number(row.tax ?? 0),
    total: Number(row.total ?? 0),
    status: (row.status ?? "pending") as OrderStatus,
    paymentStatus: (row.payment_status === "paid"
      ? "paid"
      : row.payment_status === "failed"
        ? "failed"
        : row.payment_status === "refunded"
          ? "refunded"
          : "pending") as PaymentStatus,
    paymentMethod: (row.payment_method ?? "card") as PaymentMethod,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return mockOrders

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[orders] getAllOrders:", error.message)
    return []
  }
  return (data ?? []).map(rowToOrder)
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  const adminClient = createAdminBrowserClient()
  const customerClient = createClient()

  // Prefer admin session when signed in as admin (admin order detail).
  if (adminClient) {
    const { data: { user: adminUser } } = await adminClient.auth.getUser()
    if (adminUser) {
      return fetchOrderByRef(adminClient, reference)
    }
  }

  if (!customerClient) {
    return mockOrders.find(o => o.id === reference || o.reference === reference) ?? null
  }

  await claimGuestOrdersForSession(customerClient)
  return fetchOrderByRef(customerClient, reference)
}

async function fetchOrderByRef(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  reference: string,
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .maybeSingle()

  if (!error && data) return rowToOrder(data)

  const { data: byId, error: idErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", reference)
    .maybeSingle()

  if (idErr) {
    console.error("[orders] getOrderByReference:", idErr.message)
    return null
  }
  if (error && !byId) {
    console.error("[orders] getOrderByReference:", error.message)
  }
  return byId ? rowToOrder(byId) : null
}

/** Attach guest checkouts (same email, null user_id) to the signed-in account. */
async function claimGuestOrdersForSession(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
) {
  const { error } = await supabase.rpc("claim_guest_orders")
  if (error) {
    // Migration 008 may not be applied yet — RLS email match still helps once it is.
    console.error("[orders] claim_guest_orders:", error.message)
  }
}

export async function getMyOrders(): Promise<Order[]> {
  const supabase = createClient()
  if (!supabase) return mockOrders

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  await claimGuestOrdersForSession(supabase)

  const email = user.email?.trim().toLowerCase()

  // Owned by user_id, plus matching guest_email / shipping email
  const [{ data: owned, error: ownedErr }, emailResult, shipResult] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    email
      ? supabase
          .from("orders")
          .select("*")
          .ilike("guest_email", email)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as unknown[], error: null }),
    email
      ? supabase
          .from("orders")
          .select("*")
          .filter("shipping_address->>email", "ilike", email)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as unknown[], error: null }),
  ])

  if (ownedErr) {
    console.error("[orders] getMyOrders:", ownedErr.message)
  }
  if (emailResult.error) {
    console.error("[orders] getMyOrders email:", emailResult.error.message)
  }
  if (shipResult.error) {
    console.error("[orders] getMyOrders shipping email:", shipResult.error.message)
  }

  const byRef = new Map<string, ReturnType<typeof rowToOrder>>()
  for (const row of [
    ...(owned ?? []),
    ...(emailResult.data ?? []),
    ...(shipResult.data ?? []),
  ]) {
    const order = rowToOrder(row)
    byRef.set(order.reference, order)
  }

  return Array.from(byRef.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export async function updateOrderStatus(
  reference: string,
  status: OrderStatus,
): Promise<string | null> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return "Supabase not configured."

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("reference", reference)

  if (error) return error.message
  return null
}

/** Mark order paid + decrement stock + bump promo via security-definer RPC. */
export async function fulfillPaidOrder(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  reference: string,
): Promise<{ ok: boolean; message?: string }> {
  const { data, error } = await client.rpc("complete_order_payment", {
    p_reference: reference,
  })

  if (error) return { ok: false, message: error.message }
  if (data && typeof data === "object" && "ok" in data) {
    return { ok: Boolean(data.ok), message: data.message as string | undefined }
  }
  return { ok: true }
}
