import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_AUTH_COOKIE, CUSTOMER_AUTH_COOKIE } from "@/lib/supabase/auth-cookies"

function refreshSession(
  request: NextRequest,
  response: NextResponse,
  supabaseUrl: string,
  supabaseKey: string,
  cookieName: string,
) {
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: { name: cookieName },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })
  return supabase.auth.getUser()
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })

  // Refresh both jars so admin + customer sessions stay alive independently
  await refreshSession(request, response, supabaseUrl, supabaseKey, CUSTOMER_AUTH_COOKIE)
  await refreshSession(request, response, supabaseUrl, supabaseKey, ADMIN_AUTH_COOKIE)

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
