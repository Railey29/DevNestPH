"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification02Icon,
  ArrowDown01Icon,
  LayoutBottomIcon,
  Moon02Icon,
  Sun03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useSignOut } from "@/hooks/use-signOut"
import { SearchBar } from "@/components/search-bar"

export function Navbar() {
  const { data: session } = useSession()
  const { handleSignOut } = useSignOut()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const isDark = resolvedTheme === "dark"
  const username = (session?.user as { username?: string })?.username
  const userId = (session?.user as { id?: string })?.id
  const profileHref = `/profile/${username ?? userId ?? ""}`

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HugeiconsIcon
                icon={LayoutBottomIcon}
                strokeWidth={2}
                className="size-4"
              />
            </div>
            <span className="hidden text-sm font-medium sm:block">
              DevNest PH
            </span>
          </Link>

          {/* Search — hidden on mobile, visible on sm+ */}
          <div className="hidden flex-1 sm:flex">
            <SearchBar />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearchOpen((p) => !p)}
              className="flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-muted sm:hidden"
            >
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </button>

            {/* Notifications */}
            <button className="relative flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-muted">
              <HugeiconsIcon
                icon={Notification02Icon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-background bg-red-500" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-muted"
              >
                <HugeiconsIcon
                  icon={isDark ? Sun03Icon : Moon02Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </button>
            )}

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border" />

            {/* Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border px-2 py-1 transition-colors hover:bg-muted"
                suppressHydrationWarning // ✅ ADDED
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="avatar"
                    className="size-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {initials}
                  </div>
                )}
                <span className="hidden text-sm font-medium sm:block">
                  {session?.user?.name?.split(" ")[0] ?? "User"}
                </span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  strokeWidth={2}
                  className="size-3 text-muted-foreground"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-11 right-0 z-50 w-52 rounded-xl border bg-background shadow-sm">
                  <div className="border-b px-4 py-3">
                    <p className="text-sm font-medium">
                      {session?.user?.name ?? "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email ?? ""}
                    </p>
                  </div>
                  <div className="p-1">
                    <Link
                      href={profileHref}
                      className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                      onClick={() => setDropdownOpen(false)}
                    >
                      View Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                  </div>
                  <div className="border-t p-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-muted"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search bar — slides down when toggled */}
        {mobileSearchOpen && (
          <div className="border-t px-4 py-2 sm:hidden">
            <SearchBar />
          </div>
        )}
      </nav>
    </>
  )
}
