"use client"

import { useState, useRef } from "react"
import { X, Image, Hash, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPost } from "@/lib/actions/post"
import { useUploadThing } from "@/lib/uploadthing-hook"
import { sileo } from "sileo"

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
  authorName: string
  authorImage?: string | null
  authorUsername: string
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

export function CreatePostModal({
  open,
  onClose,
  authorName,
  authorImage,
  authorUsername,
}: CreatePostModalProps) {
  const [content, setContent] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [posting, setPosting] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { startUpload, isUploading } = useUploadThing("postImageUploader", {
    onUploadError: () => {
      sileo.error({ title: "Failed to upload image." })
    },
  })

  if (!open) return null

  const handleClose = () => {
    setContent("")
    setTagInput("")
    setTags([])
    setImagePreview(null)
    setImageFile(null)
    onClose()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().replace(/^#/, "").toLowerCase()
      if (!tags.includes(tag) && tags.length < 5) {
        setTags((prev) => [...prev, tag])
      }
      setTagInput("")
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      sileo.error({ title: "Post content cannot be empty." })
      return
    }

    setPosting(true)
    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const res = await startUpload([imageFile])
        imageUrl = res?.[0]?.url ?? null
      }

      await createPost({ content: content.trim(), imageUrl, tags })
      sileo.success({ title: "Post created!" })
      handleClose()
    } catch {
      sileo.error({ title: "Failed to create post. Try again." })
    } finally {
      setPosting(false)
    }
  }

  const isLoading = posting || isUploading
  const charCount = content.length
  const maxChars = 500

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && !isLoading && handleClose()}
    >
      <div className="w-full max-w-lg rounded-xl border border-border/50 bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h3 className="text-sm font-medium text-foreground">Create post</h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Author */}
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground overflow-hidden">
              {authorImage ? (
                <img src={authorImage} alt={authorName} className="h-full w-full object-cover" />
              ) : (
                getInitials(authorName)
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{authorName}</p>
              <p className="text-xs text-muted-foreground">@{authorUsername}</p>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            autoFocus
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-3 overflow-hidden rounded-lg border border-border/50">
              <img src={imagePreview} alt="Preview" className="max-h-64 w-full object-cover" />
              <button
                onClick={() => { setImagePreview(null); setImageFile(null) }}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-lg border border-border/50 bg-muted/40 px-3 py-2">
            <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-foreground"
              >
                #{tag}
                <button onClick={() => setTags((p) => p.filter((t) => t !== tag))}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
                className="min-w-[120px] flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              onClick={() => imageRef.current?.click()}
              disabled={!!imagePreview || isLoading}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Image className="h-3.5 w-3.5" />
              Photo
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xs",
              charCount > maxChars * 0.9 ? "text-amber-500" : "text-muted-foreground",
              charCount >= maxChars && "text-red-500"
            )}>
              {charCount}/{maxChars}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
