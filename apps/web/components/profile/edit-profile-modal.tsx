"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateProfile } from "@/lib/actions/profile"
import { sileo } from "sileo"

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  initialData: {
    name?: string | null
    bio?: string | null
    location?: string | null
    company?: string | null
    website?: string | null
  }
}

export function EditProfileModal({
  open,
  onClose,
  initialData,
}: EditProfileModalProps) {
  const [form, setForm] = useState({
    name: initialData.name ?? "",
    bio: initialData.bio ?? "",
    location: initialData.location ?? "",
    company: initialData.company ?? "",
    website: initialData.website ?? "",
  })
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      sileo.success({ title: "Profile updated!" })
      onClose()
    } catch {
      sileo.error({ title: "Failed to save. Try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h3 className="text-sm font-medium text-foreground">Edit profile</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Display name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell something about yourself..."
              rows={3}
              className="resize-none rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
            />
            <span className="text-right text-xs text-muted-foreground">
              {form.bio.length}/160
            </span>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Manila, PH"
              className="rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
            />
          </div>

          {/* Company */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Company / Job title
            </label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Frontend Dev at Acme Corp"
              className="rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
            />
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Website
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://yoursite.dev"
              className="rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border/50 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border/50 px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-foreground px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
