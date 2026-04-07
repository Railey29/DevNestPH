// apps/web/app/profile/[username]/loading.tsx

import { Navbar } from "@/components/navbar-feed"

function PostSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="ml-auto h-3 w-14 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-4/5 rounded bg-muted" />
      </div>
      <div className="flex gap-4 pt-1">
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-3 w-10 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function ProfileLoading() {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="min-w-0 flex-1 animate-pulse">
            {/* Cover image skeleton */}
            <div className="h-40 w-full rounded-xl bg-muted sm:h-52" />

            {/* Profile header skeleton */}
            <div className="mt-4 space-y-3">
              {/* Avatar + action button */}
              <div className="flex items-end justify-between">
                <div className="-mt-10 h-20 w-20 rounded-full border-4 border-background bg-muted" />
                <div className="h-9 w-24 rounded-lg bg-muted" />
              </div>

              {/* Name + username */}
              <div className="space-y-1.5">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-4 w-28 rounded bg-muted" />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="h-3.5 w-full rounded bg-muted" />
                <div className="h-3.5 w-3/4 rounded bg-muted" />
              </div>

              {/* Meta info (location, company, joined) */}
              <div className="flex flex-wrap gap-3">
                <div className="h-3.5 w-24 rounded bg-muted" />
                <div className="h-3.5 w-24 rounded bg-muted" />
                <div className="h-3.5 w-24 rounded bg-muted" />
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="mt-4 flex gap-6 border-b border-border pb-2">
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
            </div>

            {/* Posts skeleton */}
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Sidebar skeleton — hidden on mobile */}
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 flex animate-pulse flex-col gap-4 pt-1">
              {/* Tech stack card */}
              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-6 w-16 rounded-full bg-muted" />
                  ))}
                </div>
              </div>

              {/* Links card */}
              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded bg-muted" />
                  <div className="h-3.5 w-4/5 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
