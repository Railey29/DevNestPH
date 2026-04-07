"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createPost(data: {
  content: string
  imageUrl?: string | null
  tags: string[]
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const userId = (session.user as { id: string }).id

  await prisma.post.create({
    data: {
      content: data.content,
      imageUrl: data.imageUrl ?? null,
      tags: data.tags,
      authorId: userId,
    },
  })

  const username = (session.user as { username?: string }).username
  revalidatePath("/feed")
  revalidatePath(`/profile/${username}`)
}

export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const userId = (session.user as { id: string }).id

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existing) {
    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    })
  } else {
    await prisma.like.create({
      data: { userId, postId },
    })
  }

  revalidatePath("/feed")
}

export async function createComment(postId: string, content: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const userId = (session.user as { id: string }).id

  await prisma.comment.create({
    data: {
      content,
      authorId: userId,
      postId,
    },
  })

  revalidatePath("/feed")
}

export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const userId = (session.user as { id: string }).id

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || post.authorId !== userId) throw new Error("Unauthorized")

  await prisma.post.delete({ where: { id: postId } })

  const username = (session.user as { username?: string }).username
  revalidatePath("/feed")
  revalidatePath(`/profile/${username}`)
}
