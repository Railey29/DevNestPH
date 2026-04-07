"use client"

import { useState, useMemo } from "react"
import {
  PenLine,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  X,
} from "lucide-react"
import { PostCard, type PostData } from "@/components/post/post-card"
import { CreatePostModal } from "@/components/post/create-post-modal"
import { FilterTabs, type FeedFilter } from "@/components/feed/filter-tabs"

interface FeedClientProps {
  allPosts: PostData[]
  followingPosts: PostData[]
  currentUserId: string | null
  user: {
    name: string
    image: string | null
    username: string
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function timeAgo(date: Date) {
  const now = new Date()
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function PostPreviewModal({
  post,
  onClose,
  currentUserId,
}: {
  post: PostData
  onClose: () => void
  currentUserId: string | null
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl border border-border/50 bg-card shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h3 className="text-sm font-medium text-foreground">Trending Post</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="px-5 py-4">
          {/* Author */}
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {post.author.image ? (
                <img
                  src={post.author.image}
                  alt={post.author.name ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(post.author.name ?? post.author.username ?? "U")
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-tight font-medium text-foreground">
                {post.author.name ?? post.author.username}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  @{post.author.username}
                </span>
              </p>
            </div>
            <span
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="mb-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {post.content}
          </p>

          {/* Image */}
          {post.imageUrl && (
            <div className="mb-3 overflow-hidden rounded-lg border border-border/50">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="max-h-72 w-full object-cover"
              />
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{
                    background: "hsl(var(--primary) / 0.08)",
                    color: "hsl(var(--primary))",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              {post._count.likes} likes
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              {post._count.comments} comments
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeedClient({
  allPosts,
  followingPosts,
  currentUserId,
  user,
}: FeedClientProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("for-you")
  const [previewPost, setPreviewPost] = useState<PostData | null>(null)

  const trendingPosts = useMemo(() => {
    return [...allPosts].sort(
      (a, b) => (b._count?.likes ?? 0) - (a._count?.likes ?? 0)
    )
  }, [allPosts])

  const posts =
    activeFilter === "following"
      ? followingPosts
      : activeFilter === "trending"
        ? trendingPosts
        : allPosts

  // Top 5 trending posts by likes
  const topTrendingPosts = useMemo(() => {
    return trendingPosts.slice(0, 3)
  }, [trendingPosts])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="flex gap-6">
        {/* Main feed */}
        <div className="min-w-0 flex-1">
          {currentUserId && (
            <button
              onClick={() => setCreateOpen(true)}
              className="mb-4 flex w-full items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 text-left transition-colors hover:border-border/80"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <span className="flex-1 text-sm text-muted-foreground">
                What's on your mind, {user.name.split(" ")[0]}?
              </span>
              <PenLine className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )}

          <FilterTabs className="mb-4" onChange={setActiveFilter} />

          <div className="flex flex-col gap-3">
            {posts.length === 0 ? (
              <div className="py-16 text-center">
                {activeFilter === "following" ? (
                  <>
                    <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-foreground">
                      No posts yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Follow some devs to see their posts here!
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No posts yet.</p>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="rounded-xl border border-border/50 bg-card px-4 py-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">
                  Trending Posts
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {topTrendingPosts.length === 0 ? (
                  <p className="px-2 text-xs text-muted-foreground">
                    No trending posts yet.
                  </p>
                ) : (
                  topTrendingPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setPreviewPost(post)}
                      className="flex flex-col gap-1 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
                    >
                      {/* Author */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[9px] font-medium text-muted-foreground">
                          {post.author.image ? (
                            <img
                              src={post.author.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(
                              post.author.name ?? post.author.username ?? "U"
                            )
                          )}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          @{post.author.username}
                        </span>
                      </div>

                      {/* Content preview */}
                      <p className="line-clamp-2 text-xs text-foreground">
                        {post.content}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-3 w-3" />
                          {post._count.likes}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="h-3 w-3" />
                          {post._count.comments}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <p className="px-2 text-xs text-muted-foreground">
              © 2026 DevNest PH · Built for Filipino devs 🇵🇭
            </p>
          </div>
        </div>
      </div>

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        authorName={user.name}
        authorImage={user.image}
        authorUsername={user.username}
      />

      {previewPost && (
        <PostPreviewModal
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}
