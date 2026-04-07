"use client"

import { useState } from "react"
import { PenLine } from "lucide-react"
import { CreatePostModal } from "@/components/post/create-post-modal"

interface ProfileCreatePostProps {
  user: {
    name: string
    image: string | null
    username: string
  }
}

export function ProfileCreatePost({ user }: ProfileCreatePostProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 text-left transition-colors hover:border-border/80"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            user.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <span className="flex-1 text-sm text-muted-foreground">
          Share something with the community...
        </span>
        <PenLine className="h-4 w-4 text-muted-foreground" />
      </button>

      <CreatePostModal
        open={open}
        onClose={() => setOpen(false)}
        authorName={user.name}
        authorImage={user.image}
        authorUsername={user.username}
      />
    </>
  )
}
