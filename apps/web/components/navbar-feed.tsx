"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification02Icon,
  BubbleChatIcon,
  ArrowDown01Icon,
  LayoutBottomIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useSignOut } from "@/hooks/use-signOut"

export function Navbar() {
  const { data: session } = useSession()
  const { handleSignOut } = useSignOut()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-6">
      {/* Logo */}
      <Link href="/feed" className="flex min-w-40 items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <HugeiconsIcon
            icon={LayoutBottomIcon}
            strokeWidth={2}
            className="size-4"
          />
        </div>
        <span className="text-sm font-medium">DevNest PH</span>
      </Link>

      {/* Search */}
      <div className="mx-6 flex max-w-md flex-1 items-center gap-2 rounded-full border bg-muted px-4 py-1.5">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="size-4 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search DevNest PH..."
          className="w-full bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Right icons */}
      <div className="flex min-w-40 items-center justify-end gap-1">
        {/* Notifications */}
        <button className="relative flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-muted">
          <HugeiconsIcon
            icon={Notification02Icon}
            strokeWidth={2}
            className="size-4"
          />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-background bg-red-500" />
        </button>

        {/* Messages */}
        <button className="flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-muted">
          <HugeiconsIcon
            icon={BubbleChatIcon}
            strokeWidth={2}
            className="size-4"
          />
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-border" />

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full border px-2 py-1 transition-colors hover:bg-muted"
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
            <span className="text-sm font-medium">
              {session?.user?.name?.split(" ")[0] ?? "User"}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-3 text-muted-foreground"
            />
          </button>

          {/* Dropdown */}
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
                  href="/profile"
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
    </nav>
  )
}
