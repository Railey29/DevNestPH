import { signOut } from "next-auth/react"

export const useSignOut = () => {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" })
  }

  return { handleSignOut }
}
