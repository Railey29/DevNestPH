import { NextRequest, NextResponse } from "next/server"
import { verifyCode } from "../route"

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and code are required" },
      { status: 400 }
    )
  }

  const isValid = verifyCode(email, code)

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or expired verification code" },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}
