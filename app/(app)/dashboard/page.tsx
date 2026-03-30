"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Flame,
  PlusCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Fire,
} from "@phosphor-icons/react"
import { CADENCE_LABELS } from "@/lib/data"
import { useUserProfile } from "@/app/context/user-profile"
import { useUserStats } from "@/app/context/user-stats"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

// Avatar colors
const AVATAR_COLORS = [
  "bg-zinc-900 text-white",
  "bg-rose-500 text-white",
  "bg-amber-500 text-white",
  "bg-emerald-500 text-white",
  "bg-sky-500 text-white",
  "bg-violet-500 text-white",
  "bg-indigo-500 text-white",
  "bg-pink-500 text-white",
  "bg-teal-500 text-white",
  "bg-orange-500 text-white",
  "bg-cyan-500 text-white",
  "bg-fuchsia-500 text-white",
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return "Yesterday"
}

interface PodToday {
  id: string
  name: string
  category: string
  cadence: string
  memberCount: number
  todayCheckins: { userId: string; name: string; avatarColor: string; initials: string; time: string }[]
  totalMembers: { userId: string; name: string; avatarColor: string; initials: string }[]
  myStreak: number
  checkedInToday: boolean
}

interface RecentActivity {
  id: string
  authorName: string
  authorInitials: string
  authorColor: string
  podName: string
  content: string
  time: string
  streakCount: number
}

