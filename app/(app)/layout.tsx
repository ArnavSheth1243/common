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
  CalendarBlank,
  ChartLineUp,
  ChatCircle,
  UsersThree,
  Lightning,
  FolderUser,
  List,
  X,
} from "@phosphor-icons/react"
import { UserStatsProvider, useUserStats } from "@/app/context/user-stats"
import { UserProfileProvider, useUserProfile } from "@/app/context/user-profile"
import { PodStateProvider } from "@/app/context/pod-state"
import { MessagesProvider, useMessages } from "@/app/context/messages"
import { MedalsProvider } from "@/app/context/medals"
import { BottomNav } from "@/components/ui/bottom-nav"
import { UserAvatar } from "@/components/ui/user-avatar"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",   label: "Home",       icon: House },
  { href: "/pods",        label: "Explore",    icon: Compass },
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

  return (
    <div className="border-t border-zinc-100 pt-4 px-1">
      <Link
        href="/profile"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors"
      >
        <UserAvatar
          name={profile.displayName || ""}
          imageUrl={profile.avatarUrl}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {profile.displayName}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
            <Flame size={10} weight="fill" className="text-violet-500" />
            <span>{totalCheckins} check-ins</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

function NavItemLink({
  item,
  active,
  onClick,
  unreadCount,
}: {
  item: (typeof navItems)[0]
  active: boolean
  onClick?: () => void
  unreadCount?: number
}) {
  const isMessages = item.href === "/messages"
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative",
        active
          ? "bg-zinc-100 text-foreground"
          : "text-zinc-500 hover:text-foreground hover:bg-zinc-50",
      )}
    >
      <item.icon
        size={18}
        weight={active ? "fill" : "regular"}
        className={active ? "text-violet-600" : ""}
      />
      {item.label}
      {isMessages && unreadCount && unreadCount > 0 ? (
        <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full px-1">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}

function Sidebar() {
  const pathname = usePathname()
  const { unreadCount } = useMessages()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-white z-40 py-6 px-3 border-r border-border">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 mb-8 px-3"
      >
        <img src="/logo.svg" alt="Common" className="w-6 h-6" />
        <span className="text-base font-bold text-foreground tracking-tight">
          Common
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => (
          <NavItemLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
            unreadCount={unreadCount}
          />
        ))}
      </nav>

      <SidebarStreakFooter />
    </aside>
  )
}

function MobileHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { unreadCount } = useMessages()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-12 px-4 bg-white/80 backdrop-blur-xl border-b border-border/60">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Common" className="w-5 h-5" />
          <span className="text-sm font-bold text-foreground tracking-tight">
            Common
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-foreground hover:bg-zinc-100 transition-colors"
          aria-label="Open menu"
        >
          <List size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-3 w-2 h-2 bg-rose-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setOpen(false)}
      />

      {/* Slide-out */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 right-0 h-full w-72 bg-white z-[70] py-6 px-3 transform transition-transform duration-200 ease-out shadow-3",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between mb-6 px-3">
          <span className="text-sm font-bold text-foreground">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-foreground hover:bg-zinc-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-0.5 overflow-y-auto max-h-[calc(100dvh-120px)]">
          {navItems.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              active={pathname === item.href || pathname.startsWith(item.href + "/")}
              onClick={() => setOpen(false)}
              unreadCount={unreadCount}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          <SidebarStreakFooter />
        </div>
      </aside>
    </>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      <Sidebar />
      <MobileHeader />
      <main className="lg:pl-60 min-h-[100dvh] pb-16 lg:pb-0">
        {children}
      </main>
      <BottomNav />
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
