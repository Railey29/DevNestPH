// apps/web/app/feed/loading.tsx

import { Navbar } from "@/components/navbar-feed"

function PostSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-border bg-card p-4">
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="ml-auto h-3 w-14 rounded bg-muted" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-4/5 rounded bg-muted" />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-1">
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-3 w-10 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function FeedLoading() {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        {/* Tabs skeleton */}
        <div className="flex gap-6 border-b border-border pb-2">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>

        {/* Post skeletons */}
        {Array.from({ length: 4 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
