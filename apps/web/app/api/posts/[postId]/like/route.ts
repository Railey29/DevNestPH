import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
      // Unlike
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

      return NextResponse.json({ liked: false })
    } else {
      // Get post author
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      })

      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      // Create like
      await prisma.like.create({
        data: {
          userId: currentUser.id,
          postId: postId,
        },
      })

      // ✅ CREATE NOTIFICATION for post author (if not liking own post)
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
        console.log(`✅ Notification created: ${currentUser.id} liked post by ${post.authorId}`)
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get like status
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ liked: false, count: 0 })
    }

    const { postId } = params

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!currentUser) {
      return NextResponse.json({ liked: false, count: 0 })
    }

    const [like, likeCount] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: currentUser.id,
            postId: postId,
          },
        },
      }),
      prisma.like.count({
        where: { postId },
      }),
    ])

    return NextResponse.json({
      liked: !!like,
      count: likeCount,
    })
  } catch (error) {
    console.error('Like status error:', error)
    return NextResponse.json({ liked: false, count: 0 })
  }
}
