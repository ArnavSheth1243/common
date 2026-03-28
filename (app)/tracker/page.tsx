"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  UsersThree,
  Flame,
  CheckCircle,
  TrendUp,
  Heart,
  CalendarCheck,
  Medal,
  Lightning,
  ArrowsClockwise,
  ChartBar,
  Crown,
  Handshake,
} from "@phosphor-icons/react"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"
import { CADENCE_LABELS } from "@/lib/data"

interface StatCard {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  bgColor: string
}

interface PodProgress {
  id: string
  name: string
  category: string
  cadence: string
  currentStreak: number
  longestStreak: number
  checkinCount: number
  memberCount: number
  lastCheckin: string | null
}

interface PersonMet {
  id: string
  name: string
  initials: string
  sharedPods: string[]
}

const AVATAR_COLORS = [
  "bg-zinc-900 text-white", "bg-rose-500 text-white", "bg-amber-500 text-white",
  "bg-emerald-500 text-white", "bg-sky-500 text-white", "bg-violet-500 text-white",
  "bg-indigo-500 text-white", "bg-pink-500 text-white", "bg-teal-500 text-white",
  "bg-orange-500 text-white", "bg-cyan-500 text-white", "bg-fuchsia-500 text-white",
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function daysAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function TrackerPage() {
  const { user } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatCard[]>([])
  const [podProgress, setPodProgress] = useState<PodProgress[]>([])
  const [peopleMet, setPeopleMet] = useState<PersonMet[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; count: number }[]>([])
  const [showAllPeople, setShowAllPeople] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchTrackerData = async () => {
      const sb = createClient()

      // 1. Fetch user's pod memberships with pod details
      const { data: memberships } = await sb
        .from("pod_members")
        .select("pod_id, current_streak, longest_streak, is_admin, pods(id, name, category, cadence, member_count)")
        .eq("user_id", user.id)

      const myPodIds = (memberships || []).map((m: any) => m.pod_id)

      // 2. Fetch all check-ins by user
      const { data: myCheckins } = await sb
        .from("checkins")
        .select("id, pod_id, created_at, streak_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      // 3. Fetch likes received on user's check-ins
      const myCheckinIds = (myCheckins || []).map((c: any) => c.id)
      let likesReceived = 0
      if (myCheckinIds.length > 0) {
        const { count } = await sb
          .from("checkin_likes")
          .select("*", { count: "exact", head: true })
          .in("checkin_id", myCheckinIds)
        likesReceived = count || 0
      }

      // 4. Fetch comments received
      let commentsReceived = 0
      if (myCheckinIds.length > 0) {
        const { count } = await sb
          .from("checkin_comments")
          .select("*", { count: "exact", head: true })
          .in("checkin_id", myCheckinIds)
          .neq("user_id", user.id)
        commentsReceived = count || 0
      }

      // 5. Fetch events user RSVP'd "going" to
      const { count: eventsAttended } = await sb
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "going")

      // 6. Fetch medals earned
      const { count: medalsEarned } = await sb
        .from("user_medals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      // 7. Fetch all members across user's pods (people met)
      let allPodMembers: any[] = []
      if (myPodIds.length > 0) {
        const { data: members } = await sb
          .from("pod_members")
          .select("user_id, pod_id")
          .in("pod_id", myPodIds)
          .neq("user_id", user.id)

        allPodMembers = members || []
      }

      // Fetch profiles for all people met
      const uniqueUserIds = [...new Set(allPodMembers.map((m: any) => m.user_id))]
      const profileMap: Record<string, string> = {}
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await sb
          .from("profiles")
          .select("id, display_name")
          .in("id", uniqueUserIds)
        ;(profiles || []).forEach((p: any) => {
          profileMap[p.id] = p.display_name || "Unknown"
        })
      }

      // Build pod name map
      const podNameMap: Record<string, string> = {}
      ;(memberships || []).forEach((m: any) => {
        if (m.pods) podNameMap[m.pod_id] = (m.pods as any).name
      })

      // Build people met with shared pods
      const peopleMap: Record<string, { name: string; sharedPods: Set<string> }> = {}
      allPodMembers.forEach((m: any) => {
        if (!peopleMap[m.user_id]) {
          peopleMap[m.user_id] = { name: profileMap[m.user_id] || "Unknown", sharedPods: new Set() }
        }
        const podName = podNameMap[m.pod_id]
        if (podName) peopleMap[m.user_id].sharedPods.add(podName)
      })

      const people: PersonMet[] = Object.entries(peopleMap).map(([id, data]) => ({
        id,
        name: data.name,
        initials: data.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2),
        sharedPods: [...data.sharedPods],
      }))

      // Build per-pod progress
      const checkinsByPod: Record<string, any[]> = {}
      ;(myCheckins || []).forEach((c: any) => {
        if (!checkinsByPod[c.pod_id]) checkinsByPod[c.pod_id] = []
        checkinsByPod[c.pod_id].push(c)
      })

      const progress: PodProgress[] = (memberships || []).map((m: any) => {
        const pod = m.pods as any
        const podCheckins = checkinsByPod[m.pod_id] || []
        return {
          id: m.pod_id,
          name: pod?.name || "Unknown Pod",
          category: pod?.category || "other",
          cadence: pod?.cadence || "daily",
          currentStreak: m.current_streak || 0,
          longestStreak: m.longest_streak || 0,
          checkinCount: podCheckins.length,
          memberCount: pod?.member_count || 0,
          lastCheckin: podCheckins[0]?.created_at || null,
        }
      })

      // Build weekly activity (last 7 days)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const weekly: { day: string; count: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayStr = d.toISOString().split("T")[0]
        const count = (myCheckins || []).filter((c: any) =>
          c.created_at.startsWith(dayStr)
        ).length
        weekly.push({ day: dayNames[d.getDay()], count })
      }

      // Best streak across all pods
      const bestStreak = Math.max(0, ...(memberships || []).map((m: any) => m.longest_streak || 0))
      const currentBestStreak = Math.max(0, ...(memberships || []).map((m: any) => m.current_streak || 0))

      // Build stat cards
      const statCards: StatCard[] = [
        {
          label: "People Met",
          value: people.length,
          sub: `across ${myPodIds.length} pod${myPodIds.length === 1 ? "" : "s"}`,
          icon: Handshake,
          color: "text-violet-600",
          bgColor: "bg-violet-50",
        },
        {
          label: "Total Check-ins",
          value: (myCheckins || []).length,
          sub: currentBestStreak > 0 ? `${currentBestStreak} day active streak` : "Start checking in!",
          icon: CheckCircle,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
        },
        {
          label: "Best Streak",
          value: `${bestStreak}d`,
          sub: bestStreak > 0 ? "Your longest run" : "No streaks yet",
          icon: Flame,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
        },
        {
          label: "Active Pods",
          value: myPodIds.length,
          sub: progress.filter(p => p.currentStreak > 0).length > 0
            ? `${progress.filter(p => p.currentStreak > 0).length} with active streaks`
            : "Join a pod to start",
          icon: UsersThree,
          color: "text-sky-600",
          bgColor: "bg-sky-50",
        },
        {
          label: "Likes Received",
          value: likesReceived,
          sub: commentsReceived > 0 ? `+ ${commentsReceived} comments` : "Keep checking in!",
          icon: Heart,
          color: "text-rose-600",
          bgColor: "bg-rose-50",
        },
        {
          label: "Events",
          value: eventsAttended || 0,
          sub: medalsEarned ? `${medalsEarned} medal${medalsEarned === 1 ? "" : "s"} earned` : "RSVP to events",
          icon: CalendarCheck,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
        },
      ]

      setStats(statCards)
      setPodProgress(progress.sort((a, b) => b.currentStreak - a.currentStreak))
      setPeopleMet(people.sort((a, b) => b.sharedPods.length - a.sharedPods.length))
      setWeeklyActivity(weekly)
      setLoading(false)
    }

    fetchTrackerData()
  }, [user])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8">
        <div className="text-center py-20 text-zinc-400">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          Loading your progress...
        </div>
      </div>
    )
  }

  const maxWeeklyCount = Math.max(1, ...weeklyActivity.map(d => d.count))
  const visiblePeople = showAllPeople ? peopleMet : peopleMet.slice(0, 8)

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-up">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5">Your progress</p>
        <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">Tracker</h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-2">Everything you&apos;ve built, everyone you&apos;ve met.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-zinc-100 rounded-3xl p-5 hover:border-zinc-200 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={18} weight="fill" className={stat.color} />
              </div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">{stat.value}</div>
            {stat.sub && <p className="text-xs text-zinc-400 mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Weekly activity */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <ChartBar size={14} className="text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">This week</h2>
        </div>
        <div className="flex items-end gap-2 h-28">
          {weeklyActivity.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                <div
                  className={`w-full max-w-[40px] rounded-xl transition-all duration-300 ${
                    day.count > 0
                      ? "bg-gradient-to-t from-amber-500 to-amber-400"
                      : "bg-zinc-100"
                  }`}
                  style={{
                    height: day.count > 0 ? `${Math.max(16, (day.count / maxWeeklyCount) * 80)}px` : "8px",
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold text-zinc-400">{day.day}</span>
              {day.count > 0 && (
                <span className="text-[10px] font-bold text-amber-600">{day.count}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pod-by-pod progress */}
      {podProgress.length > 0 && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendUp size={14} className="text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Pod progress</h2>
          </div>
          <div className="space-y-4">
            {podProgress.map((pod) => {
              const consistency = pod.checkinCount > 0 ? Math.min(100, Math.round((pod.currentStreak / Math.max(1, pod.checkinCount)) * 100 + pod.checkinCount * 2)) : 0
              const clampedConsistency = Math.min(100, consistency)
              return (
                <Link
                  key={pod.id}
                  href={`/pods/${pod.id}`}
                  className="block border border-zinc-100 rounded-2xl p-4 hover:border-zinc-200 hover:bg-zinc-50/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-amber-700 transition-colors truncate">{pod.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-400 capitalize">{pod.category}</span>
                          <span className="text-zinc-200">·</span>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                            <ArrowsClockwise size={8} />
                            {CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS] || pod.cadence}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {pod.currentStreak > 0 && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                          <Flame size={10} weight="fill" className="text-amber-500" />
                          <span className="text-xs font-bold text-amber-700">{pod.currentStreak}</span>
                        </div>
                      )}
                      {pod.longestStreak > 0 && pod.longestStreak > pod.currentStreak && (
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <Crown size={10} weight="fill" />
                          <span className="font-semibold">{pod.longestStreak}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${clampedConsistency}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 w-8 text-right">{clampedConsistency}%</span>
                  </div>

                  {/* Bottom stats */}
                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle size={10} />
                      {pod.checkinCount} check-in{pod.checkinCount === 1 ? "" : "s"}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersThree size={10} />
                      {pod.memberCount} member{pod.memberCount === 1 ? "" : "s"}
                    </span>
                    {pod.lastCheckin && (
                      <span>Last: {daysAgo(pod.lastCheckin)}</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* People met */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Handshake size={14} className="text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">People you&apos;ve met</h2>
          </div>
          <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
            {peopleMet.length}
          </span>
        </div>

        {peopleMet.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-400">Join a pod to start meeting people!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visiblePeople.map((person) => {
                const color = getAvatarColor(person.name)
                return (
                  <Link
                    key={person.id}
                    href={`/profile/${person.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-zinc-50 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                      {person.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors truncate">
                        {person.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {person.sharedPods.length === 1
                          ? person.sharedPods[0]
                          : `${person.sharedPods.length} shared pods`}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
            {peopleMet.length > 8 && (
              <button
                onClick={() => setShowAllPeople(!showAllPeople)}
                className="w-full mt-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showAllPeople ? "Show less" : `Show all ${peopleMet.length} people`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Motivational footer */}
      <div className="bg-zinc-900 rounded-3xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lightning size={16} weight="fill" className="text-amber-400" />
          <Medal size={16} weight="fill" className="text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-[#f5f0e6]">Consistency compounds.</p>
        <p className="text-xs text-zinc-500 mt-1">Every check-in matters. Keep showing up.</p>
      </div>
    </div>
  )
}
