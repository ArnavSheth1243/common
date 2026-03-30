import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { SessionProvider } from "@/app/context/session"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Common — Your Solution to Accountability",
  description:
    "Join a pod of 3-7 people pursuing the same goal. Check in daily. Build streaks. The social pressure keeps you going.",
  keywords: ["accountability", "habits", "pods", "streaks", "social commitment", "daily check-in"],
  openGraph: {
    title: "Common — Your Solution to Accountability",
    description: "Join a pod. Check in daily. The group keeps you going.",
    type: "website",
  },
}

// Flip to false when you're ready to go live
const MAINTENANCE_MODE = true

function MaintenanceScreen() {
  return (
    <div className="min-h-[100dvh] bg-[#ede9df] flex flex-col items-center justify-center px-6 text-center">
      <img src="/logo.svg" alt="Common" className="w-10 h-10 mb-6 opacity-60" />
      <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">We&apos;re tuning things up</h1>
      <p className="text-sm text-zinc-500 max-w-[30ch] leading-relaxed">
        Common is being updated. We&apos;ll be back shortly.
      </p>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased">
        {MAINTENANCE_MODE ? <MaintenanceScreen /> : <SessionProvider>{children}</SessionProvider>}
      </body>
    </html>
  )
}
