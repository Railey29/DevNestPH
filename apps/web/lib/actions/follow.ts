"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleFollow(targetUserId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const followerId = (session.user as { id: string }).id

  if (followerId === targetUserId) throw new Error("Cannot follow yourself")

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId: targetUserId },
    },
  })

  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId: targetUserId },
      },
    })
  } else {
    await prisma.follow.create({
      data: { followerId, followingId: targetUserId },
    })
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { username: true },
  })

  revalidatePath(`/profile/${targetUser?.username}`)
  revalidatePath("/feed")
}

export async function getFollowStatus(targetUserId: string) {
  const session = await auth()
  if (!session?.user) return false

  const followerId = (session.user as { id: string }).id

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId: targetUserId },
    },
  })

  return !!existing
}
