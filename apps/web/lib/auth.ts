import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
        return false // redirect to /auth/login
      }

      return true
    },

    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign in
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
      // GitHub sign in
      if (account?.provider === "github" && profile) {
        token.name = (profile.name ?? profile.login) as string
        token.picture = profile.avatar_url as string
      }
      // Session update — triggered by update() call sa client
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
})
