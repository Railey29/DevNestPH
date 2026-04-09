// lib/actions/post.ts
'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ============ CREATE POST ============
export async function createPost(content: string, imageUrl?: string | null, tags: string[] = []) {
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
    select: { id: true }
  })

  if (!currentUser) {
    throw new Error("User not found")
  }

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: currentUser.id,
        postId: postId,
      },
    },
  })

  if (existingLike) {
    // UNLIKE
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId: postId,
        },
      },
    })

    // Delete notification
    await prisma.notification.deleteMany({
      where: {
        actorId: currentUser.id,
        postId: postId,
        type: 'LIKE_POST',
      },
    })

    revalidatePath(`/post/${postId}`)
    return { liked: false }
  } else {
    // LIKE
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
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

    // CREATE NOTIFICATION (if not liking own post)
    if (post.authorId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: currentUser.id,
          type: 'LIKE_POST',
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

// ============ CREATE COMMENT (with reply support) ============
export async function createComment(postId: string, content: string, parentCommentId?: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, username: true, image: true }
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
      postId: postId,
    },
  })

  // ✅ CREATE NOTIFICATION for post author (if not commenting on own post)
  if (post.authorId !== currentUser.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: currentUser.id,
        type: 'COMMENT',
        postId: postId,
        read: false,
      },
    })
    console.log(`✅ Comment notification created for post author: ${post.authorId}`)
  }

  // ✅ CREATE NOTIFICATION for parent comment author (if replying to a comment)
  if (parentCommentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentCommentId },
      select: { authorId: true, content: true }
    })

    if (parentComment && parentComment.authorId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          userId: parentComment.authorId,
          actorId: currentUser.id,
          type: 'REPLY',
          postId: postId,
          commentId: parentCommentId,
          read: false,
        },
      })
      console.log(`✅ Reply notification created for comment author: ${parentComment.authorId}`)
    }
  }

  // Extract mentions from content (users tagged with @)
  const mentionRegex = /@(\w+)/g
  const mentions = content.match(mentionRegex)

  if (mentions) {
    for (const mention of mentions) {
      const username = mention.slice(1) // Remove @ symbol
      const mentionedUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
      })

      if (mentionedUser && mentionedUser.id !== currentUser.id) {
        await prisma.notification.create({
          data: {
            userId: mentionedUser.id,
            actorId: currentUser.id,
            type: 'COMMENT',
            postId: postId,
            read: false,
          },
        })
        console.log(`✅ Mention notification created for user: ${mentionedUser.id}`)
      }
    }
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
    select: { id: true }
  })

  if (!currentUser) {
    throw new Error("User not found")
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  })

  if (!post || post.authorId !== currentUser.id) {
    throw new Error("Unauthorized to delete this post")
  }

  // Delete post (cascade will delete likes, comments, and notifications)
  await prisma.post.delete({
    where: { id: postId },
  })

  revalidatePath(`/profile/${currentUser.id}`)
  revalidatePath("/feed")
  return { success: true }
}
