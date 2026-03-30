"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Flame,
  PlusCircle,
  ArrowRight,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react"
import { CADENCE_LABELS } from "@/lib/data"
import { useSession } from "@/app/context/session"
import { useUserStats } from "@/app/context/user-stats"
import { createClient } from "@/lib/supabase/client"

interface MyPodData {
  id: string
  name: string
  category: string
  cadence: string
  memberCount: number
  myStreak: number
  checkedInToday: boolean
  lastCheckinLabel: string
}

export default function MyPodsPage() {
  const { user } = useSession()
  const { podStreaks } = useUserStats()
  const [pods, setPods] = useState<MyPodData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchMyPods = async () => {
      const supabase = createClient()

      const { data: memberships } = await supabase
        .from("pod_members")
        .select("pod_id, current_streak, pods(id, name, category, cadence, member_count)")
        .eq("user_id", user.id)

      if (!memberships) { setLoading(false); return }

      const podIds = memberships.map((m: any) => m.pod_id)

      // Check today's check-ins
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data: todayCheckins } = await supabase
        .from("checkins")
        .select("pod_id, created_at")
        .eq("user_id", user.id)
        .in("pod_id", podIds)
        .gte("created_at", todayStart.toISOString())

      const todayPodIds = new Set((todayCheckins || []).map((c: any) => c.pod_id))

      // Get last checkin per pod for "last check-in" label
      const { data: lastCheckins } = await supabase
        .from("checkins")
        .select("pod_id, created_at")
        .eq("user_id", user.id)
        .in("pod_id", podIds)
        .order("created_at", { ascending: false })

      const lastCheckinMap: Record<string, string> = {}
      for (const c of lastCheckins || []) {
        if (!lastCheckinMap[c.pod_id]) {
          const d = new Date(c.created_at)
          const now = new Date()
          const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
          lastCheckinMap[c.pod_id] = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`
        }
      }

      const mapped: MyPodData[] = memberships.map((m: any) => {
        const p = m.pods
        return {
          id: p.id,
          name: p.name,
          category: p.category || "other",
          cadence: p.cadence || "daily",
          memberCount: p.member_count || 0,
          myStreak: podStreaks[p.id] || m.current_streak || 0,
          checkedInToday: todayPodIds.has(p.id),
          lastCheckinLabel: lastCheckinMap[p.id] || "Never",
        }
      })

      setPods(mapped)
      setLoading(false)
    }
    fetchMyPods()
  }, [user, podStreaks])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">My Pods</h1>
        <Link
          href="/pods"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors flex items-center gap-1"
        >
          Explore pods <ArrowRight size={13} />
        </Link>
      </div>

      {pods.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-3xl p-8 text-center">
          <p className="text-sm text-zinc-400 mb-4">You haven&apos;t joined any pods yet.</p>
          <Link
            href="/pods"
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-all"
          >
            Find a pod
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pods.map((pod) => (
            <div
              key={pod.id}
              className="bg-white border border-zinc-100 rounded-3xl p-5 hover:shadow-md hover:border-zinc-200 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Pod icon */}
                <Link href={`/pods/${pod.id}`} className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-lg font-bold">
                    {pod.name[0]}
                  </div>
                </Link>

                {/* Pod info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/pods/${pod.id}`} className="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors truncate block">
                    {pod.name}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span>{CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS]}</span>
                    <span>·</span>
                    <span>{pod.memberCount} members</span>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 rounded-full px-3 py-1.5 flex-shrink-0">
                  <Flame size={14} weight="fill" />
                  <span className="tabular-nums">{pod.myStreak}d</span>
                </div>

                {/* Check-in status / button */}
                {pod.checkedInToday ? (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1.5 flex-shrink-0">
                    <CheckCircle size={13} weight="fill" />
                    Done
                  </div>
                ) : (
                  <Link
                    href={`/checkin?pod=${pod.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-full px-3.5 py-2 transition-colors flex-shrink-0"
                  >
                    <PlusCircle size={13} weight="fill" />
                    Check In
                  </Link>
                )}
              </div>

              {/* Last check-in */}
              <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center gap-1.5 text-xs text-zinc-400">
                <Clock size={11} />
                <span>Last check-in: {pod.lastCheckinLabel}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
