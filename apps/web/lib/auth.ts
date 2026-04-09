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

        // Return user with all necessary fields
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
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

    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign in - get complete user data from database
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            email: true
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.name = dbUser.name ?? dbUser.username ?? "User"
          token.username = dbUser.username
          token.email = dbUser.email
          token.picture = dbUser.image ?? null
        }
      }

      // GitHub sign in
      if (account?.provider === "github" && profile) {
        token.name = (profile.name ?? profile.login) as string
        token.picture = profile.avatar_url as string

        // Update database with GitHub data
        if (token.email) {
          await prisma.user.update({
            where: { email: token.email as string },
            data: {
              name: token.name as string,
              image: token.picture as string,
              username: (profile.login as string) ?? token.username as string,
            }
          })
        }
      }

      // Session update
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name
        if (session.image) token.picture = session.image
        if (session.username) token.username = session.username
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
        ;(session.user as any).username = token.username as string
      }
      return session
    },
  },
})

// Export getServerSession
export async function getServerSession() {
  return await auth()
}
