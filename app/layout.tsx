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
  title: "Common — Better Together",
  description:
    "Build habits and try new things with a small group working toward the same goal. Join a pod, check in daily, and stay accountable.",
  keywords: ["habits", "accountability", "community", "pods", "daily check-in"],
  openGraph: {
    title: "Common — Better Together",
    description: "Build habits and try new things with a small group working toward the same goal.",
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
      <body className="grain antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
