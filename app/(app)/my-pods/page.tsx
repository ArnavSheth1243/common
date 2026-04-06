"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Flame,
  Users,
  ArrowsClockwise,
  CalendarCheck,
  Crown,
  Sneaker,
  BookOpen,
  PencilSimple,
  Leaf,
  ForkKnife,
  GraduationCap,
  Bicycle,
  Barbell,
  Mountains,
  MusicNote,
  PaintBrush,
  Camera,
  CurrencyDollar,
  Tag,
  NotePencil,
  Drop,
  MapPin,
  Clock,
  SignOut,
} from "@phosphor-icons/react"
import { CADENCE_LABELS } from "@/lib/data"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"
import type { FC } from "react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoryIcons: Record<string, FC<any>> = {
  running: Sneaker, cycling: Bicycle, swimming: Drop, yoga: Leaf,
  strength: Barbell, hiking: Mountains, reading: BookOpen, writing: PencilSimple,
  journaling: NotePencil, meditation: Leaf, cooking: ForkKnife, learning: GraduationCap,
  music: MusicNote, art: PaintBrush, photography: Camera, finance: CurrencyDollar,
  fitness: Barbell, mindfulness: Leaf, productivity: GraduationCap, creativity: PaintBrush,
  other: Tag,
}

const CATEGORY_IMAGES: Record<string, string> = {
  running:      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=200&fit=crop&q=75",
  cycling:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=200&fit=crop&q=75",
  swimming:     "https://images.unsplash.com/photo-1504578879986-b5dca29e4200?w=600&h=200&fit=crop&q=75",
  yoga:         "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=200&fit=crop&q=75",
  strength:     "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&h=200&fit=crop&q=75",
  hiking:       "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=200&fit=crop&q=75",
  reading:      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=200&fit=crop&q=75",
  writing:      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=200&fit=crop&q=75",
  journaling:   "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=600&h=200&fit=crop&q=75",
  meditation:   "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=200&fit=crop&q=75",
  cooking:      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=200&fit=crop&q=75",
  learning:     "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=200&fit=crop&q=75",
  music:        "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=200&fit=crop&q=75",
  art:          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=200&fit=crop&q=75",
  photography:  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=200&fit=crop&q=75",
  finance:      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=200&fit=crop&q=75",
  other:        "https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=600&h=200&fit=crop&q=75",
}

interface MyPodData {
  id: string
  name: string
  category: string
  type: string
  cadence: string
  memberCount: number
  maxMembers: number | null
  streak: number
  isAdmin: boolean
  currentStreak: number
  longestStreak: number
  joinedAt: string
  location: string
  upcomingEvents: { id: string; title: string; date: string; time?: string }[]
}

export default function MyPodsPage() {
  const { user } = useSession()
  const [pods, setPods] = useState<MyPodData[]>([])
  const [loading, setLoading] = useState(true)
  const [leavingPodId, setLeavingPodId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchMyPods = async () => {
      const supabase = createClient()

      // Fetch memberships with pod data
      const { data: memberships } = await supabase
        .from("pod_members")
        .select("pod_id, is_admin, current_streak, longest_streak, joined_at, pods(*)")
        .eq("user_id", user.id)

      if (!memberships) { setLoading(false); return }

      const podIds = memberships.map((m: any) => m.pod_id)

      // Fetch upcoming events for these pods
      const today = new Date().toISOString().split("T")[0]
      const { data: events } = await supabase
        .from("pod_events")
        .select("id, pod_id, title, date, time")
        .in("pod_id", podIds)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(50)

      const eventsByPod: Record<string, any[]> = {}
      for (const ev of events || []) {
        const arr = eventsByPod[ev.pod_id] || []
        arr.push(ev)
        eventsByPod[ev.pod_id] = arr
      }

      const mapped: MyPodData[] = memberships.map((m: any) => {
        const p = m.pods
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          type: p.type,
          cadence: p.cadence,
          memberCount: p.member_count,
          maxMembers: p.max_members,
          streak: p.streak || 0,
          isAdmin: m.is_admin,
          currentStreak: m.current_streak || 0,
          longestStreak: m.longest_streak || 0,
          joinedAt: m.joined_at,
          location: p.location || "",
          upcomingEvents: (eventsByPod[p.id] || []).slice(0, 3),
        }
      })

      setPods(mapped)
      setLoading(false)
    }
    fetchMyPods()
  }, [user])

  const handleLeavePod = async (podId: string) => {
    if (!user) return
    setLeavingPodId(podId)
    try {
      const supabase = createClient()
      await supabase.from("pod_members").delete().eq("pod_id", podId).eq("user_id", user.id)
      setPods((prev) => prev.filter((p) => p.id !== podId))
    } catch (err) {
      console.error("Failed to leave pod:", err)
    } finally {
      setLeavingPodId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5">Your groups</p>
        <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">My Pods</h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-2">Track your pods, streaks, and upcoming events</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : pods.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 mb-1">No pods yet</p>
          <p className="text-xs text-zinc-400 mb-4">Join or create a pod to get started</p>
          <Link
            href="/pods"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Browse pods
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pods.map((pod) => {
            const Icon = categoryIcons[pod.category] ?? BookOpen
            const imgUrl = CATEGORY_IMAGES[pod.category]
            return (
              <div key={pod.id} className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-softer">
                {/* Image header */}
                <div className="h-28 overflow-hidden relative">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{pod.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${pod.type === "Habit" ? "bg-violet-500/80 text-white" : "bg-emerald-500/80 text-white"}`}>
                          {pod.type}
                        </span>
                        {pod.isAdmin && (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-violet-300">
                            <Crown size={10} weight="fill" /> Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Flame size={11} weight="fill" className="text-violet-500" />
                      <span className="text-xs font-bold text-violet-700">{pod.streak}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-zinc-900">{pod.currentStreak}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">Your streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-zinc-900">{pod.longestStreak}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">Best</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <Users size={13} className="text-zinc-400" />
                        <span className="text-lg font-bold text-zinc-900">{pod.memberCount}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-medium">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <ArrowsClockwise size={13} className="text-zinc-400" />
                      </div>
                      <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                        {CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS] || pod.cadence}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming events */}
                  {pod.upcomingEvents.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Upcoming</p>
                      <div className="space-y-1.5">
                        {pod.upcomingEvents.map((ev) => (
                          <div key={ev.id} className="flex items-center gap-2 bg-zinc-50 rounded-xl px-3 py-2">
                            <CalendarCheck size={13} className="text-zinc-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-zinc-700 flex-1 truncate">{ev.title}</span>
                            <span className="text-[10px] text-zinc-400 flex-shrink-0">
                              {new Date(ev.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              {ev.time && ` · ${ev.time}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/pods/${pod.id}`}
                      className="flex-1 text-center text-sm font-semibold bg-zinc-900 text-white py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      View pod
                    </Link>
                    <button
                      onClick={() => handleLeavePod(pod.id)}
                      disabled={leavingPodId === pod.id}
                      className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-rose-500 px-3 py-2.5 rounded-xl border border-zinc-100 hover:border-rose-200 transition-all disabled:opacity-50"
                    >
                      <SignOut size={13} />
                      Leave
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
