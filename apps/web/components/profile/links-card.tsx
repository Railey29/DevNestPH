"use client"

import { Github, Globe, Twitter, Linkedin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export type LinkType = "github" | "portfolio" | "twitter" | "linkedin" | "other"

export interface ProfileLink {
  type: LinkType
  url: string
  label?: string
}

interface LinksCardProps {
  links: ProfileLink[]
  className?: string
}

const linkConfig: Record<
  LinkType,
  { icon: React.ElementType; defaultLabel: string }
> = {
  github: { icon: Github, defaultLabel: "GitHub" },
  portfolio: { icon: Globe, defaultLabel: "Portfolio" },
  twitter: { icon: Twitter, defaultLabel: "Twitter / X" },
  linkedin: { icon: Linkedin, defaultLabel: "LinkedIn" },
  other: { icon: ExternalLink, defaultLabel: "Link" },
}

function formatUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "")
}

export function LinksCard({ links, className }: LinksCardProps) {
  if (links.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card px-5 py-4",
        className
      )}
    >
      <h2 className="mb-3 text-sm font-medium text-foreground">Links</h2>

      <div className="flex flex-col gap-2.5">
        {links.map((link, i) => {
          const { icon: Icon, defaultLabel } = linkConfig[link.type]
          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-muted/50 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-primary group-hover:underline">
                  {formatUrl(link.url)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {link.label ?? defaultLabel}
                </p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
