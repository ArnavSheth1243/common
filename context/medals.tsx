"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MedalRarity = "bronze" | "silver" | "gold" | "platinum"
export type MedalCategory = "challenge" | "streak" | "meetup" | "social" | "founding"

export interface Medal {
  id: string
  title: string
  description: string
  rarity: MedalRarity
  category: MedalCategory
  emoji: string
  earnedAt?: string   // ISO date string if earned
  locked: boolean
}

export interface Rank {
  name: string
  minMedals: number
  color: string
  textColor: string
  emoji: string
}

// ─── All medals in the system ─────────────────────────────────────────────────

export const ALL_MEDALS: Medal[] = [
  // Founding
  { id: "early_adopter",   title: "Early Adopter",      description: "Joined Common before the crowds arrived.",                rarity: "bronze",   category: "founding",  emoji: "🌱", locked: false },
  // Streaks
  { id: "week_warrior",    title: "Week Warrior",        description: "Checked in 7 days straight without missing a beat.",      rarity: "bronze",   category: "streak",    emoji: "🔥", locked: false },
  { id: "fortnight",       title: "Fortnight",           description: "14 consecutive days. Two full weeks of showing up.",      rarity: "silver",   category: "streak",    emoji: "⚡", locked: true  },
  { id: "monthly_grind",   title: "Monthly Grind",       description: "30 days straight. Most people quit by day 10.",          rarity: "gold",     category: "streak",    emoji: "💎", locked: true  },
  { id: "centurion",       title: "Centurion",           description: "100 consecutive check-ins. An absolute legend.",         rarity: "platinum", category: "streak",    emoji: "👑", locked: true  },
  // Challenges
  { id: "bookworm",        title: "Bookworm",            description: "Completed the Read 2 Books in March challenge.",         rarity: "silver",   category: "challenge", emoji: "📚", locked: false },
  { id: "consistent",      title: "Consistent",          description: "Finished the 30-Day Consistency Challenge.",             rarity: "gold",     category: "challenge", emoji: "🏆", locked: true  },
  { id: "spring_runner",   title: "Spring Runner",       description: "Crossed the finish line of the Spring 5K Challenge.",   rarity: "silver",   category: "challenge", emoji: "🏃", locked: true  },
  { id: "team_player",     title: "Team Player",         description: "Got your entire pod to check in for 7 days straight.",  rarity: "gold",     category: "challenge", emoji: "🤝", locked: true  },
  // Meetups
  { id: "showing_up",      title: "Showing Up",          description: "Attended your first in-person pod meetup.",             rarity: "silver",   category: "meetup",    emoji: "📍", locked: true  },
  { id: "regular",         title: "Regular",             description: "Attended 5 meetups. You're basically furniture now.",   rarity: "gold",     category: "meetup",    emoji: "🪑", locked: true  },
  // Social / founding
  { id: "pod_founder",     title: "Pod Founder",         description: "Created your first pod and kept it alive.",             rarity: "silver",   category: "social",    emoji: "🛸", locked: false },
  { id: "connector",       title: "Connector",           description: "10 different people have joined your pods.",            rarity: "gold",     category: "social",    emoji: "🕸️", locked: true  },
]

export const RANKS: Rank[] = [
  { name: "Newcomer", minMedals: 0,  color: "bg-zinc-100",     textColor: "text-zinc-500",   emoji: "○"  },
  { name: "Member",   minMedals: 3,  color: "bg-amber-100",    textColor: "text-amber-700",  emoji: "◆"  },
  { name: "Regular",  minMedals: 7,  color: "bg-emerald-100",  textColor: "text-emerald-700",emoji: "★"  },
  { name: "Veteran",  minMedals: 13, color: "bg-sky-100",      textColor: "text-sky-700",    emoji: "◈"  },
  { name: "Elite",    minMedals: 21, color: "bg-violet-100",   textColor: "text-violet-700", emoji: "⬟"  },
  { name: "Legend",   minMedals: 35, color: "bg-rose-100",     textColor: "text-rose-600",   emoji: "⬡"  },
]

export const RARITY_STYLES: Record<MedalRarity, { bg: string; text: string; border: string; label: string; glow: string }> = {
  bronze:   { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200", label: "Bronze",   glow: "shadow-[0_0_12px_rgba(234,88,12,0.25)]"  },
  silver:   { bg: "bg-slate-50",   text: "text-slate-600",  border: "border-slate-200",  label: "Silver",   glow: "shadow-[0_0_12px_rgba(100,116,139,0.25)]" },
  gold:     { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-300",  label: "Gold",     glow: "shadow-[0_0_16px_rgba(245,158,11,0.35)]"  },
  platinum: { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-300", label: "Platinum", glow: "shadow-[0_0_20px_rgba(139,92,246,0.4)]"   },
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "common_medals"

// Default earned medals for Arnav S.
const DEFAULT_EARNED: Record<string, string> = {
  early_adopter: "2025-03-01",
  week_warrior:  "2025-03-08",
  bookworm:      "2026-03-24",
  pod_founder:   "2025-03-15",
}

interface MedalsCtx {
  medals: Medal[]
  earnedIds: Record<string, string>  // medalId → ISO date
  earnedCount: number
  rank: Rank
  nextRank: Rank | null
  progressToNext: number  // 0-100
  earnMedal: (medalId: string) => void
  hasMedal: (medalId: string) => boolean
}

const Ctx = createContext<MedalsCtx | null>(null)

export function MedalsProvider({ children }: { children: React.ReactNode }) {
  const [earnedIds, setEarnedIds] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return DEFAULT_EARNED
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : DEFAULT_EARNED
    } catch { return DEFAULT_EARNED }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(earnedIds)) } catch {}
  }, [earnedIds])

  const earnMedal = useCallback((id: string) => {
    setEarnedIds((prev) => {
      if (prev[id]) return prev
      return { ...prev, [id]: new Date().toISOString() }
    })
  }, [])

  const hasMedal = useCallback((id: string) => !!earnedIds[id], [earnedIds])

  const earnedCount = Object.keys(earnedIds).length

  // Hydrate medals with earned status
  const medals: Medal[] = ALL_MEDALS.map((m) => ({
    ...m,
    locked: !earnedIds[m.id],
    earnedAt: earnedIds[m.id],
  }))

  // Current rank
  const rank = [...RANKS].reverse().find((r) => earnedCount >= r.minMedals) ?? RANKS[0]
  const rankIdx = RANKS.indexOf(rank)
  const nextRank = rankIdx < RANKS.length - 1 ? RANKS[rankIdx + 1] : null
  const progressToNext = nextRank
    ? Math.round(((earnedCount - rank.minMedals) / (nextRank.minMedals - rank.minMedals)) * 100)
    : 100

  return (
    <Ctx.Provider value={{ medals, earnedIds, earnedCount, rank, nextRank, progressToNext, earnMedal, hasMedal }}>
      {children}
    </Ctx.Provider>
  )
}

export function useMedals() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useMedals must be inside MedalsProvider")
  return ctx
}
