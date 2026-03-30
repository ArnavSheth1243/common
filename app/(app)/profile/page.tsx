"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Flame,
  Users,
  SignOut,
  ArrowRight,
} from "@phosphor-icons/react"
import { CADENCE_LABELS } from "@/lib/data"
import { useUserStats } from "@/app/context/user-stats"
import { useUserProfile } from "@/app/context/user-profile"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useSession()
  const { totalCheckins, currentStreak, longestStreak, podStreaks } = useUserStats()
  const { profile } = useUserProfile()

  const [myPods, setMyPods] = useState<any[]>([])
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const supabase = createClient()

      const { data: podMemberships } = await supabase
        .from("pod_members")
        .select("pod_id, pods(id, name, category, cadence)")
        .eq("user_id", user.id)

      if (podMemberships) {
        setMyPods(podMemberships.map((m: any) => m.pods).filter(Boolean))
      }

      const { data: checkins } = await supabase
        .from("checkins")
        .select("id, content, streak_count, created_at, pods(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (checkins) {
        setRecentCheckins(checkins.map((c: any) => ({
          id: c.id,
          content: c.content,
          streakCount: c.streak_count,
          time: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          podName: c.pods?.name || "Unknown Pod",
        })))
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const displayName = profile?.displayName || "User"
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)
  const bio = profile?.bio || ""
  const location = profile?.location || ""

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 w-full">
      {/* Profile header */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{displayName}</h1>
            {bio && <p className="text-sm text-zinc-500 mt-0.5">{bio}</p>}
            {location && <p className="text-xs text-zinc-400 mt-0.5">{location}</p>}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-50 rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold text-zinc-900 tabular-nums">{totalCheckins}</div>
            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Check-ins</div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={16} weight="fill" className="text-amber-500" />
              <span className="text-2xl font-bold text-amber-700 tabular-nums">{currentStreak}</span>
            </div>
            <div className="text-[10px] text-amber-600 font-medium uppercase tracking-wider mt-0.5">Streak</div>
          </div>
          <div className="bg-zinc-50 rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold text-zinc-900 tabular-nums">{longestStreak}</div>
            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Best streak</div>
          </div>
        </div>
      </div>

      {/* Active Pods */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} weight="fill" className="text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Active Pods</h2>
        </div>
        {myPods.length > 0 ? (
          <div className="space-y-2">
            {myPods.map((pod: any) => (
              <Link
                key={pod.id}
                href={`/pods/${pod.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {pod.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors truncate">{pod.name}</div>
                  <div className="text-[10px] text-zinc-400">{CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS]}</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Flame size={10} weight="fill" />
                  <span>{podStreaks[pod.id] || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-zinc-400 mb-3">No pods yet</p>
            <Link href="/pods" className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              Explore pods <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        )}
      </div>

      {/* Recent check-ins */}
      {recentCheckins.length > 0 && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Recent Check-ins</h2>
          <div className="space-y-3">
            {recentCheckins.map((checkin: any) => (
              <div key={checkin.id} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 leading-snug">{checkin.content}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {checkin.podName} · {checkin.time}
                    {checkin.streakCount > 0 && (
                      <span className="ml-1.5 text-amber-600 font-semibold">Day {checkin.streakCount}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mx-auto"
      >
        <SignOut size={14} />
        Sign out
      </button>
    </div>
  )
}
