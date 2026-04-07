"use client"

import { useRef } from "react"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing-hook"
import { updateCoverImage } from "@/lib/actions/profile"
import { sileo } from "sileo"

interface ProfileCoverProps {
  coverUrl?: string | null
  editable?: boolean
  className?: string
}

export function ProfileCover({
  coverUrl,
  editable = false,
  className,
}: ProfileCoverProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("coverUploader", {
    onClientUploadComplete: async (res) => {
      if (res?.[0]?.url) {
        await updateCoverImage(res[0].url)
        sileo.success({ title: "Cover photo updated!" })
      }
    },
    onUploadError: () => {
      sileo.error({ title: "Failed to upload cover photo." })
    },
  })

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await startUpload([file])
  }

  return (
    <div
      className={cn(
        "relative h-36 w-full overflow-hidden rounded-t-xl bg-muted",
        className
      )}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt="Cover photo"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-muted" />
      )}

      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            disabled={isUploading}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            {isUploading ? "Uploading..." : "Upload cover"}
          </button>
        </>
      )}
    </div>
  )
}
