"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { sileo } from "sileo"

export function useLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (email: string, password: string) => {
    if (!email || !password) {
      sileo.error({ title: "Please fill in all fields" })
      return
    }

    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        sileo.error({ title: "Invalid email or password" })
        return
      }

      sileo.success({ title: "Welcome back! 🎉" })
      router.push("/feed")
    } catch {
      sileo.error({ title: "Something went wrong. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    handleSubmit,
  }
}
