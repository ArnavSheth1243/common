"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  MagnifyingGlass,
  Flame,
  Users,
  InstagramLogo,
  ArrowUpRight,
  Globe,
  Lock,
} from "@phosphor-icons/react"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

const AVATAR_COLORS = [
  "bg-zinc-900 text-white", "bg-rose-500 text-white", "bg-violet-500 text-white",
  "bg-emerald-500 text-white", "bg-sky-500 text-white", "bg-violet-500 text-white",
  "bg-indigo-500 text-white", "bg-pink-500 text-white", "bg-teal-500 text-white",
  "bg-teal-500 text-white", "bg-cyan-500 text-white", "bg-fuchsia-500 text-white",
]
function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface PersonData {
  id: string
  displayName: string
  initials: string
  color: string
  bio: string
  instagramHandle: string
  isPublic: boolean
  checkinCount: number
  podNames: string[]
  slug: string
}

export default function PeoplePage() {
  const { user } = useSession()
  const [people, setPeople] = useState<PersonData[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const fetchPeople = async () => {
      const supabase = createClient()

      // Fetch all public profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, bio, instagram_handle, is_public, avatar_url")
        .order("display_name")

      if (!profiles) { setLoading(false); return }

      // Fetch pod memberships with pod names
      const { data: memberships } = await supabase
        .from("pod_members")
        .select("user_id, pods(name)")

      // Fetch checkin counts
      const { data: checkins } = await supabase
        .from("checkins")
        .select("user_id")

      // Build maps
      const podMap: Record<string, string[]> = {}
      for (const m of memberships || []) {
        const pods = podMap[m.user_id] || []
        const podName = (m.pods as any)?.name
        if (podName) pods.push(podName)
        podMap[m.user_id] = pods
      }

      const checkinMap: Record<string, number> = {}
      for (const c of checkins || []) {
        checkinMap[c.user_id] = (checkinMap[c.user_id] || 0) + 1
      }

      const mapped: PersonData[] = profiles
        .filter((p) => p.id !== user?.id) // exclude self
        .map((p) => {
          const name = p.display_name || "User"
          return {
            id: p.id,
            displayName: name,
            initials: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
            color: getAvatarColor(name),
            bio: p.bio || "",
            instagramHandle: p.instagram_handle || "",
            isPublic: p.is_public ?? true,
            checkinCount: checkinMap[p.id] || 0,
            podNames: podMap[p.id] || [],
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
          }
        })

      setPeople(mapped)
      setLoading(false)
    }
    fetchPeople()
  }, [user])

  const filtered = useMemo(() => {
    if (!query.trim()) return people
    const q = query.toLowerCase()
    return people.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.podNames.some((pn) => pn.toLowerCase().includes(q))
    )
  }, [people, query])

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5">Community</p>
        <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">People</h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-2">Find members and see what they&apos;re up to</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people or pods..."
          className="w-full bg-white border border-zinc-200 shadow-softer focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-200"
        />
      </div>

      {/* Results count */}
      <p className="text-xs text-zinc-400 mb-4">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 mb-1">No one found</p>
          <p className="text-xs text-zinc-400">Try a different search term</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((person) => (
            <Link
              key={person.id}
              href={`/profile/${person.slug}`}
              className="group bg-white border border-zinc-100 rounded-2xl p-4 hover:border-zinc-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full ${person.color} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {person.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-zinc-900 truncate group-hover:text-violet-700 transition-colors">
                      {person.displayName}
                    </span>
                    <span className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${person.isPublic ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}>
                      {person.isPublic ? <Globe size={8} /> : <Lock size={8} />}
                    </span>
                  </div>

                  {/* Bio */}
                  {person.bio && (
                    <p className="text-xs text-zinc-500 line-clamp-1 mb-1.5">{person.bio}</p>
                  )}

                  {/* Pods */}
                  {person.podNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {person.podNames.slice(0, 3).map((pn, i) => (
                        <span key={i} className="text-[10px] font-medium bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                          {pn}
                        </span>
                      ))}
                      {person.podNames.length > 3 && (
                        <span className="text-[10px] text-zinc-400">+{person.podNames.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3">
                    {person.checkinCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-violet-600 font-semibold">
                        <Flame size={10} weight="fill" />
                        {person.checkinCount} check-in{person.checkinCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {person.instagramHandle && (
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <InstagramLogo size={10} weight="duotone" />
                        @{person.instagramHandle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
