"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MedalRarity = "bronze" | "silver" | "gold" | "platinum" | "diamond"
export type MedalCategory = "challenge" | "streak" | "meetup" | "social" | "founding" | "milestone" | "exploration" | "consistency"

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
  // ── Founding ──
  { id: "early_adopter",   title: "Early Adopter",        description: "Joined Common before the crowds arrived.",                        rarity: "bronze",   category: "founding",     emoji: "🌱", locked: false },
  { id: "day_one",         title: "Day One",              description: "Signed up within the first week of launch.",                       rarity: "silver",   category: "founding",     emoji: "🎯", locked: true  },
  { id: "og_member",       title: "OG Member",            description: "Been part of Common for 6+ months.",                              rarity: "gold",     category: "founding",     emoji: "👴", locked: true  },

  // ── Streaks ──
  { id: "week_warrior",    title: "Week Warrior",          description: "Checked in 7 days straight without missing a beat.",              rarity: "bronze",   category: "streak",       emoji: "🔥", locked: false },
  { id: "fortnight",       title: "Fortnight",             description: "14 consecutive days. Two full weeks of showing up.",              rarity: "silver",   category: "streak",       emoji: "⚡", locked: true  },
  { id: "monthly_grind",   title: "Monthly Grind",         description: "30 days straight. Most people quit by day 10.",                  rarity: "gold",     category: "streak",       emoji: "💎", locked: true  },
  { id: "sixty_days",      title: "Iron Will",             description: "60 consecutive days. You don't take days off.",                  rarity: "gold",     category: "streak",       emoji: "⚔️", locked: true  },
  { id: "centurion",       title: "Centurion",             description: "100 consecutive check-ins. An absolute legend.",                 rarity: "platinum", category: "streak",       emoji: "👑", locked: true  },
  { id: "streak_365",      title: "Year of Fire",          description: "365 days straight. You are the streak.",                         rarity: "diamond",  category: "streak",       emoji: "🏔️", locked: true  },
  { id: "comeback_kid",    title: "Comeback Kid",          description: "Rebuilt a streak to 7+ days after losing one.",                   rarity: "silver",   category: "streak",       emoji: "🦅", locked: true  },

  // ── Milestones ──
  { id: "first_checkin",   title: "First Steps",           description: "Posted your very first check-in.",                               rarity: "bronze",   category: "milestone",    emoji: "👣", locked: false },
  { id: "ten_checkins",    title: "Getting Started",       description: "10 total check-ins. You're building a habit.",                    rarity: "bronze",   category: "milestone",    emoji: "📊", locked: true  },
  { id: "fifty_checkins",  title: "Halfway There",         description: "50 check-ins. This is who you are now.",                          rarity: "silver",   category: "milestone",    emoji: "🎯", locked: true  },
  { id: "hundred_checkins",title: "Triple Digits",         description: "100 check-ins. You've made this a lifestyle.",                    rarity: "gold",     category: "milestone",    emoji: "💯", locked: true  },
  { id: "five_hundred",    title: "500 Club",              description: "500 check-ins. Absolute dedication.",                             rarity: "platinum", category: "milestone",    emoji: "🏆", locked: true  },
  { id: "thousand",        title: "The Thousand",          description: "1,000 check-ins. You are a monument to consistency.",              rarity: "diamond",  category: "milestone",    emoji: "🗿", locked: true  },

  // ── Challenges ──
  { id: "bookworm",        title: "Bookworm",              description: "Completed the Read 2 Books in March challenge.",                  rarity: "silver",   category: "challenge",    emoji: "📚", locked: false },
  { id: "consistent",      title: "Consistent",            description: "Finished the 30-Day Consistency Challenge.",                      rarity: "gold",     category: "challenge",    emoji: "🏆", locked: true  },
  { id: "spring_runner",   title: "Spring Runner",         description: "Crossed the finish line of the Spring 5K Challenge.",             rarity: "silver",   category: "challenge",    emoji: "🏃", locked: true  },
  { id: "team_player",     title: "Team Player",           description: "Got your entire pod to check in for 7 days straight.",            rarity: "gold",     category: "challenge",    emoji: "🤝", locked: true  },
  { id: "early_bird",      title: "Early Bird",            description: "Checked in before 7 AM for 5 days in a row.",                     rarity: "silver",   category: "challenge",    emoji: "🌅", locked: true  },
  { id: "night_owl",       title: "Night Owl",             description: "Checked in after 10 PM for 5 days in a row.",                     rarity: "silver",   category: "challenge",    emoji: "🦉", locked: true  },
  { id: "weekend_warrior", title: "Weekend Warrior",       description: "Checked in every Saturday and Sunday for a month.",                rarity: "gold",     category: "challenge",    emoji: "🎉", locked: true  },

  // ── Meetups ──
  { id: "showing_up",      title: "Showing Up",            description: "Attended your first in-person pod meetup.",                       rarity: "silver",   category: "meetup",       emoji: "📍", locked: true  },
  { id: "regular",         title: "Regular",               description: "Attended 5 meetups. You're basically furniture now.",              rarity: "gold",     category: "meetup",       emoji: "🪑", locked: true  },
  { id: "event_host",      title: "Event Host",            description: "Organized and hosted a pod meetup event.",                         rarity: "gold",     category: "meetup",       emoji: "🎤", locked: true  },

  // ── Social / Community ──
  { id: "pod_founder",     title: "Pod Founder",           description: "Created your first pod and kept it alive.",                       rarity: "silver",   category: "social",       emoji: "🛸", locked: false },
  { id: "connector",       title: "Connector",             description: "10 different people have joined your pods.",                      rarity: "gold",     category: "social",       emoji: "🕸️", locked: true  },
  { id: "first_like",      title: "Supporter",             description: "Liked someone else's check-in for the first time.",               rarity: "bronze",   category: "social",       emoji: "❤️", locked: true  },
  { id: "first_comment",   title: "Conversationalist",     description: "Left your first comment on someone's check-in.",                  rarity: "bronze",   category: "social",       emoji: "💬", locked: true  },
  { id: "cheerleader",     title: "Cheerleader",           description: "Liked 50 check-ins from others. You lift people up.",              rarity: "silver",   category: "social",       emoji: "📣", locked: true  },
  { id: "popular",         title: "Popular Post",          description: "Got 10+ likes on a single check-in.",                             rarity: "gold",     category: "social",       emoji: "⭐", locked: true  },
  { id: "hype_machine",    title: "Hype Machine",          description: "Left 100+ comments across the platform.",                         rarity: "gold",     category: "social",       emoji: "🔊", locked: true  },
  { id: "influencer",      title: "Influencer",            description: "Your posts have received 100+ total likes.",                      rarity: "platinum", category: "social",       emoji: "✨", locked: true  },

  // ── Exploration ──
  { id: "first_pod",       title: "Pod Explorer",          description: "Joined your first pod.",                                          rarity: "bronze",   category: "exploration",  emoji: "🚀", locked: false },
  { id: "multi_pod",       title: "Multi-Tracker",         description: "Joined 3 different pods at once.",                                rarity: "silver",   category: "exploration",  emoji: "🎪", locked: true  },
  { id: "five_pods",       title: "Pod Collector",         description: "Joined 5 different pods. You're everywhere.",                      rarity: "gold",     category: "exploration",  emoji: "🗺️", locked: true  },
  { id: "category_surfer", title: "Category Surfer",       description: "Checked into pods across 5 different categories.",                 rarity: "gold",     category: "exploration",  emoji: "🏄", locked: true  },
  { id: "globe_trotter",   title: "Globe Trotter",         description: "Checked in from 3 different locations.",                           rarity: "silver",   category: "exploration",  emoji: "🌍", locked: true  },

  // ── Consistency (time-based) ──
  { id: "monday_person",   title: "Monday Person",         description: "Checked in every Monday for a month. You actually like Mondays.",  rarity: "silver",   category: "consistency",  emoji: "📅", locked: true  },
  { id: "perfect_week",    title: "Perfect Week",          description: "Checked in every single day for an entire week.",                  rarity: "bronze",   category: "consistency",  emoji: "✅", locked: true  },
  { id: "perfect_month",   title: "Perfect Month",         description: "Checked in every single day for an entire month.",                 rarity: "gold",     category: "consistency",  emoji: "📆", locked: true  },
  { id: "multi_pod_day",   title: "Double Down",           description: "Checked into 2+ different pods in a single day.",                  rarity: "silver",   category: "consistency",  emoji: "2️⃣", locked: true  },
  { id: "photo_streak",    title: "Shutterbug",            description: "Attached a photo to 10 different check-ins.",                      rarity: "silver",   category: "consistency",  emoji: "📸", locked: true  },
]

