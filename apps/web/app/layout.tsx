import { Geist_Mono, Figtree } from "next/font/google"
import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sileo"
import { cn } from "@workspace/ui/lib/utils"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: {
    template: "%s | DevNest PH",
    default: "DevNest PH",
  },
  description: "A social media platform for Filipino developers",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        figtree.variable
      )}
    >
      <body>
        <SessionProvider>
          <ThemeProvider>
            <Toaster position="top-center" />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
