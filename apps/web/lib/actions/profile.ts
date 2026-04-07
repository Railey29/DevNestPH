"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateCoverImage(url: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = (session.user as { id: string }).id
  await prisma.user.update({
    where: { id: userId },
    data: { coverImage: url },
  })
  const username = (session.user as { username?: string }).username
  revalidatePath(`/profile/${username}`)
}

export async function updateAvatarImage(url: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = (session.user as { id: string }).id
  await prisma.user.update({
    where: { id: userId },
    data: { image: url },
  })
  const username = (session.user as { username?: string }).username
  revalidatePath(`/profile/${username}`)
  revalidatePath("/", "layout")
}

export async function updateTechStack(skills: string[]) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = (session.user as { id: string }).id
  await prisma.user.update({
    where: { id: userId },
    data: { techStack: skills },
  })
  const username = (session.user as { username?: string }).username
  revalidatePath(`/profile/${username}`)
}

export async function updateProfile(data: {
  name?: string
  bio?: string
  location?: string
  company?: string
  website?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = (session.user as { id: string }).id
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name || null,
      bio: data.bio || null,
      location: data.location || null,
      company: data.company || null,
      website: data.website || null,
    },
  })
  const username = (session.user as { username?: string }).username
  revalidatePath(`/profile/${username}`)
}
