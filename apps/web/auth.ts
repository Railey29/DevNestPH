import NextAuth, { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import type { NextAuthResult } from "next-auth"

const prisma = new PrismaClient()

async function generateUniqueUsername(base: string): Promise<string> {
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || "user"
  const existing = await prisma.user.findUnique({ where: { username: slug } })
  if (!existing) return slug
  return `${slug}${Math.floor(Math.random() * 9999)}`
}

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      async profile(profile) {
        const username = await generateUniqueUsername(
          profile.login ?? profile.name ?? "user"
        )
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username,
        }
      },
    }),
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
    // ✅ ADDED: authorized callback para sa route protection
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = ["/feed", "/profile", "/settings"].some((path) =>
        nextUrl.pathname.startsWith(path)
      )
      if (isProtectedRoute && !isLoggedIn) {
        return false
      }
      return true
    },

    async redirect({ url, baseUrl }) {
      return `${baseUrl}/feed`
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, username: true },
        })
        if (dbUser && !dbUser.username) {
          const base =
            (profile.login as string) ?? (profile.name as string) ?? "user"
          const username = await generateUniqueUsername(base)
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { username },
          })
        }
      }
      return true
    },

    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, name: true, username: true, image: true },
        })
        token.id = dbUser?.id
        token.name = dbUser?.name ?? dbUser?.username ?? "User"
        token.picture = dbUser?.image ?? null
        token.username = dbUser?.username ?? null
      }

      if (account?.provider === "github" && profile) {
        token.name = (profile.name ?? profile.login) as string
        token.picture = profile.avatar_url as string
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { username: true },
          })
          token.username = dbUser?.username ?? token.username
        }
      }

      if (trigger === "update" && session?.image) {
        token.picture = session.image
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).username = token.username as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
}

const result: NextAuthResult = NextAuth(config)
export const handlers = result.handlers
export const signIn = result.signIn
export const signOut = result.signOut
export const auth = result.auth
