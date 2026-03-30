"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Flame,
  Users,
  MagnifyingGlass,
  Plus,
  Faders,
  Sneaker,
  BookOpen,
  PencilSimple,
  Leaf,
  ForkKnife,
  GraduationCap,
  ArrowsClockwise,
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
  Lock,
} from "@phosphor-icons/react"
import type { FC } from "react"
import { CADENCE_LABELS } from "@/lib/data"
import type { Pod } from "@/lib/data"
import { usePodState } from "@/app/context/pod-state"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

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
  fitness:      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=200&fit=crop&q=75",
  mindfulness:  "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=600&h=200&fit=crop&q=75",
  productivity: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=200&fit=crop&q=75",
  creativity:   "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=200&fit=crop&q=75",
  other:        "https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=600&h=200&fit=crop&q=75",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoryIcons: Record<string, FC<any>> = {
  running: Sneaker,
  cycling: Bicycle,
  swimming: Drop,
  yoga: Leaf,
  strength: Barbell,
  hiking: Mountains,
  reading: BookOpen,
  writing: PencilSimple,
  journaling: NotePencil,
  meditation: Leaf,
  cooking: ForkKnife,
  learning: GraduationCap,
  music: MusicNote,
  art: PaintBrush,
  photography: Camera,
  finance: CurrencyDollar,
  fitness: Barbell,
  mindfulness: Leaf,
  productivity: GraduationCap,
  creativity: PaintBrush,
  other: Tag,
}

function PodCard({ pod, featured = false }: { pod: any; featured?: boolean }) {
  const Icon = categoryIcons[pod.category] ?? BookOpen
  const spotsLeft = pod.max_members === null ? null : pod.max_members - pod.member_count
  const isFull = spotsLeft === 0
  const spotsLabel =
    pod.max_members === null ? "Open" : isFull ? "Full" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`
  const membersDisplay =
    pod.max_members === null ? `${pod.member_count}` : `${pod.member_count}/${pod.max_members}`
  const imgUrl = pod.image_url || CATEGORY_IMAGES[pod.category]

  return (
    <Link
      href={`/pods/${pod.id}`}
      className="group block bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-softer hover:shadow-card-hover hover:border-zinc-200 hover:-translate-y-0.5 transition-all duration-300 ease-spring"
    >
      <div className={`${featured ? "h-48" : "h-32"} overflow-hidden relative`}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-zinc-100" />
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-amber-100 rounded-full px-2.5 py-1">
          <Flame size={11} weight="fill" className="text-amber-500" />
          <span className="text-xs font-bold text-amber-700">{pod.streak || 0}</span>
        </div>
        {pod.visibility === "private" && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <Lock size={10} weight="fill" className="text-white/90" />
            <span className="text-[10px] font-bold text-white/90">Private</span>
          </div>
        )}
        {pod.location ? (
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
          >
            <div className="flex items-center gap-1.5">
              <MapPin size={11} weight="fill" className="text-white/90 flex-shrink-0" />
              <span className="text-xs font-semibold text-white/90 truncate">{pod.location}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-50 transition-colors">
              <Icon
                size={20}
                weight="duotone"
                className="text-zinc-500 group-hover:text-amber-600 transition-colors"
              />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-zinc-900 leading-tight">{pod.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span
                  className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${
                    pod.type === "Habit"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {pod.type}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <ArrowsClockwise size={9} />
                  {CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS] || pod.cadence}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-2">{pod.description || "No description"}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {(pod.memberProfiles || []).slice(0, 4).map((m: any, i: number) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[8px] font-bold border-2 border-white"
                  title={m.name}
                >
                  {m.initials}
                </div>
              ))}
              {pod.member_count > 4 && (
                <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-[8px] font-bold border-2 border-white">
                  +{pod.member_count - 4}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Users size={12} />
              <span>{membersDisplay}</span>
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              isFull ? "bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white"
            }`}
          >
            {spotsLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}

function EmptySection({ type }: { type: "Habit" | "Explore" }) {
  return (
    <div className="col-span-full py-10 text-center">
      <p className="text-sm text-zinc-400">No {type.toLowerCase()} pods match this filter</p>
    </div>
  )
}

