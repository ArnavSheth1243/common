"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  Compass,
  PlusCircle,
  UsersThree,
  User,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/pods",      label: "Pods", icon: Compass },
  { href: "/checkin",   label: "Check in", icon: PlusCircle, accent: true },
  { href: "/people",    label: "People", icon: UsersThree },
  { href: "/profile",   label: "Profile", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/")
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors",
                tab.accent && !active && "text-primary",
                active
                  ? "text-foreground"
                  : !tab.accent && "text-muted-foreground",
              )}
            >
              {tab.accent ? (
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-2xl -mt-4 shadow-2 transition-all",
                  active ? "bg-primary" : "bg-primary",
                )}>
                  <tab.icon
                    size={22}
                    weight="bold"
                    className="text-white"
                  />
                </div>
              ) : (
                <>
                  <tab.icon
                    size={22}
                    weight={active ? "fill" : "regular"}
                  />
                  <span className="text-[10px] font-medium leading-none">
                    {tab.label}
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
