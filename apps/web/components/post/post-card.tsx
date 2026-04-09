"use client"

import { useState, useEffect } from "react"
import {
  Heart,
  MessageCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  AtSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleLike, createComment, deletePost } from "@/lib/actions/post"
import { sileo } from "sileo"

export interface PostData {
  id: string
  content: string
  imageUrl?: string | null
  tags: string[]
  createdAt: Date
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  likes: { userId: string }[]
  comments: {
    id: string
    content: string
    createdAt: Date
    author: {
      name: string | null
      username: string | null
      image: string | null
    }
  }[]
  _count: { likes: number; comments: number }
}

interface PostCardProps {
  post: PostData
  currentUserId?: string | null
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

export function PostCard({ post, currentUserId }: PostCardProps) {
  const isLiked = post.likes.some((l) => l.userId === currentUserId)
  const isOwner = currentUserId === post.author.id

  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState(post.comments)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{
    id: string
    author: string
    username: string
  } | null>(null)
  const [replyText, setReplyText] = useState("")
  const [mentionSearch, setMentionSearch] = useState("")
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [mentionSuggestions, setMentionSuggestions] = useState
  {
    id: string
    username: string | null
    name: string | null
    image: string | null
  }
  ;[] > []

  useEffect(() => {
    if (!mentionSearch || mentionSearch.length < 1) {
      setMentionSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(mentionSearch)}`
        )
        const data = await res.json()
        setMentionSuggestions(data.users ?? [])
      } catch {
        setMentionSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [mentionSearch])

  const handleLike = async () => {
    if (!currentUserId) return
    setLiked((p) => !p)
    setLikeCount((p) => (liked ? p - 1 : p + 1))
    await toggleLike(post.id)
  }

  const handleComment = async () => {
    if (!commentText.trim() || !currentUserId) return
    setSubmitting(true)
    try {
      await createComment(post.id, commentText.trim())
      const res = await fetch(`/api/posts/${post.id}`)
      const data = await res.json()
      setComments(data.comments || [])
      setCommentText("")
      sileo.success({ title: "Comment posted!" })
    } catch {
      sileo.error({ title: "Failed to post comment." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !currentUserId || !replyingTo) return
    setSubmitting(true)
    try {
      await createComment(post.id, replyText.trim(), replyingTo.id)
      const res = await fetch(`/api/posts/${post.id}`)
      const data = await res.json()
      setComments(data.comments || [])
      setReplyText("")
      setReplyingTo(null)
      setMentionSearch("")
      sileo.success({ title: "Reply posted!" })
    } catch {
      sileo.error({ title: "Failed to post reply." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deletePost(post.id)
      sileo.success({ title: "Post deleted." })
      setShowDeleteModal(false)
    } catch {
      sileo.error({ title: "Failed to delete post." })
      setDeleting(false)
    }
  }

  const handleCommentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCommentText(value)

    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const searchQuery = textBeforeCursor.slice(lastAtIndex + 1)
      if (searchQuery.length > 0 && !searchQuery.includes(" ")) {
        setMentionSearch(searchQuery)
        setShowMentionSuggestions(true)
        setCursorPosition(cursorPos)
      } else {
        setShowMentionSuggestions(false)
        setMentionSearch("")
      }
    } else {
      setShowMentionSuggestions(false)
      setMentionSearch("")
    }
  }

  const insertMention = (username: string) => {
    const beforeMention = commentText.slice(0, cursorPosition)
    const lastAtIndex = beforeMention.lastIndexOf("@")
    const newText =
      commentText.slice(0, lastAtIndex) +
      `@${username} ` +
      commentText.slice(cursorPosition)
    setCommentText(newText)
    setShowMentionSuggestions(false)
    setMentionSearch("")
  }

  return (
    <>
      <div className="rounded-xl border border-border/50 bg-card px-4 py-4 transition-colors hover:border-border/80">
        {/* Header */}
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
          <div className="flex items-center gap-2">
            <span
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {timeAgo(post.createdAt)}
            </span>
            {isOwner && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-muted-foreground transition-colors hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
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
              className="max-h-96 w-full object-cover"
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

        {/* Actions */}
        <div className="flex items-center gap-4 border-t border-border/40 pt-3">
          <button
            onClick={handleLike}
            disabled={!currentUserId}
            suppressHydrationWarning
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              liked
                ? "text-rose-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
            {likeCount}
          </button>

          <button
            onClick={() => setShowComments((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {comments.length}
            {showComments ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 border-t border-border/40 pt-3">
            {/* Reply input */}
            {replyingTo && (
              <div className="mb-3 ml-8 flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleReply()
                  }
                  placeholder={`Reply to @${replyingTo.username}...`}
                  className="flex-1 rounded-lg border border-border/50 bg-muted/40 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || submitting}
                  className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Reply"
                  )}
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Comment input */}
            {currentUserId && !replyingTo && (
              <div className="relative mb-3 flex gap-2">
                <input
                  value={commentText}
                  onChange={handleCommentInput}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleComment()
                  }
                  placeholder="Write a comment... (use @ to mention)"
                  className="flex-1 rounded-lg border border-border/50 bg-muted/40 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || submitting}
                  className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Post"
                  )}
                </button>

                {/* Mention suggestions dropdown */}
                {showMentionSuggestions && mentionSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 z-10 mt-1 w-64 rounded-lg border border-border/50 bg-background shadow-lg">
                    {mentionSuggestions.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => insertMention(user.username ?? "")}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[10px]">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <AtSign className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {user.name ?? user.username}
                          </p>
                          <p className="truncate text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Comments list */}
            <div className="flex flex-col gap-2.5">
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No comments yet.
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                      {comment.author.image ? (
                        <img
                          src={comment.author.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(
                          comment.author.name ?? comment.author.username ?? "U"
                        )
                      )}
                    </div>
                    <div className="flex-1 rounded-lg bg-muted/40 px-3 py-2">
                      <p className="text-xs font-medium text-foreground">
                        {comment.author.name ?? comment.author.username}
                        <span
                          className="ml-1.5 font-normal text-muted-foreground"
                          suppressHydrationWarning
                        >
                          {timeAgo(comment.createdAt)}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-foreground">
                        {comment.content}
                      </p>
                      {currentUserId && (
                        <button
                          onClick={() =>
                            setReplyingTo({
                              id: comment.id,
                              author:
                                comment.author.name ??
                                comment.author.username ??
                                "User",
                              username: comment.author.username ?? "user",
                            })
                          }
                          className="mt-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border/50 bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <h3 className="text-sm font-medium text-foreground">
                Delete post
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border/50 px-5 py-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-border/50 px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
