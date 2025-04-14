import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Add paths that don't require authentication
const publicPaths = [
  "/",
  "/positions/[id]",
  "/api/auth",
  "/api/webhooks",
  "/_next",
  "/favicon.ico"
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path.replace("[id]", "")))) {
    return NextResponse.next()
  }

  // Check if the path is the login page
  if (pathname === "/login") {
    const token = await getToken({ req: request })
    if (token) {
      // If user is already logged in, redirect to dashboard based on role
      const redirectUrl = token.role === "company" ? "/dashboard/company" : "/dashboard/candidate"
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    return NextResponse.next()
  }

  // For all other paths, check authentication
  const token = await getToken({ req: request })
  if (!token) {
    // Redirect to login with the current path as callback
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url))
  }

  // Check role-based access
  if (pathname.startsWith("/dashboard/company") && token.role !== "company") {
    return NextResponse.redirect(new URL("/dashboard/candidate", request.url))
  }

  if (pathname.startsWith("/dashboard/candidate") && token.role !== "candidate") {
    return NextResponse.redirect(new URL("/dashboard/company", request.url))
  }

  return NextResponse.next()
}

// Configure which paths to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
} 