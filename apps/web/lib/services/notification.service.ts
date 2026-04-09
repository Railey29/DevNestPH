import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

export class NotificationService {
  static async create({
    userId,
    actorId,
    type,
    postId,
    commentId,
  }: {
    userId: string
    actorId: string
    type: NotificationType
    postId?: string
    commentId?: string
  }) {
    // Don't create notification if user is notifying themselves
    if (userId === actorId) return null

    // Check if notification already exists (for likes, to avoid duplicate)
    if (type === 'LIKE_POST' && postId) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          actorId,
          type,
          postId,
        },
      })
      if (existing) return null
    }

    return await prisma.notification.create({
      data: {
        userId,
        actorId,
        type,
        postId,
        commentId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    })
  }

  static async deleteByType({
    userId,
    actorId,
    type,
    postId,
  }: {
    userId: string
    actorId: string
    type: NotificationType
    postId: string
  }) {
    // For when someone unlikes a post
    return await prisma.notification.deleteMany({
      where: {
        userId,
        actorId,
        type,
        postId,
      },
    })
  }
}
