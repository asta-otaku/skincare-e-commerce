import { createBrowserClient } from "@supabase/ssr"
import { ADMIN_AUTH_COOKIE, CUSTOMER_AUTH_COOKIE } from "@/lib/supabase/auth-cookies"

/**
 * Storefront / customer browser client.
 * Uses a separate cookie jar from the admin client so both can stay signed in.
 */
let customerBrowserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  if (!customerBrowserClient) {
    customerBrowserClient = createBrowserClient(url, key, {
      isSingleton: false,
      cookieOptions: { name: CUSTOMER_AUTH_COOKIE },
    })
  }
  return customerBrowserClient
}

/**
 * Admin panel browser client — separate session from the storefront.
 */
let adminBrowserClient: ReturnType<typeof createBrowserClient> | null = null

export function createAdminBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  if (!adminBrowserClient) {
    adminBrowserClient = createBrowserClient(url, key, {
      isSingleton: false,
      cookieOptions: { name: ADMIN_AUTH_COOKIE },
    })
  }
  return adminBrowserClient
}
