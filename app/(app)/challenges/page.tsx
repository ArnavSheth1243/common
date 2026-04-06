"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Trophy,
  Flame,
  Users,
  CalendarCheck,
  Lightning,
  Target,
  Clock,
  CheckCircle,
  Star,
} from "@phosphor-icons/react"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

interface Challenge {
  id: string
  title: string
  description: string
  podId: string
  podName: string
  startDate: string
  endDate: string
  goal: number        // e.g. 30 check-ins
  goalUnit: string    // e.g. "check-ins"
  participantCount: number
  joined: boolean
  progress: number    // your check-ins in this challenge period
}

export default function ChallengesPage() {
  const { user } = useSession()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchChallenges = async () => {
      const supabase = createClient()

      // Fetch challenges
      const { data: rawChallenges } = await supabase
        .from("challenges")
        .select("*, pods(name), challenge_participants(user_id)")
        .order("start_date", { ascending: false })

      if (!rawChallenges) { setLoading(false); return }

      // Fetch user's check-in counts per pod for progress
      const { data: checkins } = await supabase
        .from("checkins")
        .select("pod_id, created_at")
        .eq("user_id", user.id)

      const mapped: Challenge[] = rawChallenges.map((c: any) => {
        const participants = c.challenge_participants || []
        const joined = participants.some((p: any) => p.user_id === user.id)

        // Count check-ins within challenge date range for this pod
        const progress = (checkins || []).filter((ck: any) => {
          const ckDate = ck.created_at.split("T")[0]
          return ck.pod_id === c.pod_id && ckDate >= c.start_date && ckDate <= c.end_date
        }).length

        return {
          id: c.id,
          title: c.title,
          description: c.description || "",
          podId: c.pod_id,
          podName: c.pods?.name || "Unknown Pod",
          startDate: c.start_date,
          endDate: c.end_date,
          goal: c.goal,
          goalUnit: c.goal_unit || "check-ins",
          participantCount: participants.length,
          joined,
          progress,
        }
      })

      setChallenges(mapped)
      setLoading(false)
    }
    fetchChallenges()
  }, [user])

  const handleJoin = async (challengeId: string) => {
    if (!user) return
    setJoiningId(challengeId)
    try {
      const supabase = createClient()
      await supabase.from("challenge_participants").insert([{
        challenge_id: challengeId,
        user_id: user.id,
      }])
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, joined: true, participantCount: c.participantCount + 1 }
            : c
        )
      )
    } catch (err) {
      console.error("Failed to join challenge:", err)
    } finally {
      setJoiningId(null)
    }
  }

  const now = new Date().toISOString().split("T")[0]
  const active = challenges.filter((c) => c.endDate >= now)
  const past = challenges.filter((c) => c.endDate < now)
  const myChallenges = active.filter((c) => c.joined)
  const available = active.filter((c) => !c.joined)

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5">Compete</p>
        <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">Challenges</h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-2">Push yourself with pod challenges</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16">
          <Trophy size={40} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 mb-1">No challenges yet</p>
          <p className="text-xs text-zinc-400">Challenges will appear here when pod admins create them</p>
        </div>
      ) : (
        <>
          {/* My active challenges */}
          {myChallenges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                <Lightning size={12} weight="fill" className="inline mr-1 text-violet-500" />
                Your active challenges
              </h2>
              <div className="space-y-3">
                {myChallenges.map((c) => {
                  const pct = Math.min(100, Math.round((c.progress / c.goal) * 100))
                  const completed = c.progress >= c.goal
                  const daysLeft = Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000))
                  return (
                    <div key={c.id} className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-softer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {completed ? (
                              <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                            ) : (
                              <Target size={16} className="text-violet-500" />
                            )}
                            <h3 className="text-sm font-bold text-zinc-900">{c.title}</h3>
                          </div>
                          <Link href={`/pods/${c.podId}`} className="text-xs text-zinc-400 hover:text-violet-600 transition-colors">
                            {c.podName}
                          </Link>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                          <Clock size={10} />
                          {daysLeft}d left
                        </span>
                      </div>
                      {c.description && <p className="text-xs text-zinc-500 mb-3">{c.description}</p>}
                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                          <span className={completed ? "text-emerald-600" : "text-zinc-700"}>
                            {c.progress} / {c.goal} {c.goalUnit}
                          </span>
                          <span className={completed ? "text-emerald-600" : "text-zinc-400"}>{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${completed ? "bg-emerald-500" : "bg-violet-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <Users size={10} />
                        {c.participantCount} participant{c.participantCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Available challenges */}
          {available.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Available challenges
              </h2>
              <div className="space-y-3">
                {available.map((c) => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000))
                  return (
                    <div key={c.id} className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-softer">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 mb-0.5">{c.title}</h3>
                          <Link href={`/pods/${c.podId}`} className="text-xs text-zinc-400 hover:text-violet-600 transition-colors">
                            {c.podName}
                          </Link>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                          <Clock size={10} />
                          {daysLeft}d left
                        </span>
                      </div>
                      {c.description && <p className="text-xs text-zinc-500 mb-3">{c.description}</p>}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Target size={11} />
                            {c.goal} {c.goalUnit}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={11} />
                            {c.participantCount}
                          </span>
                        </div>
                        <button
                          onClick={() => handleJoin(c.id)}
                          disabled={joiningId === c.id}
                          className="text-xs font-semibold bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          {joiningId === c.id ? "Joining..." : "Join"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past challenges */}
          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Past challenges
              </h2>
              <div className="space-y-2">
                {past.map((c) => {
                  const completed = c.joined && c.progress >= c.goal
                  return (
                    <div key={c.id} className="bg-white border border-zinc-100 rounded-2xl p-4 opacity-70">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {completed ? (
                            <Star size={14} weight="fill" className="text-violet-500" />
                          ) : (
                            <Trophy size={14} className="text-zinc-300" />
                          )}
                          <span className="text-sm font-semibold text-zinc-700">{c.title}</span>
                          <span className="text-xs text-zinc-400">· {c.podName}</span>
                        </div>
                        {c.joined && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${completed ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}>
                            {c.progress}/{c.goal}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
