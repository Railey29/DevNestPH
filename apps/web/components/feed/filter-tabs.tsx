"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export type FeedFilter = "for-you" | "following" | "trending" | "jobs"

interface FilterTabsProps {
  defaultFilter?: FeedFilter
  onChange?: (filter: FeedFilter) => void
  className?: string
}

const filters: { id: FeedFilter; label: string }[] = [
  { id: "for-you", label: "For you" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "jobs", label: "Jobs" },
]

export function FilterTabs({
  defaultFilter = "for-you",
  onChange,
  className,
}: FilterTabsProps) {
  const [active, setActive] = useState<FeedFilter>(defaultFilter)

  const handleChange = (filter: FeedFilter) => {
    setActive(filter)
    onChange?.(filter)
  }

  return (
    <div className={cn("flex border-b border-border/50", className)}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleChange(filter.id)}
          className={cn(
            "relative px-4 py-2.5 text-sm transition-colors",
            active === filter.id
              ? "font-medium text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