export default function PodsPage() {
  const { user } = useSession()
  const { isMember } = usePodState()
  const [allPods, setAllPods] = useState<any[]>([])
  const [myPodIds, setMyPodIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [sizeFilter, setSizeFilter] = useState("any")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [radiusFilter, setRadiusFilter] = useState("any")
  const [savedPrefs, setSavedPrefs] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchPods = async () => {
      const sb = createClient()
      try {
        // Fetch all pods with their members
        // Fetch pods
        const { data: pods, error: podsError } = await sb
          .from("pods")
          .select("*, pod_members(user_id)")
          .order("created_at", { ascending: false })

        if (podsError) {
          console.error("Supabase pods query error:", podsError)
        }

        // Fetch all profiles for member name lookups
        const memberUserIds = new Set<string>()
        ;(pods || []).forEach((p: any) => {
          (p.pod_members || []).forEach((m: any) => memberUserIds.add(m.user_id))
        })

        const profileMap: Record<string, string> = {}
        if (memberUserIds.size > 0) {
          const { data: profiles } = await sb
            .from("profiles")
            .select("id, display_name")
            .in("id", Array.from(memberUserIds))

          ;(profiles || []).forEach((p: any) => {
            profileMap[p.id] = p.display_name || "?"
          })
        }

        // Attach member initials to each pod
        const podsWithMembers = (pods || []).map((p: any) => ({
          ...p,
          memberProfiles: (p.pod_members || []).slice(0, 5).map((m: any) => {
            const name = profileMap[m.user_id] || "?"
            return {
              initials: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2),
              name,
            }
          }),
        }))

        setAllPods(podsWithMembers)

        // Fetch user's pod memberships
        if (user) {
          const { data: memberships } = await sb
            .from("pod_members")
            .select("pod_id")
            .eq("user_id", user.id)

          setMyPodIds(new Set((memberships || []).map((m: any) => m.pod_id)))
        }
      } catch (err) {
        console.error("Failed to fetch pods:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPods()
  }, [user])

  const handleSavePreferences = () => {
    setSavedPrefs(true)
    setTimeout(() => setSavedPrefs(false), 2000)
  }

  const handleClearFilters = () => {
    setSizeFilter("any")
    setTypeFilter("all")
    setLocationFilter("")
    setRadiusFilter("any")
    setQuery("")
  }

  const myPods = allPods.filter((p) => myPodIds.has(p.id))
  const discoverPods = allPods.filter((p) => !myPodIds.has(p.id))

  const filterFn = (p: any) => {
    const matchSize = sizeFilter === "any"
      || (sizeFilter === "3-6" && p.member_count >= 3 && p.member_count <= 6)
      || (sizeFilter === "7-10" && p.member_count >= 7 && p.member_count <= 10)
      || (sizeFilter === "10+" && p.member_count > 10)
    const matchType = typeFilter === "all" || p.type === typeFilter
    const matchLoc = !locationFilter || (p.location || "").toLowerCase().includes(locationFilter.toLowerCase())
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || (p.description || "").toLowerCase().includes(query.toLowerCase())
    return matchSize && matchType && matchLoc && matchQ
  }

  const filteredMy = useMemo(() => myPods.filter(filterFn), [myPods, sizeFilter, typeFilter, locationFilter, query])
  const filteredHabit = useMemo(
    () => discoverPods.filter((p) => p.type === "Habit").filter(filterFn),
    [discoverPods, sizeFilter, typeFilter, locationFilter, query]
  )
  const filteredExplore = useMemo(
    () => discoverPods.filter((p) => p.type === "Explore").filter(filterFn),
    [discoverPods, sizeFilter, typeFilter, locationFilter, query]
  )

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8">
        <div className="text-center py-12 text-zinc-400">Loading pods...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8">
      <div className="mb-8 sm:mb-10 animate-fade-up">
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5">Discover</p>
          <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">Pods</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-2">Find your people. Pick a pod, show up daily.</p>
        </div>
        <Link
          href="/pods/new"
          className="flex items-center justify-center gap-2.5 w-full bg-amber-500 hover:bg-amber-600 text-white text-sm sm:text-base font-bold px-6 py-4 rounded-2xl transition-all duration-200 ease-spring active:scale-[0.98] shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)]"
        >
          <Plus size={18} weight="bold" />
          Create a pod
        </Link>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pods..."
            className="w-full bg-white border border-zinc-200 shadow-softer focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-200"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            showFilters || sizeFilter !== "any" || typeFilter !== "all" || locationFilter
              ? "bg-zinc-900 border-zinc-900 text-white"
              : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
          }`}
        >
          <Faders size={16} />
          Filters
          {(sizeFilter !== "any" || typeFilter !== "all" || locationFilter) && (
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Quick type pills — always visible */}
      <div className="flex gap-1.5 mb-4">
        {[
          { label: "All", value: "all" },
          { label: "Habit", value: "Habit" },
          { label: "Explore", value: "Explore" },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setTypeFilter(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              typeFilter === opt.value
                ? "bg-zinc-900 border-zinc-900 text-white"
                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-5 mb-6 space-y-4 animate-fade-up">
          {/* Size */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Group size</label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: "Any", value: "any" },
                { label: "3–6", value: "3-6" },
                { label: "7–10", value: "7-10" },
                { label: "10+", value: "10+" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSizeFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
                    sizeFilter === opt.value
                      ? "bg-zinc-900 border-zinc-900 text-white"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Location</label>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                placeholder="City or neighborhood..."
                className="flex-1 min-w-[140px] bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
              />
              <select
                value={radiusFilter}
                onChange={e => setRadiusFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-600 outline-none focus:border-amber-400 transition-all"
              >
                <option value="any">Any radius</option>
                <option value="5">5 mi</option>
                <option value="10">10 mi</option>
                <option value="25">25 mi</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
            <button
              onClick={handleClearFilters}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Clear all
            </button>
            <button
              onClick={handleSavePreferences}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
                savedPrefs
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {savedPrefs ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Section: My pods */}
      {filteredMy.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            My pods
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredMy.map((pod) => (
              <PodCard key={pod.id} pod={pod} />
            ))}
          </div>
        </div>
      )}

      {/* Section: Habit Pods */}
      {(typeFilter === "all" || typeFilter === "Habit") && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Habit Pods</h2>
              <span className="text-xs text-zinc-400">Build something consistent</span>
            </div>
          </div>
          {filteredHabit.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredHabit.map((pod, i) => (
                <div key={pod.id} className={i === 0 ? "md:col-span-2" : ""}>
                  <PodCard pod={pod} featured={i === 0} />
                </div>
              ))}
            </div>
          ) : (
            <EmptySection type="Habit" />
          )}
        </div>
      )}

      {/* Section: Explore Pods */}
      {(typeFilter === "all" || typeFilter === "Explore") && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Explore Pods</h2>
              <span className="text-xs text-zinc-400">Try something new</span>
            </div>
          </div>
          {filteredExplore.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredExplore.map((pod, i) => (
                <div key={pod.id} className={i === 0 ? "md:col-span-2" : ""}>
                  <PodCard pod={pod} featured={i === 0} />
                </div>
              ))}
            </div>
          ) : (
            <EmptySection type="Explore" />
          )}
        </div>
      )}
    </div>
  )
}
