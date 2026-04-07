export const dynamic = "force-dynamic"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar-feed"
import { FeedClient } from "@/components/feed/feed-client"

async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true, username: true, image: true } },
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  })
}

async function getFollowingPosts(userId: string) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const followingIds = following.map((f) => f.followingId)

  return prisma.post.findMany({
    where: { authorId: { in: followingIds } },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true, username: true, image: true } },
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  })
}

export default async function FeedPage() {
  const session = await auth()
  const currentUserId = (session?.user as { id?: string })?.id ?? null

  const [allPosts, followingPosts] = await Promise.all([
    getAllPosts(),
    currentUserId ? getFollowingPosts(currentUserId) : Promise.resolve([]),
  ])

  const user = {
    name: session?.user?.name ?? "User",
    image: session?.user?.image ?? null,
    username: (session?.user as { username?: string })?.username ?? "",
  }

  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <FeedClient
        allPosts={allPosts}
        followingPosts={followingPosts}
        currentUserId={currentUserId}
        user={user}
      />
    </div>
  )
}
