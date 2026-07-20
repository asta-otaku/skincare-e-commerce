import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { isPaystackConfigured, toKobo, verifyTransaction } from "@/lib/paystack"
import { fulfillPaidOrder } from "@/lib/supabase/orders"
import { sendOrderConfirmationIfNew } from "@/lib/email/order"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const reference = typeof body.reference === "string" ? body.reference.trim() : ""
    const mock = Boolean(body.mock)

    if (!reference) {
      return NextResponse.json({ error: "Missing reference." }, { status: 400 })
    }

    const admin = createAdminClient()
    const db = admin ?? (await createClient())
    if (!db) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 })
    }

    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id, reference, total, payment_status")
      .eq("reference", reference)
      .maybeSingle()

    if (orderError) {
      console.error("[orders/verify] lookup:", orderError.message)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 })
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({
        ok: true,
        reference,
        message: "Payment already confirmed.",
      })
    }

    // Local mock checkout (no Paystack keys)
    if (mock || !isPaystackConfigured()) {
      const result = await fulfillPaidOrder(db, reference)
      if (result.ok) {
        void sendOrderConfirmationIfNew(reference, result.message)
      }
      return NextResponse.json({
        ok: result.ok,
        reference,
        mock: true,
        message: result.message ?? (result.ok ? "Payment confirmed." : "Could not complete order."),
        error: result.ok ? undefined : result.message,
      })
    }

    const tx = await verifyTransaction(reference)
    if (tx.status !== "success") {
      await db
        .from("orders")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("reference", reference)
      return NextResponse.json(
        { ok: false, error: `Payment not successful (${tx.status}).` },
        { status: 400 },
      )
    }

    const expectedKobo = toKobo(Number(order.total))
    if (typeof tx.amount === "number" && tx.amount !== expectedKobo) {
      console.error(
        `[orders/verify] amount mismatch ref=${reference} paystack=${tx.amount} expected=${expectedKobo}`,
      )
      return NextResponse.json(
        { ok: false, error: "Paid amount does not match order total." },
        { status: 400 },
      )
    }

    const result = await fulfillPaidOrder(db, reference)
    if (!result.ok) {
      console.error("[orders/verify] fulfill:", result.message)
      return NextResponse.json(
        { ok: false, error: result.message ?? "Could not complete order." },
        { status: 500 },
      )
    }

    void sendOrderConfirmationIfNew(reference, result.message)

    return NextResponse.json({
      ok: true,
      reference,
      message: result.message ?? "Payment confirmed.",
    })
  } catch (err) {
    console.error("[orders/verify]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verify failed." },
      { status: 500 },
    )
  }
}
