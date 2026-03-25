"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface UserStats {
  totalCheckins: number
  currentStreak: number
  longestStreak: number
  calendarData: Record<string, string[]>
  podStreaks: Record<string, number>
}

interface UserStatsContextValue extends UserStats {
  recordCheckin: (podId: string) => void
}

const UserStatsContext = createContext<UserStatsContextValue | null>(null)

const INITIAL_CALENDAR: Record<string, string[]> = {
  "2026-02-17": ["1"],
  "2026-02-19": ["2"],
  "2026-02-21": ["2"],
  "2026-02-22": ["1"],
  "2026-02-24": ["1"],
  "2026-02-26": ["2"],
  "2026-02-28": ["2"],
  "2026-03-01": ["1"],
  "2026-03-03": ["2"],
  "2026-03-05": ["2"],
  "2026-03-08": ["1"],
  "2026-03-10": ["2"],
  "2026-03-12": ["2"],
  "2026-03-15": ["1"],
  "2026-03-17": ["2"],
  "2026-03-19": ["2"],
}

const INITIAL_POD_STREAKS: Record<string, number> = {
  "1": 14, "2": 22, "3": 7, "4": 9,
  "5": 8, "6": 5, "7": 3, "8": 5,
  "9": 6, "10": 11, "11": 4, "12": 2,
}

export function UserStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<UserStats>({
    totalCheckins: 43,
    currentStreak: 14,
    longestStreak: 21,
    calendarData: INITIAL_CALENDAR,
    podStreaks: INITIAL_POD_STREAKS,
  })

  const recordCheckin = useCallback((podId: string) => {
    setStats((prev) => {
      const newStreak = prev.currentStreak + 1
      const today = new Date().toISOString().split("T")[0]
      return {
        totalCheckins: prev.totalCheckins + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        calendarData: {
          ...prev.calendarData,
          [today]: [...(prev.calendarData[today] ?? []), podId],
        },
        podStreaks: { ...prev.podStreaks, [podId]: (prev.podStreaks[podId] ?? 0) + 1 },
      }
    })
  }, [])

  return (
    <UserStatsContext.Provider value={{ ...stats, recordCheckin }}>
      {children}
    </UserStatsContext.Provider>
  )
}

export function useUserStats() {
  const ctx = useContext(UserStatsContext)
  if (!ctx) throw new Error("useUserStats must be used within UserStatsProvider")
  return ctx
}
