"use client"

import { useState } from "react"
import { X, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateTechStack } from "@/lib/actions/profile"
import { sileo } from "sileo"

const POPULAR_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "Java",
  "C#",
  "C++",
  "React",
  "Next.js",
  "Vue",
  "Nuxt",
  "Svelte",
  "Angular",
  "Node.js",
  "Express",
  "Fastify",
  "NestJS",
  "Django",
  "FastAPI",
  "Laravel",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Supabase",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Vercel",
  "Railway",
  "Tailwind CSS",
  "Sass",
  "GraphQL",
  "REST API",
  "tRPC",
  "Prisma",
  "Git",
  "Linux",
  "Figma",
  "React Native",
  "Flutter",
]

interface TechStackCardProps {
  skills: string[]
  editable?: boolean
  className?: string
}

export function TechStackCard({
  skills: initialSkills,
  editable = false,
  className,
}: TechStackCardProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [pendingSkills, setPendingSkills] = useState<string[]>(initialSkills)

  if (!editable && skills.length === 0) return null

  const filtered = POPULAR_SKILLS.filter(
    (s) =>
      s.toLowerCase().includes(search.toLowerCase()) &&
      !pendingSkills.includes(s)
  )

  const customMatch =
    search.trim().length > 0 &&
    !POPULAR_SKILLS.map((s) => s.toLowerCase()).includes(
      search.trim().toLowerCase()
    ) &&
    !pendingSkills
      .map((s) => s.toLowerCase())
      .includes(search.trim().toLowerCase())

  const handleOpen = () => {
    setPendingSkills(skills)
    setSearch("")
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSearch("")
  }

  const handleToggle = (skill: string) => {
    setPendingSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleAddCustom = () => {
    const s = search.trim()
    if (!s) return
    setPendingSkills((prev) => [...prev, s])
    setSearch("")
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateTechStack(pendingSkills)
      setSkills(pendingSkills)
      sileo.success({ title: "Tech stack updated!" })
      handleClose()
    } catch {
      sileo.error({ title: "Failed to save. Try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "rounded-xl border border-border/50 bg-card px-5 py-4",
          className
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Tech stack</h2>
          {editable && (
            <button
              onClick={handleOpen}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.length === 0 && editable ? (
            <button
              onClick={handleOpen}
              className="rounded-full border border-dashed border-border/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              + Add skills
            </button>
          ) : (
            skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs text-foreground"
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md rounded-xl border border-border/50 bg-card shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <h3 className="text-sm font-medium text-foreground">
                Edit tech stack
              </h3>
              <button
                onClick={handleClose}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-4">
              <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search or add custom skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && customMatch && handleAddCustom()
                  }
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            </div>

            {/* Selected skills */}
            {pendingSkills.length > 0 && (
              <div className="px-5 pt-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Selected ({pendingSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pendingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs text-background"
                    >
                      {skill}
                      <button onClick={() => handleToggle(skill)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div className="max-h-52 overflow-y-auto px-5 py-3">
              {customMatch && (
                <button
                  onClick={handleAddCustom}
                  className="mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add "{search.trim()}"
                </button>
              )}
              <div className="flex flex-wrap gap-1.5">
                {filtered.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleToggle(skill)}
                    className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                  >
                    {skill}
                  </button>
                ))}
                {filtered.length === 0 && !customMatch && (
                  <p className="text-xs text-muted-foreground">No results.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-border/50 px-5 py-4">
              <button
                onClick={handleClose}
                className="rounded-lg border border-border/50 px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-foreground px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
