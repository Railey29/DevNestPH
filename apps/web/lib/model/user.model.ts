// lib/models/user.model.ts
import { prisma } from '@/lib/prisma'

export class UserModel {
  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, username: true, email: true, image: true }
    })
  }

  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, username: true, email: true, image: true }
    })
  }
}
