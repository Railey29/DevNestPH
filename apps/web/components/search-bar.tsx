"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, FileText, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchUser {
  id: string
  name: string | null
  username: string | null
  image: string | null
  bio: string | null
}

interface SearchPost {
  id: string
  content: string
  tags: string[]
  author: {
    name: string | null
    username: string | null
    image: string | null
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<SearchUser[]>([])
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setUsers([])
      setPosts([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setUsers(data.users ?? [])
      setPosts(data.posts ?? [])
      setOpen(true)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const handleSelect = () => {
    setOpen(false)
    setQuery("")
  }

  const hasResults = users.length > 0 || posts.length > 0

  return (
    <div ref={containerRef} className="relative mx-6 w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search DevNest PH..."
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setOpen(false)
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-10 right-0 left-0 z-50 overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg">
          {loading ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              No results for "{query}"
            </div>
          ) : (
            <>
              {users.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">
                    People
                  </p>
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username ?? user.id}`}
                      onClick={handleSelect}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name ?? ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(user.name ?? user.username ?? "U")
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {user.name ?? user.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{user.username}
                          {user.bio &&
                            ` · ${user.bio.slice(0, 40)}${user.bio.length > 40 ? "..." : ""}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {posts.length > 0 && (
                <div
                  className={
                    users.length > 0 ? "border-t border-border/40" : ""
                  }
                >
                  <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">
                    Posts
                  </p>
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      onClick={handleSelect}
                      className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">
                          {post.author.name ?? post.author.username}
                        </p>
                        <p className="truncate text-sm text-foreground">
                          {post.content.slice(0, 80)}
                          {post.content.length > 80 ? "..." : ""}
                        </p>
                        {post.tags.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs text-primary">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="border-t border-border/40 px-4 py-2.5">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`)
                    handleSelect()
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  View all results for "{query}"
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