// Skeleton loader
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-200/60 rounded-2xl ${className || ""}`} />
}

function DashboardSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 w-full">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-64 mb-8" />
      {/* Streak card skeleton */}
      <Skeleton className="h-28 w-full mb-8 rounded-3xl" />
      {/* Pod cards skeleton */}
      <Skeleton className="h-5 w-24 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useSession()
  const { profile } = useUserProfile()
  const { currentStreak, longestStreak, totalCheckins, podStreaks } = useUserStats()

  const [podsToday, setPodsToday] = useState<PodToday[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const firstName = profile?.displayName?.split(" ")[0] || "User"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  // Get today's date string for comparison
  const todayStr = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        const sb = createClient()

        // 1. Get user's pod memberships
        const { data: memberships } = await sb
          .from("pod_members")
          .select("pod_id, current_streak, pods(id, name, category, cadence, member_count)")
          .eq("user_id", user.id)

        if (!memberships || memberships.length === 0) {
          setPodsToday([])
          setRecentActivity([])
          setLoading(false)
          return
        }

        const podIds = memberships.map((m: any) => m.pod_id)

        // 2. Get today's checkins for user's pods
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const { data: todayCheckins } = await sb
          .from("checkins")
          .select("id, pod_id, user_id, content, streak_count, created_at")
          .in("pod_id", podIds)
          .gte("created_at", todayStart.toISOString())
          .order("created_at", { ascending: false })

        // 3. Get all members of user's pods
        const { data: allPodMembers } = await sb
          .from("pod_members")
          .select("pod_id, user_id")
          .in("pod_id", podIds)

        // 4. Get recent checkins for activity feed (last 24h)
        const yesterday = new Date(Date.now() - 86400000)
        const { data: recentCheckins } = await sb
          .from("checkins")
          .select("id, pod_id, user_id, content, streak_count, created_at, pods(name)")
          .in("pod_id", podIds)
          .gte("created_at", yesterday.toISOString())
          .order("created_at", { ascending: false })
          .limit(8)

        // 5. Collect all user IDs for profile lookup
        const allUserIds = new Set<string>()
        ;(todayCheckins || []).forEach((c: any) => allUserIds.add(c.user_id))
        ;(allPodMembers || []).forEach((m: any) => allUserIds.add(m.user_id))
        ;(recentCheckins || []).forEach((c: any) => allUserIds.add(c.user_id))

        const profileMap: Record<string, string> = {}
        if (allUserIds.size > 0) {
          const { data: profiles } = await sb
            .from("profiles")
            .select("id, display_name")
            .in("id", Array.from(allUserIds))
          ;(profiles || []).forEach((p: any) => {
            profileMap[p.id] = p.display_name || "Unknown"
          })
        }

        // Build pod today cards
        const pods: PodToday[] = memberships.map((m: any) => {
          const pod = m.pods
          const podMembers = (allPodMembers || []).filter((pm: any) => pm.pod_id === m.pod_id)
          const podTodayCheckins = (todayCheckins || []).filter((c: any) => c.pod_id === m.pod_id)
          const checkedInUserIds = new Set(podTodayCheckins.map((c: any) => c.user_id))

          return {
            id: pod.id,
            name: pod.name,
            category: pod.category || "other",
            cadence: pod.cadence || "daily",
            memberCount: pod.member_count || podMembers.length,
            todayCheckins: podTodayCheckins.map((c: any) => {
              const name = profileMap[c.user_id] || "Unknown"
              return {
                userId: c.user_id,
                name: c.user_id === user.id ? "You" : name,
                avatarColor: getAvatarColor(name),
                initials: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2),
                time: getRelativeTime(new Date(c.created_at)),
              }
            }),
            totalMembers: podMembers.map((pm: any) => {
              const name = profileMap[pm.user_id] || "Unknown"
              return {
                userId: pm.user_id,
                name: pm.user_id === user.id ? "You" : name,
                avatarColor: getAvatarColor(name),
                initials: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2),
              }
            }),
            myStreak: podStreaks[m.pod_id] || m.current_streak || 0,
            checkedInToday: checkedInUserIds.has(user.id),
          }
        })

        // Build recent activity
        const activity: RecentActivity[] = (recentCheckins || []).map((c: any) => {
          const name = c.user_id === user.id ? "You" : (profileMap[c.user_id] || "Unknown")
          return {
            id: c.id,
            authorName: name,
            authorInitials: (profileMap[c.user_id] || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2),
            authorColor: getAvatarColor(profileMap[c.user_id] || "Unknown"),
            podName: c.pods?.name || "Unknown Pod",
            content: c.content,
            time: getRelativeTime(new Date(c.created_at)),
            streakCount: c.streak_count || 0,
          }
        })

        setPodsToday(pods)
        setRecentActivity(activity)
      } catch (err) {
        console.error("Failed to fetch dashboard:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, podStreaks])

  if (loading) return <DashboardSkeleton />

  const allCheckedIn = podsToday.length > 0 && podsToday.every((p) => p.checkedInToday)
  const uncheckedPods = podsToday.filter((p) => !p.checkedInToday)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-[28px] sm:text-[36px] font-bold text-zinc-900 tracking-tighter leading-none">
          {greeting}, {firstName}.
        </h1>
      </div>

      {/* Streak + Stats Bar */}
      <div className="bg-zinc-900 rounded-3xl p-5 sm:p-6 mb-8 relative overflow-hidden">
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-500 rounded-full opacity-15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Flame size={14} weight="fill" className="text-amber-400" />
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Current streak</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-bold text-white tracking-tighter tabular-nums">{currentStreak}</span>
                <span className="text-sm text-zinc-500 font-medium">days</span>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="hidden sm:block">
              <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Best</div>
              <div className="text-xl font-bold text-white/60 tabular-nums">{longestStreak}</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Check-ins</div>
              <div className="text-xl font-bold text-white/60 tabular-nums">{totalCheckins}</div>
            </div>
          </div>
          {!allCheckedIn && (
            <Link
              href="/checkin"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold px-5 py-3 rounded-2xl transition-all duration-200 active:scale-[0.97] shadow-amber"
            >
              <PlusCircle size={16} weight="fill" />
              Check In
            </Link>
          )}
          {allCheckedIn && (
            <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-sm font-bold px-5 py-3 rounded-2xl">
              <CheckCircle size={16} weight="fill" />
              All done today
            </div>
          )}
        </div>
      </div>

      {/* Nudge for unchecked pods */}
      {uncheckedPods.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
          <Clock size={16} weight="fill" className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">You haven&apos;t checked in</span> to {uncheckedPods.map((p) => p.name).join(", ")} today.{" "}
            <span className="text-amber-600">Your pod is watching.</span>
          </p>
        </div>
      )}

      {/* Your Pods — Today */}
      {podsToday.length > 0 ? (
        <>
          <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider mb-4">Your Pods — Today</h2>
          <div className="space-y-4 mb-8">
            {podsToday.map((pod) => {
              const checkedInCount = pod.todayCheckins.length
              const totalCount = pod.totalMembers.length
              const pct = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0
              const notCheckedIn = pod.totalMembers.filter(
                (m) => !pod.todayCheckins.some((c) => c.userId === m.userId)
              )

              return (
                <div key={pod.id} className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all duration-200">
                  {/* Pod header */}
                  <div className="flex items-center justify-between mb-4">
                    <Link href={`/pods/${pod.id}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-sm font-bold">
                        {pod.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">{pod.name}</div>
                        <div className="text-xs text-zinc-400">{CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS]} · {totalCount} members</div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3">
                      {/* Streak badge */}
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 rounded-full px-2.5 py-1">
                        <Flame size={12} weight="fill" />
                        <span>{pod.myStreak}d</span>
                      </div>
                      {/* Check-in button or done indicator */}
                      {pod.checkedInToday ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
                          <CheckCircle size={12} weight="fill" />
                          Done
                        </div>
                      ) : (
                        <Link
                          href={`/checkin?pod=${pod.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-full px-3 py-1.5 transition-colors"
                        >
                          <PlusCircle size={12} weight="fill" />
                          Check In
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-zinc-500">{checkedInCount}/{totalCount} checked in today</span>
                      <span className="text-xs font-semibold text-zinc-700">{pct}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Who checked in */}
                  {checkedInCount > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-2">
                        {pod.todayCheckins.map((c) => (
                          <div key={c.userId} className="flex items-center gap-1.5 text-xs text-zinc-600 bg-emerald-50 rounded-full px-2 py-1">
                            <div className={`w-4 h-4 rounded-full ${c.avatarColor} flex items-center justify-center text-[8px] font-bold`}>
                              {c.initials}
                            </div>
                            <span className="font-medium">{c.name}</span>
                            <span className="text-zinc-400">{c.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Who hasn't */}
                  {notCheckedIn.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {notCheckedIn.map((m) => (
                        <div key={m.userId} className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 rounded-full px-2 py-1 opacity-60">
                          <div className="w-4 h-4 rounded-full bg-zinc-300 flex items-center justify-center text-[8px] font-bold text-white">
                            {m.initials}
                          </div>
                          <span>{m.name}</span>
                          <span className="italic">not yet</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Empty state — no pods */
        <div className="bg-white border border-zinc-100 rounded-3xl p-8 text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <Fire size={24} weight="duotone" className="text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Join your first pod</h2>
          <p className="text-sm text-zinc-500 mb-5 max-w-[32ch] mx-auto">
            Find a group of people pursuing the same goal. Check in daily. Build streaks together.
          </p>
          <Link
            href="/pods"
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-6 py-3 rounded-2xl transition-all duration-200 active:scale-[0.97]"
          >
            Explore Pods
            <ArrowRight size={15} weight="bold" />
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider mb-4">Recent Activity</h2>
          <div className="bg-white border border-zinc-100 rounded-3xl divide-y divide-zinc-50 overflow-hidden">
            {recentActivity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-full ${item.authorColor} flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>
                  {item.authorInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 leading-snug">
                    <span className="font-semibold text-zinc-900">{item.authorName}</span>
                    {" checked in to "}
                    <span className="font-medium text-zinc-700">{item.podName}</span>
                  </p>
                  {item.content && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">&ldquo;{item.content}&rdquo;</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.streakCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                      <Flame size={10} weight="fill" />
                      {item.streakCount}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Explore more */}
      <div className="mt-8 text-center">
        <Link
          href="/pods"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          Explore more pods
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
