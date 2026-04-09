// components/notification-dropdown.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '@/hooks/use-notifications'
import { PostModal } from '@/components/post/post-modal'
import { formatDistanceToNow } from 'date-fns'

export function NotificationDropdown() {
  const { status, data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { notifications, unreadCount, loading, markAsRead, refetch } = useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentUserId = (session?.user as any)?.id

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    if (status !== 'authenticated') return
    setIsOpen(!isOpen)
    if (!isOpen && unreadCount > 0) {
      markAsRead()
    }
  }

  const handleNotificationClick = (notif: any) => {
    setIsOpen(false)

    // For follow notifications, navigate to profile
    if (notif.type === 'FOLLOW') {
      window.location.href = `/profile/${notif.actor?.username || notif.actor?.id}`
      return
    }

    // For post-related notifications (like, comment), open modal
    if (notif.post?.id) {
      setSelectedPostId(notif.post.id)
      setIsModalOpen(true)
    }
  }

  const getNotificationText = (notif: any) => {
    const actorName = notif.actor?.username || notif.actor?.name || 'Someone'

    switch (notif.type) {
      case 'FOLLOW':
        return `${actorName} started following you`
      case 'LIKE_POST':
        return `${actorName} liked your post`
      case 'LIKE_COMMENT':
        return `${actorName} liked your comment`
      case 'COMMENT':
        return `${actorName} commented on your post`
      case 'REPLY':
        return `${actorName} replied to your comment`
      default:
        return `${actorName} interacted with you`
    }
  }

  // Don't render if not authenticated
  if (status !== 'authenticated') {
    return null
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleOpen}
          className="relative flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-muted"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border bg-background shadow-lg z-50 max-h-[500px] overflow-y-auto">
            <div className="border-b px-4 py-3 sticky top-0 bg-background flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => refetch()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Refresh
                </button>
              )}
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  <div className="animate-pulse">Loading...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  <svg
                    className="mx-auto size-8 mb-2 text-muted-foreground/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">When someone interacts with you, it will show up here</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left block px-4 py-3 transition-colors hover:bg-muted ${
                      !notif.read ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {notif.actor.image ? (
                        <img
                          src={notif.actor.image}
                          alt=""
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {notif.actor.name?.[0] || notif.actor.username?.[0] || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{getNotificationText(notif)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                        {notif.post && notif.post.content && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {notif.post.content.slice(0, 60)}...
                          </p>
                        )}
                      </div>
                      {!notif.read && (
                        <div className="size-2 rounded-full bg-blue-500 mt-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post Modal */}
      <PostModal
        postId={selectedPostId || ''}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPostId(null)
        }}
        currentUserId={currentUserId}
      />
    </>
  )
}
