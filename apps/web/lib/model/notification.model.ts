// lib/models/notification.model.ts
import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

export class NotificationModel {
  // Create notification
  static async create(data: {
    userId: string
    actorId: string
    type: NotificationType
    postId?: string
    commentId?: string
  }) {
    if (data.userId === data.actorId) return null

    return await prisma.notification.create({
      data: {
        userId: data.userId,
        actorId: data.actorId,
        type: data.type,
        postId: data.postId,
        commentId: data.commentId,
      },
      include: {
        actor: {
          select: { id: true, name: true, username: true, image: true }
        },
        post: { select: { id: true, content: true } },
        comment: { select: { id: true, content: true } }
      }
    })
  }

  // Get user notifications
  static async getByUserId(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      include: {
        actor: { select: { id: true, name: true, username: true, image: true } },
        post: { select: { id: true, content: true } },
        comment: { select: { id: true, content: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  }

  // Mark as read
  static async markAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })
  }

  // Get unread count
  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, read: false }
    })
  }
}
