import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    console.log('=== FOLLOW API CALLED ===')

    const session = await getServerSession()
    console.log('1. Session:', session?.user?.email)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { followingId } = await req.json()
    console.log('2. followingId:', followingId)

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, username: true }
    })
    console.log('3. currentUser:', currentUser?.id)

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: followingId,
        },
      },
    })
    console.log('4. existingFollow:', existingFollow ? 'YES' : 'NO')

    if (existingFollow) {
      console.log('5. UNFOLLOW path')
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: followingId,
          },
        },
      })

      await prisma.notification.deleteMany({
        where: {
          userId: followingId,
          actorId: currentUser.id,
          type: 'FOLLOW',
        },
      })

      return NextResponse.json({ following: false })
    } else {
      console.log('5. FOLLOW path - creating follow')

      // FOLLOW - Create follow record
      await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: followingId,
        },
      })
      console.log('6. Follow record created')

      console.log('7. Creating notification...')
      // CREATE NOTIFICATION
      const notification = await prisma.notification.create({
        data: {
          userId: followingId,
          actorId: currentUser.id,
          type: 'FOLLOW',
          read: false,
        },
      })
      console.log('8. ✅ Notification created:', notification)

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('❌ FOLLOW API ERROR:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
