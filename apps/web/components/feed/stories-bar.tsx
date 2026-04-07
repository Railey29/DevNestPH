"use client"

import { useRef } from "react"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { cn } from "@/lib/utils"

export interface Story {
  userId: string
  name: string
  username: string
  avatarUrl?: string | null
  hasUnread?: boolean
}

interface StoriesBarProps {
  stories: Story[]
  onView?: (userId: string) => void
  className?: string
}

export function StoriesBar({ stories, onView, className }: StoriesBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (stories.length === 0) return null

  return (
    <div
      ref={scrollRef}
      className={cn(
        "scrollbar-none flex gap-3 overflow-x-auto pb-3",
        className
      )}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {stories.map((story) => (
        <button
          key={story.userId}
          onClick={() => onView?.(story.userId)}
          className="flex shrink-0 flex-col items-center gap-1.5"
        >
          <div
            className={cn(
              "rounded-full p-[2px]",
              story.hasUnread
                ? "bg-gradient-to-br from-blue-500 to-teal-400"
                : "bg-border/40"
            )}
          >
            <div className="rounded-full border-2 border-background">
              <ProfileAvatar
                avatarUrl={story.avatarUrl}
                name={story.name}
                size="sm"
                className="pointer-events-none"
              />
            </div>
          </div>
          <span className="max-w-[52px] truncate text-[11px] text-muted-foreground">
            {story.username}
          </span>
        </button>
      ))}
    </div>
  )
}
