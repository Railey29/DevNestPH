"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { sileo } from "sileo"

export function useSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [savedUsername, setSavedUsername] = useState("")

  const handleGetCode = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    if (!username || !email || !password) {
      sileo.error({ title: "Please fill in all fields first" })
      return
    }
    if (password !== confirmPassword) {
      sileo.error({ title: "Passwords do not match" })
      return
    }
    if (password.length < 8) {
      sileo.error({ title: "Password must be at least 8 characters" })
      return
    }
    setSendingCode(true)
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        sileo.error({ title: data.error })
        return
      }
      setSavedUsername(username) // <-- i-save ang username
      setRegistered(true)
      sileo.success({ title: "Code sent! Check your email. 📧" })
    } catch {
      sileo.error({ title: "Failed to send code. Please try again." })
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (
    email: string,
    password: string,
    confirmPassword: string,
    code: string
  ) => {
    if (password !== confirmPassword) {
      sileo.error({ title: "Passwords do not match" })
      return
    }
    if (password.length < 8) {
      sileo.error({ title: "Password must be at least 8 characters" })
      return
    }
    if (!code) {
      sileo.error({ title: "Please enter your verification code" })
      return
    }
    setLoading(true)
    try {
      // Step 1: Verify code
      const verifyRes = await fetch("/api/send-code/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        sileo.error({ title: verifyData.error })
        return
      }

      // Step 2: Register
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: savedUsername, email, password }),
      })
      const registerData = await registerRes.json()
      if (!registerRes.ok) {
        sileo.error({ title: registerData.error })
        return
      }

      sileo.success({ title: "Account created successfully! 🎉" })
      router.push("/auth/login")
    } catch {
      sileo.error({ title: "Something went wrong. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    sendingCode,
    registered,
    handleGetCode,
    handleSubmit,
  }
}
