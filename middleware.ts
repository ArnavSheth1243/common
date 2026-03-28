import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Public routes that do not require authentication
const PUBLIC_ROUTES = ["/", "/auth", "/onboarding"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes unconditionally
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.next()
  }

  // Mutable response — cookies get set on this object
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // Set on the request so subsequent middleware reads see it
          request.cookies.set({ name, value, ...options })
          // Rebuild response with updated request headers
          response = NextResponse.next({ request: { headers: request.headers } })
          // Set on the response so the browser stores it
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // No session → redirect to /auth
  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.png$).*)"],
}
