import { NextResponse } from "next/server"
import { sendWelcome } from "@/lib/email/send"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const name = typeof body.name === "string" ? body.name.trim() : "there"

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 })
    }

    await sendWelcome({ to: email, name: name || "there" })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[email/welcome]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Send failed." },
      { status: 500 },
    )
  }
}
