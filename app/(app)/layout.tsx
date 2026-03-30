"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  Compass,
  PlusCircle,
  User,
  Flame,
  FolderUser,
  List,
  X,
} from "@phosphor-icons/react"
import { UserStatsProvider, useUserStats } from "@/app/context/user-stats"
import { UserProfileProvider, useUserProfile } from "@/app/context/user-profile"
import { PodStateProvider } from "@/app/context/pod-state"
import { MessagesProvider } from "@/app/context/messages"
import { MedalsProvider } from "@/app/context/medals"
const navItems = [
  { href: "/dashboard",   label: "Home",       icon: House },
  { href: "/pods",        label: "Pods",       icon: Compass },
  { href: "/checkin",     label: "Check In",   icon: PlusCircle },
  { href: "/my-pods",     label: "My Pods",    icon: FolderUser },
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

function NavItemLink({ item, active, onClick }: { item: typeof navItems[0]; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
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
        {navItems.map((item) => (
          <NavItemLink key={item.href} item={item} active={pathname === item.href} />
        ))}
      </nav>

      <SidebarStreakFooter />
    </aside>
  )
}

function MobileMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* Hamburger button — fixed top-left */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-zinc-900/90 backdrop-blur-lg rounded-xl flex items-center justify-center shadow-lg border border-white/10 transition-all active:scale-95"
        aria-label="Open menu"
      >
        <List size={20} className="text-[#f5f0e6]" />
      </button>

      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-out sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-zinc-900 z-[70] py-8 px-4 transform transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

        {/* Header with close button */}
        <div className="flex items-center justify-between mb-10 px-3 relative">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <img src="/logo.svg" alt="Common" className="w-6 h-6 opacity-90" />
            <span className="text-[17px] font-bold text-[#f5f0e6] tracking-tight">
              Common
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-[#f5f0e6] hover:bg-white/8 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 relative overflow-y-auto max-h-[calc(100dvh-200px)]">
          {navItems.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <SidebarStreakFooter />
        </div>
      </aside>
    </>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#ede9df] relative">
      <Sidebar />
      <MobileMenu />
      <main className="lg:pl-64 min-h-[100dvh] relative z-10 overflow-x-hidden">
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
