"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/app/context/session"

interface UserStats {
  totalCheckins: number
  currentStreak: number
  longestStreak: number
  calendarData: Record<string, string[]>
  podStreaks: Record<string, number>
}

interface UserStatsContextValue extends UserStats {
  loading: boolean
  recordCheckin: (podId: string) => void
}

const UserStatsContext = createContext<UserStatsContextValue | null>(null)

const INITIAL_STATS: UserStats = {
  totalCheckins: 0,
  currentStreak: 0,
  longestStreak: 0,
  calendarData: {},
  podStreaks: {},
}

function calculateStreaks(checkins: any[]): Omit<UserStats, "totalCheckins"> {
  if (checkins.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      calendarData: {},
      podStreaks: {},
    }
  }

  // Group by date
  const calendarData: Record<string, string[]> = {}
  const podStreaks: Record<string, number> = {}

  checkins.forEach((c: any) => {
    const date = c.created_at.split("T")[0]
    if (!calendarData[date]) calendarData[date] = []
    calendarData[date].push(c.pod_id)

    podStreaks[c.pod_id] = (podStreaks[c.pod_id] || 0) + 1
  })

  // Calculate current streak (consecutive days from today backwards)
  const today = new Date()
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateKey = checkDate.toISOString().split("T")[0]

    if (calendarData[dateKey]) {
      tempStreak++
      if (i === 0) currentStreak = tempStreak
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      if (i > 0) tempStreak = 0
    }
  }

  return {
    currentStreak,
    longestStreak,
    calendarData,
    podStreaks,
  }
}

export function UserStatsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: sessionLoading } = useSession()
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (sessionLoading) return

    if (!user) {
      setStats(INITIAL_STATS)
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const { data: checkins } = await supabase
          .from("checkins")
          .select("id, pod_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        const checked = checkins || []
        const streaks = calculateStreaks(checked)

        setStats({
          totalCheckins: checked.length,
          ...streaks,
        })
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, sessionLoading, supabase])

  const recordCheckin = (podId: string) => {
    // This is handled by postCheckin in pod-state
    // Stats will be recalculated when checkins are fetched
  }

  return (
    <UserStatsContext.Provider value={{ ...stats, loading, recordCheckin }}>
      {children}
    </UserStatsContext.Provider>
  )
}

export function useUserStats() {
  const ctx = useContext(UserStatsContext)
  if (!ctx) throw new Error("useUserStats must be used within UserStatsProvider")
  return ctx
}
