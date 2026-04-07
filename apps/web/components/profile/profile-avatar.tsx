"use client"

import { useRef } from "react"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing-hook"
import { updateAvatarImage } from "@/lib/actions/profile"
import { sileo } from "sileo"
import { useSession } from "next-auth/react"

interface ProfileAvatarProps {
  avatarUrl?: string | null
  name: string
  size?: "sm" | "md" | "lg"
  editable?: boolean
  className?: string
}

const sizeMap = {
  sm: {
    wrapper: "h-10 w-10",
    text: "text-sm",
    edit: "h-4 w-4 -bottom-0.5 -right-0.5",
    editIcon: "h-2 w-2",
  },
  md: {
    wrapper: "h-16 w-16",
    text: "text-lg",
    edit: "h-5 w-5 bottom-0 right-0",
    editIcon: "h-2.5 w-2.5",
  },
  lg: {
    wrapper: "h-20 w-20",
    text: "text-2xl",
    edit: "h-6 w-6 bottom-0.5 right-0.5",
    editIcon: "h-3 w-3",
  },
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ProfileAvatar({
  avatarUrl,
  name,
  size = "lg",
  editable = false,
  className,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const s = sizeMap[size]
  const { update } = useSession()

  const { startUpload, isUploading } = useUploadThing("avatarUploader", {
    onClientUploadComplete: async (res) => {
      if (res?.[0]?.url) {
        await updateAvatarImage(res[0].url)
        // I-refresh ang session para ma-update ang navbar avatar agad
        await update({ image: res[0].url })
        sileo.success({ title: "Profile photo updated!" })
      }
    },
    onUploadError: () => {
      sileo.error({ title: "Failed to upload profile photo." })
    },
  })

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await startUpload([file])
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          s.wrapper,
          "flex items-center justify-center overflow-hidden rounded-full border-[3px] border-background bg-muted font-medium text-muted-foreground"
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={s.text}>{getInitials(name)}</span>
        )}
      </div>

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
            className={cn(
              "absolute flex items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50",
              s.edit
            )}
          >
            <Pencil className={s.editIcon} />
          </button>
        </>
      )}
    </div>
  )
}
