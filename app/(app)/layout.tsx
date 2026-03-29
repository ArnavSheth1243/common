"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  Compass,
  PlusCircle,
  User,
  Flame,
  CalendarBlank,
  Newspaper,
  ChartLineUp,
  ChatCircle,
  UsersThree,
  Lightning,
  FolderUser,
} from "@phosphor-icons/react"
import { UserStatsProvider, useUserStats } from "@/app/context/user-stats"
import { UserProfileProvider, useUserProfile } from "@/app/context/user-profile"
import { PodStateProvider } from "@/app/context/pod-state"
import { MessagesProvider } from "@/app/context/messages"
import { MedalsProvider } from "@/app/context/medals"
import { FloatingPaths } from "@/components/ui/background-paths"

const navItems = [
  { href: "/dashboard",   label: "Home",       icon: House },
  { href: "/pods",        label: "Pods",       icon: Compass },
  { href: "/my-pods",     label: "My Pods",    icon: FolderUser },
  { href: "/people",      label: "People",     icon: UsersThree },
  { href: "/challenges",  label: "Challenges", icon: Lightning },
  { href: "/checkin",     label: "Check in",   icon: PlusCircle },
  { href: "/tracker",     label: "Tracker",    icon: ChartLineUp },
  { href: "/calendar",    label: "Calendar",   icon: CalendarBlank },
  { href: "/messages",    label: "Messages",   icon: ChatCircle },
  { href: "/profile",     label: "Profile",    icon: User },
]

function SidebarStreakFooter() {
  const { totalCheckins } = useUserStats()
  const { profile } = useUserProfile()
  if (!profile) return null
  const initials = (profile.displayName || "").split(" ").map((w: string) => w[0]).join("").slice(0, 2)
  return (
    <div className="border-t border-white/8 pt-4 px-1">
      <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/8 transition-colors">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#f5f0e6] flex items-center justify-center text-zinc-900 text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#f5f0e6] truncate">{profile.displayName}</div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
            <Flame size={10} weight="fill" className="text-amber-400" />
            <span>{totalCheckins} check-ins</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-zinc-900 z-40 py-8 px-4">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 mb-10 px-3 relative">
        <img src="/logo.svg" alt="Common" className="w-6 h-6 opacity-90" />
        <span className="text-[17px] font-bold text-[#f5f0e6] tracking-tight">
          Common
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 relative">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${active
                  ? "bg-[#f5f0e6] text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-[#f5f0e6] hover:bg-white/6"
                }`}
            >
              <item.icon
                size={17}
                weight={active ? "fill" : "regular"}
                className={active ? "text-zinc-900" : ""}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <SidebarStreakFooter />
    </aside>
  )
}

function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/96 backdrop-blur-xl border-t border-white/8">
      <div className="flex items-center justify-around px-0 py-1 pb-[max(6px,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all duration-200 relative min-w-[44px]"
            >
              <div className={`flex items-center justify-center w-8 h-7 rounded-lg transition-all duration-200 ${active ? "bg-[#f5f0e6]" : ""}`}>
                <item.icon
                  size={18}
                  weight={active ? "fill" : "regular"}
                  className={active ? "text-zinc-900" : "text-zinc-500"}
                />
              </div>
              <span className={`text-[9px] font-semibold transition-colors ${active ? "text-[#f5f0e6]" : "text-zinc-500"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#ede9df] relative">
      {/* Background paths — fixed behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none lg:pl-64">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      <Sidebar />
      <BottomNav />
      <main className="lg:pl-64 pb-24 lg:pb-0 min-h-[100dvh] relative z-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      <UserStatsProvider>
        <PodStateProvider>
          <MessagesProvider>
            <MedalsProvider>
              <AppShell>{children}</AppShell>
            </MedalsProvider>
          </MessagesProvider>
        </PodStateProvider>
      </UserStatsProvider>
    </UserProfileProvider>
  )
}
