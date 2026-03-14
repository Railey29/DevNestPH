import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function verifyEmail(email: string, code: string) {
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token: code,
      expires: { gt: new Date() },
    },
  })

  if (!token) {
    return { success: false, error: "Invalid or expired code" }
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token: code,
      },
    },
  })

  await prisma.$disconnect()
  return { success: true }
}
