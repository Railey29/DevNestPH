"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: hovered ? "130px" : "36px" }}
      className="fixed top-4 right-4 z-50 flex h-9 items-center justify-start gap-2 overflow-hidden rounded-full border bg-background px-2 shadow-md transition-all duration-300 hover:bg-muted"
    >
      <HugeiconsIcon
        icon={isDark ? Sun03Icon : Moon02Icon}
        strokeWidth={2}
        className="size-4 shrink-0"
      />
      <span
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s ease" }}
        className="text-sm font-medium whitespace-nowrap"
      >
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  )
}
