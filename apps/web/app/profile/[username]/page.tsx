import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar-feed"
import { ProfileCover } from "@/components/profile/profile-cover"
import { ProfileHeader } from "@/components/profile/profile-header"
import { TechStackCard } from "@/components/profile/tech-stack-card"
import { LinksCard } from "@/components/profile/links-card"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { PostCard } from "@/components/post/post-card"
import { ProfileCreatePost } from "@/components/post/profile-create-post"

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

async function getUserByUsername(username: string) {
  return prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: username, mode: "insensitive" } },
        { id: username },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      coverImage: true,
      techStack: true,
      bio: true,
      location: true,
      company: true,
      website: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  })
}

async function getUserPosts(userId: string) {
  return prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true },
      },
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

async function getIsFollowing(currentUserId: string, targetUserId: string) {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  })
  return !!follow
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const [user, session] = await Promise.all([
    getUserByUsername(username),
    auth(),
  ])

  if (!user) notFound()

  const currentUserId = (session?.user as { id?: string })?.id ?? null
  const isOwner = currentUserId === user.id

  const [posts, isFollowing] = await Promise.all([
    getUserPosts(user.id),
    currentUserId && !isOwner
      ? getIsFollowing(currentUserId, user.id)
      : Promise.resolve(false),
  ])

  const joinedAt = user.createdAt.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  })

  const stats = {
    posts: user._count.posts,
    followers: user._count.following,
    following: user._count.followers,
  }

  const sessionUser = isOwner
    ? {
        name: session?.user?.name ?? user.name ?? "User",
        image: session?.user?.image ?? user.image ?? null,
        username: user.username ?? "",
      }
    : null

  const postsContent = (
    <div className="flex flex-col gap-3">
      {isOwner && sessionUser && <ProfileCreatePost user={sessionUser} />}
      {posts.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No posts yet.
        </p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))
      )}
    </div>
  )

  const repliesContent = (
    <p className="py-10 text-center text-sm text-muted-foreground">
      No replies yet.
    </p>
  )

  const savedContent = (
    <p className="py-10 text-center text-sm text-muted-foreground">
      No saved posts yet.
    </p>
  )

  return (
    <div className="min-h-svh bg-background">
      <Navbar />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            <ProfileCover
              coverUrl={user.coverImage ?? null}
              editable={isOwner}
            />

            <ProfileHeader
              name={user.name ?? user.username ?? "User"}
              username={user.username ?? ""}
              bio={user.bio}
              location={user.location}
              company={user.company}
              website={user.website}
              joinedAt={joinedAt}
              avatarUrl={user.image}
              isOwner={isOwner}
              isFollowing={isFollowing}
              targetUserId={user.id}
              stats={stats}
            />

            <ProfileTabs
              isOwner={isOwner}
              className="mt-4"
              posts={postsContent}
              replies={repliesContent}
              saved={savedContent}
            />
          </div>

          {/* Sidebar — hidden on mobile */}
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 flex flex-col gap-4 pt-1">
              <TechStackCard skills={user.techStack} editable={isOwner} />
              <LinksCard links={[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
