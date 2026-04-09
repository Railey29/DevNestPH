// lib/actions/post.ts
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

// ============ CREATE POST ============
export async function createPost(
  content: string,
  imageUrl?: string | null,
  tags: string[] = []
) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, username: true },
  })

  if (!currentUser) {
    throw new Error("User not found")
  }

  const post = await prisma.post.create({
    data: {
      content,
      imageUrl,
      tags,
      authorId: currentUser.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  })

  // ✅ MENTION notifications sa post content
  const mentionedUsernames = extractMentions(content)

  if (mentionedUsernames.length > 0) {
    const mentionedUsers = await prisma.user.findMany({
      where: {
        username: { in: mentionedUsernames },
        id: { not: currentUser.id },
      },
      select: { id: true },
    })

    await Promise.all(
      mentionedUsers.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            actorId: currentUser.id,
            type: NotificationType.MENTION,
            postId: post.id,
            read: false,
          },
        })
      )
    )

    console.log(
      `✅ MENTION notifications sent to: ${mentionedUsernames.join(", ")}`
    )
  }

  revalidatePath("/feed")
  revalidatePath(`/profile/${currentUser.id}`)

  return post
}

// ============ TOGGLE LIKE ============
export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!currentUser) {
    throw new Error("User not found")
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: currentUser.id,
        postId: postId,
      },
    },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId: postId,
        },
      },
    })

    await prisma.notification.deleteMany({
      where: {
        actorId: currentUser.id,
        postId: postId,
        type: NotificationType.LIKE_POST,
      },
    })

    revalidatePath(`/post/${postId}`)
    return { liked: false }
  } else {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      throw new Error("Post not found")
    }

    await prisma.like.create({
      data: {
        userId: currentUser.id,
        postId: postId,
      },
    })

    if (post.authorId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: currentUser.id,
          type: NotificationType.LIKE_POST,
          postId: postId,
          read: false,
        },
      })
      console.log(`✅ Like notification created for post ${postId}`)
    }

    revalidatePath(`/post/${postId}`)
    return { liked: true }
  }
}

// ============ CREATE COMMENT ============
export async function createComment(
  postId: string,
  content: string,
  parentCommentId?: string
) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, username: true, image: true },
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
      postId: postId,
    },
  })

  // ✅ COMMENT notification sa post author
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
    console.log(
      `✅ Comment notification created for post author: ${post.authorId}`
    )
  }

  // ✅ REPLY notification sa parent comment author
  if (parentCommentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentCommentId },
      select: { authorId: true },
    })

    if (parentComment && parentComment.authorId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          userId: parentComment.authorId,
          actorId: currentUser.id,
          type: NotificationType.REPLY,
          postId: postId,
          commentId: parentCommentId,
          read: false,
        },
      })
      console.log(
        `✅ Reply notification created for: ${parentComment.authorId}`
      )
    }
  }

  // ✅ MENTION notifications sa mga na-mention sa comment
  const mentionedUsernames = extractMentions(content)

  if (mentionedUsernames.length > 0) {
    const mentionedUsers = await prisma.user.findMany({
      where: {
        username: { in: mentionedUsernames },
        id: { not: currentUser.id },
      },
      select: { id: true },
    })

    // Iwasan ang duplicate — skip ang post author kung na-COMMENT notify na
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
            postId: postId,
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

// ============ DELETE POST ============
export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!currentUser) {
    throw new Error("User not found")
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  })

  if (!post || post.authorId !== currentUser.id) {
    throw new Error("Unauthorized to delete this post")
  }

  await prisma.post.delete({
    where: { id: postId },
  })

  revalidatePath(`/profile/${currentUser.id}`)
  revalidatePath("/feed")
  return { success: true }
}
