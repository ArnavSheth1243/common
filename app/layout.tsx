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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
