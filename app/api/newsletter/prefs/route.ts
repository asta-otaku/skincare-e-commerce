import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NEWSLETTER_PROMO_CODE } from "@/lib/email/client"

/** Sync account newsletter preference ↔ newsletter_subscribers */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const subscribed = Boolean(body.newsletter)

    const supabase = await createClient("customer")
    if (!supabase) {
      return NextResponse.json({ error: "Auth not configured." }, { status: 503 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 })
    }

    const email = user.email.trim().toLowerCase()
    const db = createAdminClient() ?? supabase

    if (subscribed) {
      const { error } = await db.from("newsletter_subscribers").upsert(
        {
          email,
          source: "account",
          discount_code: NEWSLETTER_PROMO_CODE,
        },
        { onConflict: "email" },
      )
      if (error) {
        console.error("[newsletter/prefs] upsert:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await db.from("newsletter_subscribers").delete().eq("email", email)
      if (error) {
        console.error("[newsletter/prefs] delete:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, subscribed })
  } catch (err) {
    console.error("[newsletter/prefs]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed." },
      { status: 500 },
    )
  }
}
