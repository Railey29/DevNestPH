import { NextRequest, NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/mail"

// Temporary in-memory store (use Redis or DB in production)
const codeStore = new Map<string, { code: string; expiresAt: number }>()

export function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function storeCode(email: string, code: string) {
  codeStore.set(email, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  })
}

export function verifyCode(email: string, code: string): boolean {
  const entry = codeStore.get(email)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    codeStore.delete(email)
    return false
  }
  if (entry.code !== code) return false
  codeStore.delete(email)
  return true
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const code = generateCode()
  storeCode(email, code)

  try {
    await sendVerificationCode(email, code)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
