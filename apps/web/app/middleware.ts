import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value

  const isLoggedIn = !!token
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/feed", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
