// components/post/post-modal.tsx
'use client'

import { useEffect, useState } from 'react'
import { X, Heart, MessageCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleLike, createComment } from '@/lib/actions/post'
import { formatDistanceToNow } from 'date-fns'

interface PostModalProps {
  postId: string
  isOpen: boolean
  onClose: () => void
  currentUserId?: string | null
}

interface PostData {
  id: string
  content: string
  imageUrl?: string | null
  tags: string[]
  createdAt: string
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
    createdAt: string
    author: {
      name: string | null
      username: string | null
      image: string | null
    }
  }[]
  _count: { likes: number; comments: number }
}

export function PostModal({ postId, isOpen, onClose, currentUserId }: PostModalProps) {
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [comments, setComments] = useState<PostData['comments']>([])
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null)
  const [replyText, setReplyText] = useState('')

  // Fetch post data
  useEffect(() => {
    if (!isOpen || !postId) return

    const fetchPost = async () => {
      setLoading(true)
      try {
        console.log('Fetching post:', postId)
        const res = await fetch(`/api/posts/${postId}`)
        console.log('Response status:', res.status)

        if (!res.ok) {
          console.error('Failed to fetch post')
          return
        }

        const data = await res.json()
        console.log('Post data:', data)
        setPost(data)
        setLiked(data.likes?.some((l: any) => l.userId === currentUserId) || false)
        setLikeCount(data._count?.likes || 0)
        setComments(data.comments || [])
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, isOpen, currentUserId])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleLike = async () => {
    if (!currentUserId) return
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    await toggleLike(postId)
  }

  const handleComment = async () => {
    const text = replyingTo ? replyText : commentText
    if (!text.trim() || !currentUserId) return

    setSubmitting(true)
    try {
      await createComment(postId, text.trim(), replyingTo?.id)

      // Refetch comments
      const res = await fetch(`/api/posts/${postId}`)
      const data = await res.json()
      setComments(data.comments || [])

      setCommentText('')
      setReplyText('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const timeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">Post</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : post ? (
            <>
              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {post.author.image ? (
                    <img
                      src={post.author.image}
                      alt={post.author.name ?? ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(post.author.name ?? post.author.username ?? 'U')
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {post.author.name ?? post.author.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{post.author.username} · {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              {/* Content */}
              <p className="mb-4 text-base leading-relaxed whitespace-pre-wrap text-foreground">
                {post.content}
              </p>

              {/* Image */}
              {post.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-lg border border-border/50">
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="max-h-96 w-full object-cover"
                  />
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-2 py-0.5 text-xs"
                      style={{
                        background: 'hsl(var(--primary) / 0.08)',
                        color: 'hsl(var(--primary))',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Like button */}
              <div className="mb-4 flex items-center gap-4 border-t border-border/40 pt-4">
                <button
                  onClick={handleLike}
                  disabled={!currentUserId}
                  className={cn(
                    "flex items-center gap-1.5 text-sm transition-colors",
                    liked
                      ? "text-rose-500"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                  <span>{likeCount}</span>
                </button>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments.length}</span>
                </div>
              </div>

              {/* Comments section */}
              <div className="border-t border-border/40 pt-4">
                <h4 className="mb-3 text-sm font-medium text-foreground">
                  Comments ({comments.length})
                </h4>

                {/* Reply input (when replying to a comment) */}
                {replyingTo && (
                  <div className="mb-4 ml-9 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleComment()}
                      placeholder={`Reply to ${replyingTo.author}...`}
                      className="flex-1 rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
                    />
                    <button
                      onClick={handleComment}
                      disabled={!replyText.trim() || submitting}
                      className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-40"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reply'}
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="rounded-lg border border-border/50 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Comment input */}
                {currentUserId && !replyingTo && (
                  <div className="mb-4 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && !e.shiftKey && handleComment()
                      }
                      placeholder="Write a comment..."
                      className="flex-1 rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
                    />
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || submitting}
                      className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-40"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                )}

                {/* Comments list */}
                <div className="flex flex-col gap-3">
                  {comments.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No comments yet.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                          {comment.author.image ? (
                            <img
                              src={comment.author.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(
                              comment.author.name ?? comment.author.username ?? 'U'
                            )
                          )}
                        </div>
                        <div className="flex-1 rounded-lg bg-muted/40 px-3 py-2">
                          <p className="text-sm font-medium text-foreground">
                            {comment.author.name ?? comment.author.username}
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              {timeAgo(comment.createdAt)}
                            </span>
                          </p>
                          <p className="mt-0.5 text-sm text-foreground">
                            {comment.content}
                          </p>
                          {/* Reply button */}
                          {currentUserId && (
                            <button
                              onClick={() => setReplyingTo({
                                id: comment.id,
                                author: comment.author.name ?? comment.author.username ?? 'User'
                              })}
                              className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
            </>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Post not found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
