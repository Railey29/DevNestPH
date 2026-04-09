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

    const { content } = await req.json()
    const { postId } = params

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, username: true, image: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get post author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: currentUser.id,
        postId: postId,
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

    // ✅ CREATE NOTIFICATION for post author (if not commenting on own post)
    if (post.authorId !== currentUser.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: post.authorId,      // Post owner (receiver)
          actorId: currentUser.id,    // Commenter (sender)
          type: 'COMMENT',
          postId: postId,
          read: false,
        },
      })
      console.log('✅ Notification created for comment:', notification)
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Comment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
