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
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Get the subdomain
  const subdomain = hostname.split('.')[0]
  
  // Handle localhost development
  if (hostname.includes('localhost')) {
    // For localhost, use the first path segment as the company name
    const pathSegments = url.pathname.split('/').filter(Boolean)
    if (pathSegments.length > 0 && pathSegments[0] !== 'api') {
      const company = pathSegments[0]
      const remainingPath = pathSegments.slice(1).join('/')
      return NextResponse.rewrite(
        new URL(`/${company}/${remainingPath}`, request.url)
      )
    }
  }
  
  // If the subdomain is not 'www' or the main domain, rewrite the URL
  if (subdomain && subdomain !== 'www' && !hostname.includes('localhost')) {
    return NextResponse.rewrite(
      new URL(`/${subdomain}${url.pathname}`, request.url)
    )
  }

  // Check if the path is public
  if (publicPaths.some(path => path === url.pathname || url.pathname.startsWith(path.replace("[id]", "")))) {
    return NextResponse.next()
  }

  // Check if the path is the login page
  if (url.pathname === "/login") {
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
    const callbackUrl = encodeURIComponent(url.pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url))
  }

  // Check role-based access
  if (url.pathname.startsWith("/dashboard/company") && token.role !== "company") {
    return NextResponse.redirect(new URL("/dashboard/candidate", request.url))
  }

  if (url.pathname.startsWith("/dashboard/candidate") && token.role !== "candidate") {
    return NextResponse.redirect(new URL("/dashboard/company", request.url))
  }

  return NextResponse.next()
}

// Configure which paths to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 