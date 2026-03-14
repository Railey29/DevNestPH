import nodemailer from "nodemailer"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(email: string) {
  const code = generateVerificationCode()
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Save to DB
  await prisma.verificationToken.upsert({
    where: {
      identifier_token: {
        identifier: email,
        token: code,
      },
    },
    update: {
      token: code,
      expires,
    },
    create: {
      identifier: email,
      token: code,
      expires,
    },
  })

  // Send email
  await transporter.sendMail({
    from: '"DevNest PH" <noreply@devnestph.com>',
    to: email,
    subject: "Verify your DevNest PH account",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e00;">Welcome to DevNest PH! 🚀</h2>
        <p>Thanks for signing up! Your verification code is:</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #e00;
          text-align: center;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          margin: 20px 0;
        ">
          ${code}
        </div>
        <p style="color: #666; font-size: 12px;">
          This code expires in <strong>15 minutes</strong>.<br/>
          If you did not sign up, ignore this email.
        </p>
      </div>
    `,
  })

  await prisma.$disconnect()
  return { success: true }
}
