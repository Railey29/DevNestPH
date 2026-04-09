"use server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"
import { revalidatePath } from "next/cache"

function extractMentions(content: string): string[] {
  const regex = /@(\w+)/g
  const matches = [...content.matchAll(regex)]
  return [...new Set(matches.map((m) => m[1] as string))]
}

export async function createComment(postId: string, content: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, username: true },
  })
  if (!currentUser) {
    throw new Error("User not found")
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  })
  if (!post) {
    throw new Error("Post not found")
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: currentUser.id,
      postId,
    },
  })

  if (post.authorId !== currentUser.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: currentUser.id,
        type: NotificationType.COMMENT,
        postId: postId,
        commentId: comment.id,
        read: false,
      },
    })
    console.log(`✅ COMMENT notification created`)
  }

  const mentionedUsernames = extractMentions(content)

  if (mentionedUsernames.length > 0) {
    const mentionedUsers = await prisma.user.findMany({
      where: {
        username: { in: mentionedUsernames },
        id: { not: currentUser.id },
      },
      select: { id: true },
    })

    const usersToNotify = mentionedUsers.filter(
      (user) => user.id !== post.authorId
    )

    await Promise.all(
      usersToNotify.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            actorId: currentUser.id,
            type: NotificationType.MENTION,
            postId,
            read: false,
          },
        })
      )
    )

    console.log(
      `✅ MENTION notifications sent to: ${mentionedUsernames.join(", ")}`
    )
  }

  revalidatePath(`/post/${postId}`)
  return comment
}
