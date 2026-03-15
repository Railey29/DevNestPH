export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/feed/:path*", "/profile/:path*", "/settings/:path*"],
}
