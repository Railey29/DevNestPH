"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export type ProfileTab = "posts" | "replies" | "saved"

interface ProfileTabsProps {
  defaultTab?: ProfileTab
  isOwner?: boolean
  posts: React.ReactNode
  replies: React.ReactNode
  saved?: React.ReactNode
  className?: string
}

const tabs: { id: ProfileTab; label: string; ownerOnly?: boolean }[] = [
  { id: "posts", label: "Posts" },
  { id: "replies", label: "Replies" },
  { id: "saved", label: "Saved", ownerOnly: true },
]

export function ProfileTabs({
  defaultTab = "posts",
  isOwner = false,
  posts,
  replies,
  saved,
  className,
}: ProfileTabsProps) {
  const [active, setActive] = useState<ProfileTab>(defaultTab)

  const visibleTabs = tabs.filter((t) => !t.ownerOnly || isOwner)

  const content = {
    posts,
    replies,
    saved,
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex border-b border-border/50">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-sm transition-colors",
              active === tab.id
                ? "font-medium text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{content[active]}</div>
    </div>
  )
}
