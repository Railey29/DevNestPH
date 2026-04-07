"use client"

import { useState } from "react"
import { MapPin, Briefcase, CalendarDays, Globe, Loader2 } from "lucide-react"
import { ProfileAvatar } from "./profile-avatar"
import { EditProfileModal } from "./edit-profile-modal"
import { toggleFollow } from "@/lib/actions/follow"
import { sileo } from "sileo"
import { cn } from "@/lib/utils"

interface ProfileHeaderProps {
  name: string
  username: string
  bio?: string | null
  location?: string | null
  company?: string | null
  website?: string | null
  joinedAt?: string | null
  avatarUrl?: string | null
  isOwner?: boolean
  isFollowing?: boolean
  targetUserId?: string
  stats: {
    posts: number
    followers: number
    following: number
  }
  className?: string
}

export function ProfileHeader({
  name,
  username,
  bio,
  location,
  company,
  website,
  joinedAt,
  avatarUrl,
  isOwner = false,
  isFollowing: initialIsFollowing = false,
  targetUserId,
  stats,
  className,
}: ProfileHeaderProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [following, setFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(stats.followers)
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    if (!targetUserId) return
    setLoading(true)
    try {
      await toggleFollow(targetUserId)
      setFollowing((p) => !p)
      setFollowerCount((p) => (following ? p - 1 : p + 1))
    } catch {
      sileo.error({ title: "Failed to follow. Try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "rounded-b-xl border border-t-0 border-border/50 bg-card px-5 pb-5",
          className
        )}
      >
        <div className="flex items-end justify-between">
          <ProfileAvatar
            avatarUrl={avatarUrl}
            name={name}
            size="lg"
            editable={isOwner}
            className="-mt-10"
          />

          <div className="flex gap-2 pb-1">
            {isOwner ? (
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-md border border-border/60 px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Edit profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                disabled={loading}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-70",
                  following
                    ? "border border-border/60 text-foreground hover:bg-muted hover:text-red-500"
                    : "bg-foreground text-background hover:opacity-90"
                )}
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-lg leading-tight font-semibold text-foreground">
            {name}
          </h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>

        {bio && (
          <p className="mt-2.5 text-sm leading-relaxed text-foreground">
            {bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {location && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
          )}
          {company && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              {company}
            </span>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Globe className="h-3.5 w-3.5" />
              {website.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          )}
          {joinedAt && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Joined {joinedAt}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-5 border-t border-border/40 pt-4">
          {[
            { label: "Posts", value: stats.posts },
            { label: "Followers", value: followerCount },
            { label: "Following", value: stats.following },
          ].map(({ label, value }) => (
            <button
              key={label}
              className="text-left transition-opacity hover:opacity-70"
            >
              <span className="block text-base font-semibold text-foreground">
                {value.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{ name, bio, location, company, website }}
      />
    </>
  )
}
