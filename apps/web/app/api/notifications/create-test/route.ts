import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get the first two users from database
    const users = await prisma.user.findMany({
      take: 2,
      select: { id: true, name: true, email: true },
    })

    if (users.length < 2) {
      return NextResponse.json({
        error: "Need at least 2 users in database",
        users: users,
      })
    }

    // ✅ Add non-null assertion or explicit check
    const firstUser = users[0]
    const secondUser = users[1]

    if (!firstUser || !secondUser) {
      return NextResponse.json(
        {
          error: "Users not found",
        },
        { status: 400 }
      )
    }

    // Create test notification
    const notification = await prisma.notification.create({
      data: {
        userId: firstUser.id, // ✅ Now TypeScript knows it exists
        actorId: secondUser.id, // ✅ Now TypeScript knows it exists
        type: "FOLLOW",
        read: false,
      },
      include: {
        actor: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      notification,
      message: `✅ Test notification created!`,
    })
  } catch (error) {
    console.error("Error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to create notification",
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create notification",
        details: "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
