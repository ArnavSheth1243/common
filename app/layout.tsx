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
  title: "Common — Find Something to Do",
  description:
    "Thousands of recurring activities with real people. Pick one, join a pod, and show up together. Running, reading, cooking, coding — whatever you're into.",
  keywords: ["activities", "pods", "recurring events", "things to do", "group activities", "streaks"],
  openGraph: {
    title: "Common — Find Something to Do",
    description: "Thousands of recurring activities with real people. Pick one, join a pod, show up.",
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
