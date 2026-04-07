import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail", // <-- palitan ito
  auth: {
    user: process.env.GMAIL_USER, // <-- palitan
    pass: process.env.GMAIL_APP_PASSWORD, // <-- palitan
  },
})

export async function sendVerificationCode(email: string, code: string) {
  await transporter.sendMail({
    from: `"DevNest PH" <${process.env.GMAIL_USER}>`, // <-- palitan
    to: email,
    subject: "Your Verification Code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Verify your email</h2>
        <p>Use the code below to complete your registration:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 24px; background: #f4f4f4; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 16px;">
          This code expires in 10 minutes. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  })
}