export const RANKS: Rank[] = [
  { name: "Newcomer",   minMedals: 0,   color: "bg-zinc-100",      textColor: "text-zinc-500",    emoji: "○"  },
  { name: "Member",     minMedals: 3,   color: "bg-blue-100",     textColor: "text-blue-800",   emoji: "◆"  },
  { name: "Regular",    minMedals: 7,   color: "bg-emerald-100",   textColor: "text-emerald-700", emoji: "★"  },
  { name: "Veteran",    minMedals: 13,  color: "bg-sky-100",       textColor: "text-sky-700",     emoji: "◈"  },
  { name: "Elite",      minMedals: 21,  color: "bg-blue-100",    textColor: "text-blue-800",  emoji: "⬟"  },
  { name: "Champion",   minMedals: 30,  color: "bg-rose-100",      textColor: "text-rose-600",    emoji: "⬡"  },
  { name: "Legend",     minMedals: 40,  color: "bg-blue-200", textColor: "text-blue-900", emoji: "♛" },
]

export const RARITY_STYLES: Record<MedalRarity, { bg: string; text: string; border: string; label: string; glow: string }> = {
  bronze:   { bg: "bg-rose-50",    text: "text-rose-700",  border: "border-rose-200",  label: "Bronze",    glow: "shadow-[0_0_12px_rgba(234,88,12,0.25)]"  },
  silver:   { bg: "bg-slate-50",     text: "text-slate-600",   border: "border-slate-200",   label: "Silver",    glow: "shadow-[0_0_12px_rgba(100,116,139,0.25)]" },
  gold:     { bg: "bg-blue-50",     text: "text-blue-800",   border: "border-blue-300",   label: "Gold",      glow: "shadow-[0_0_16px_rgba(245,158,11,0.35)]"  },
  platinum: { bg: "bg-blue-50",    text: "text-blue-800",  border: "border-blue-300",  label: "Platinum",  glow: "shadow-[0_0_20px_rgba(139,92,246,0.4)]"   },
  diamond:  { bg: "bg-cyan-50",      text: "text-cyan-700",    border: "border-cyan-300",    label: "Diamond",   glow: "shadow-[0_0_24px_rgba(6,182,212,0.45)]"   },
}

