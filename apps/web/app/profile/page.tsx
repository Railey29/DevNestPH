export const dynamic = "force-dynamic"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function ProfileRedirectPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const username =
    (session.user as { username?: string }).username ??
    session.user.name?.replace(/\s+/g, "") ??
    "me"

  redirect(`/profile/${username}`)
}
