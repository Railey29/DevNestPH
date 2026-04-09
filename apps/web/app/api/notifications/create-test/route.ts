import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first two users from database
    const users = await prisma.user.findMany({
      take: 2,
      select: { id: true, name: true, email: true }
    })

    if (users.length < 2) {
      return NextResponse.json({
        error: 'Need at least 2 users in database',
        users: users
      })
    }

    // Create test notification
    const notification = await prisma.notification.create({
      data: {
        userId: users[0].id,      // First user receives notification
        actorId: users[1].id,     // Second user performs action
        type: 'FOLLOW',
        read: false,
      },
      include: {
        actor: {
          select: { name: true, username: true, image: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      notification,
      message: `✅ Test notification created! ${users[1].name} followed ${users[0].name}`
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Failed to create notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
