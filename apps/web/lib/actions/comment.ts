'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createComment(postId: string, content: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true }
  })

  if (!currentUser) {
    throw new Error("User not found")
  }

  // Get post author
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  })

  if (!post) {
    throw new Error("Post not found")
  }

  // Create comment
  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: currentUser.id,
      postId,
    },
  })

  // ✅ CREATE NOTIFICATION for post author (if not commenting on own post)
  if (post.authorId !== currentUser.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,      // Post owner (receiver)
        actorId: currentUser.id,    // Commenter (sender)
        type: 'COMMENT',
        postId: postId,
        read: false,
      },
    })
    console.log(`✅ Notification created: ${currentUser.id} commented on post by ${post.authorId}`)
  }

  revalidatePath(`/post/${postId}`)
  return comment
}
