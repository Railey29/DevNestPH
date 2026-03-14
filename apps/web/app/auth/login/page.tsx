"use client"

import { LoginForm } from "@/components/login-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { LayoutBottomIcon } from "@hugeicons/core-free-icons"
import Card from "@/components/right-icon"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <>
      <ThemeToggle />
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <HugeiconsIcon
                  icon={LayoutBottomIcon}
                  strokeWidth={2}
                  className="size-4"
                />
              </div>
              DevNest PH
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative hidden items-center justify-center overflow-hidden bg-white lg:flex dark:bg-black">
          <style>{`
            .tech-bg {
              position: absolute;
              inset: 0;
              background-image: 
                linear-gradient(var(--grid-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
              background-size: 40px 40px;
              animation: grid-move 8s linear infinite;
            }
            @keyframes grid-move {
              0% { background-position: 0 0; }
              100% { background-position: 40px 40px; }
            }
            .tech-glow {
              position: absolute;
              width: 400px;
              height: 400px;
              background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
              border-radius: 50%;
              animation: pulse-glow 4s ease-in-out infinite;
            }
            @keyframes pulse-glow {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.2); opacity: 1; }
            }
            .floating-text {
              position: absolute;
              color: var(--float-color);
              font-family: monospace;
              font-size: 12px;
              white-space: nowrap;
              animation: float-up linear infinite;
              user-select: none;
            }
            @keyframes float-up {
              0% { transform: translateY(100vh); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-100vh); opacity: 0; }
            }

            /* Light mode */
            :root {
              --grid-color: rgba(255, 0, 0, 0.12);
              --glow-color: rgba(255, 0, 0, 0.15);
              --float-color: rgba(255, 0, 0, 0.25);
            }

            /* Dark mode */
            .dark {
              --grid-color: rgba(255, 0, 0, 0.15);
              --glow-color: rgba(255, 0, 0, 0.2);
              --float-color: rgba(255, 0, 0, 0.15);
            }
          `}</style>

          {/* Grid */}
          <div className="tech-bg" />

          {/* Glow */}
          <div className="tech-glow" />

          {/* Floating code texts */}
          <span
            className="floating-text"
            style={{
              left: "5%",
              animationDuration: "10s",
              animationDelay: "0s",
            }}
          >
            const dev = "PH"
          </span>
          <span
            className="floating-text"
            style={{
              left: "20%",
              animationDuration: "14s",
              animationDelay: "2s",
            }}
          >
            npm install devnest
          </span>
          <span
            className="floating-text"
            style={{
              left: "35%",
              animationDuration: "11s",
              animationDelay: "5s",
            }}
          >
            yarn add next@latest
          </span>
          <span
            className="floating-text"
            style={{
              left: "50%",
              animationDuration: "12s",
              animationDelay: "4s",
            }}
          >
            git push origin main
          </span>
          <span
            className="floating-text"
            style={{
              left: "62%",
              animationDuration: "9s",
              animationDelay: "1s",
            }}
          >
            {"<DevNest />"}
          </span>
          <span
            className="floating-text"
            style={{
              left: "75%",
              animationDuration: "13s",
              animationDelay: "3s",
            }}
          >
            npx shadcn@latest add
          </span>
          <span
            className="floating-text"
            style={{
              left: "85%",
              animationDuration: "11s",
              animationDelay: "6s",
            }}
          >
            console.log("🚀")
          </span>
          <span
            className="floating-text"
            style={{
              left: "15%",
              animationDuration: "15s",
              animationDelay: "7s",
            }}
          >
            {"export default function()"}
          </span>
          <span
            className="floating-text"
            style={{
              left: "55%",
              animationDuration: "10s",
              animationDelay: "8s",
            }}
          >
            {"import React from 'react'"}
          </span>
          <span
            className="floating-text"
            style={{
              left: "40%",
              animationDuration: "13s",
              animationDelay: "9s",
            }}
          >
            tailwind.config.ts
          </span>

          {/* Card */}
          <Card />
        </div>
      </div>
    </>
  )
}
