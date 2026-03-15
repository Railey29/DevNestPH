import NextAuth, { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import type { NextAuthResult } from "next-auth"

const prisma = new PrismaClient()

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return user
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/feed`
    },
  },
}

const result: NextAuthResult = NextAuth(config)

export const handlers = result.handlers
export const signIn = result.signIn
export const signOut = result.signOut
export const auth = result.auth
