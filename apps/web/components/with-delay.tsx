"use client"

import { useEffect, useState } from "react"

export function WithDelay({
  children,
  delay = 1000,
  fallback,
}: {
  children: React.ReactNode
  delay?: number
  fallback: React.ReactNode
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return show ? <>{children}</> : <>{fallback}</>
}
