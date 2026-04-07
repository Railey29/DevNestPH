import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [], posts: [] })
  }

  const [users, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
      },
      take: 5,
    }),
    prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      select: {
        id: true,
        content: true,
        tags: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return NextResponse.json({ users, posts })
}