// Category labels and icons for display
export const CATEGORY_LABELS: Record<MedalCategory, { label: string; emoji: string }> = {
  founding:     { label: "Founding",      emoji: "🌱" },
  streak:       { label: "Streaks",       emoji: "🔥" },
  milestone:    { label: "Milestones",    emoji: "📊" },
  challenge:    { label: "Challenges",    emoji: "🏆" },
  meetup:       { label: "Meetups",       emoji: "📍" },
  social:       { label: "Community",     emoji: "❤️" },
  exploration:  { label: "Exploration",   emoji: "🚀" },
  consistency:  { label: "Consistency",   emoji: "📅" },
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface MedalsCtx {
  medals: Medal[]
  earnedIds: Record<string, string>  // medalId → ISO date
  earnedCount: number
  totalMedals: number
  rank: Rank
  nextRank: Rank | null
  progressToNext: number  // 0-100
  earnMedal: (medalId: string) => void
  hasMedal: (medalId: string) => boolean
}

const Ctx = createContext<MedalsCtx | null>(null)

import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/app/context/session"

export function MedalsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: sessionLoading } = useSession()
  const [earnedIds, setEarnedIds] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (sessionLoading) return

    if (!user) {
      setEarnedIds({})
      setLoading(false)
      return
    }

    const fetchMedals = async () => {
      try {
        const { data } = await supabase
          .from("user_medals")
          .select("medal_id, earned_at")
          .eq("user_id", user.id)

        const earned: Record<string, string> = {}
        ;(data || []).forEach((m: any) => {
          earned[m.medal_id] = m.earned_at
        })
        setEarnedIds(earned)
      } catch (err) {
        console.error("Failed to fetch medals:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMedals()
  }, [user, sessionLoading, supabase])

  const earnMedal = useCallback(
    async (id: string) => {
      if (!user) throw new Error("No user logged in")
      if (earnedIds[id]) return

      try {
        const { data, error } = await supabase
          .from("user_medals")
          .insert([{ user_id: user.id, medal_id: id }])
          .select()
          .single()

        if (error) throw error

        setEarnedIds((prev) => ({
          ...prev,
          [id]: data.earned_at,
        }))
      } catch (err) {
        console.error("Failed to earn medal:", err)
        throw err
      }
    },
    [user, earnedIds, supabase]
  )

  const hasMedal = useCallback((id: string) => !!earnedIds[id], [earnedIds])

  const earnedCount = Object.keys(earnedIds).length
  const totalMedals = ALL_MEDALS.length

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
    <Ctx.Provider value={{ medals, earnedIds, earnedCount, totalMedals, rank, nextRank, progressToNext, earnMedal, hasMedal }}>
      {children}
    </Ctx.Provider>
  )
}

export function useMedals() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useMedals must be inside MedalsProvider")
  return ctx
}
