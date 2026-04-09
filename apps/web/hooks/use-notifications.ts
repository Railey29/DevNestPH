import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: 'FOLLOW' | 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT' | 'REPLY'
  read: boolean
  createdAt: string
  actor: {
    id: string
    name: string
    username: string
    image: string | null
  }
  post?: { id: string; content: string }
  comment?: { id: string; content: string }
}

export function useNotifications() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    // Don't fetch if not authenticated
    if (status !== 'authenticated') {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/notifications')

      // Check if response is OK
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      // Ensure data is an array
      const notificationsArray = Array.isArray(data) ? data : []
      setNotifications(notificationsArray)
      setUnreadCount(notificationsArray.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [status])

  const markAsRead = useCallback(async () => {
    if (status !== 'authenticated' || unreadCount === 0) return

    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }, [status, unreadCount])

  useEffect(() => {
    fetchNotifications()

    // Poll every 30 seconds only if authenticated
    if (status === 'authenticated') {
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [fetchNotifications, status])

  return { notifications, unreadCount, loading, markAsRead, refetch: fetchNotifications }
}
