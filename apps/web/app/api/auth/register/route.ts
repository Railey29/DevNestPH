// app/api/auth/register/route.ts
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma" // ✅ Use shared instance
import bcrypt from "bcryptjs"

// ❌ Remove this line
// const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    })

    return NextResponse.json(
      { message: "Account created successfully!", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error during registration:", error)
    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    )
  }
  // ❌ Remove finally block with $disconnect - not needed with shared prisma
}
