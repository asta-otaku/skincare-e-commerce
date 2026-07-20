/**
 * Admin inbox queries for newsletter, contact, wholesale.
 */
import { createAdminBrowserClient } from "@/lib/supabase/client"

export type NewsletterRow = {
  id: string
  email: string
  source: string
  discount_code: string
  created_at: string
}

export type ContactRow = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

export type WholesaleRow = {
  id: string
  name: string
  business: string
  email: string
  phone: string
  type: string
  volume: string
  message: string
  created_at: string
}

export async function getInboxData(): Promise<{
  newsletter: NewsletterRow[]
  contact: ContactRow[]
  wholesale: WholesaleRow[]
}> {
  const supabase = createAdminBrowserClient()
  if (!supabase) return { newsletter: [], contact: [], wholesale: [] }

  const [n, c, w] = await Promise.all([
    supabase
      .from("newsletter_subscribers")
      .select("id, email, source, discount_code, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("contact_submissions")
      .select("id, name, email, subject, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("wholesale_enquiries")
      .select("id, name, business, email, phone, type, volume, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ])

  if (n.error) console.error("[inbox] newsletter:", n.error.message)
  if (c.error) console.error("[inbox] contact:", c.error.message)
  if (w.error) console.error("[inbox] wholesale:", w.error.message)

  return {
    newsletter: (n.data ?? []) as NewsletterRow[],
    contact: (c.data ?? []) as ContactRow[],
    wholesale: (w.data ?? []) as WholesaleRow[],
  }
}
