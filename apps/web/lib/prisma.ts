import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we're in development to prevent multiple instances
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Optional: Add error handling for when prisma is not ready
if (!prisma) {
  throw new Error("Prisma client failed to initialize")
}
