'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleFollow(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!currentUser) {
    throw new Error("User not found")
  }

  if (currentUser.id === targetUserId) {
    throw new Error("Cannot follow yourself")
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
    },
  })

  if (existingFollow) {
    // UNFOLLOW
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    })

    // Delete notification
    await prisma.notification.deleteMany({
      where: {
        userId: targetUserId,
        actorId: currentUser.id,
        type: 'FOLLOW',
      },
    })

    revalidatePath(`/profile/${targetUserId}`)
    return { following: false }
  } else {
    // FOLLOW
    await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
    })

    // ✅ CREATE NOTIFICATION
    await prisma.notification.create({
      data: {
        userId: targetUserId,        // The person being followed (receiver)
        actorId: currentUser.id,     // The follower (sender)
        type: 'FOLLOW',
        read: false,
      },
    })

    console.log(`✅ Notification created: ${currentUser.id} followed ${targetUserId}`)

    revalidatePath(`/profile/${targetUserId}`)
    return { following: true }
  }
}
