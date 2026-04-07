/**
 * Run this script once to generate usernames for existing users without one.
 * Usage: npx tsx scripts/generate-usernames.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function generateUniqueUsername(base: string): Promise<string> {
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || "user"
  const existing = await prisma.user.findUnique({ where: { username: slug } })
  if (!existing) return slug
  const username = `${slug}${Math.floor(Math.random() * 9999)}`
  return username
}

async function main() {
  const usersWithoutUsername = await prisma.user.findMany({
    where: { username: null },
    select: { id: true, name: true, email: true },
  })

  console.log(`Found ${usersWithoutUsername.length} users without username`)

  for (const user of usersWithoutUsername) {
    const base = user.name ?? user.email?.split("@")[0] ?? "user"
    const username = await generateUniqueUsername(base)
    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    })
    console.log(`✓ ${user.name ?? user.email} → @${username}`)
  }

  console.log("Done!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
