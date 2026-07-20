import { createAdminClient } from "@/lib/supabase/admin"
import { sendOrderConfirmation } from "@/lib/email/send"
import { rowToOrder } from "@/lib/supabase/orders"

/** Send confirmation only when payment was newly completed (not "Already paid"). */
export async function sendOrderConfirmationIfNew(
  reference: string,
  fulfillMessage?: string,
): Promise<void> {
  if (fulfillMessage === "Already paid") return

  try {
    const db = createAdminClient()
    if (!db) return

    const { data, error } = await db
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .maybeSingle()

    if (error || !data) {
      console.error("[email] order lookup:", error?.message)
      return
    }

    const order = rowToOrder(data)
    const to = order.customer.email
    if (!to) {
      console.warn("[email] order has no email:", reference)
      return
    }

    await sendOrderConfirmation({
      to,
      name: order.customer.name,
      reference: order.reference,
      items: order.items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      total: order.total,
      shippingMethod: order.shippingMethod,
    })
  } catch (err) {
    console.error("[email] order confirmation:", err)
  }
}
