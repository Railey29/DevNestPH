// app/api/notifications/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'  // Import from your custom auth
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json([])
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json([])
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        post: {
          select: {
            id: true,
            content: true
          }
        },
        comment: {
          select: {
            id: true,
            content: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json([])
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ success: true })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (user) {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          read: false
        },
        data: { read: true }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/notifications error:', error)
    return NextResponse.json({ success: true })
  }
}
