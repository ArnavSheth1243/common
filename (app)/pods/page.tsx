"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Flame,
  Users,
  MagnifyingGlass,
  Plus,
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
import { PODS, CADENCE_LABELS, MY_POD_IDS } from "@/lib/data"
import type { Pod } from "@/lib/data"
import { usePodState } from "@/app/context/pod-state"

const CATEGORY_IMAGES: Record<string, string> = {
  running:     "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=200&fit=crop&q=75",
  cycling:     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=200&fit=crop&q=75",
  swimming:    "https://images.unsplash.com/photo-1504578879986-b5dca29e4200?w=600&h=200&fit=crop&q=75",
  yoga:        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=200&fit=crop&q=75",
  strength:    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&h=200&fit=crop&q=75",
  hiking:      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=200&fit=crop&q=75",
  reading:     "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=200&fit=crop&q=75",
  writing:     "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=200&fit=crop&q=75",
  journaling:  "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=600&h=200&fit=crop&q=75",
  meditation:  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=200&fit=crop&q=75",
  cooking:     "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=200&fit=crop&q=75",
  learning:    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=200&fit=crop&q=75",
  music:       "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=200&fit=crop&q=75",
  art:         "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=200&fit=crop&q=75",
  photography: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=200&fit=crop&q=75",
  finance:     "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=200&fit=crop&q=75",
  other:       "https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=600&h=200&fit=crop&q=75",
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
  other: Tag,
}

function PodCard({ pod, featured = false }: { pod: Pod; featured?: boolean }) {
  const Icon = categoryIcons[pod.category] ?? BookOpen
  const spotsLeft = pod.maxMembers === null ? null : pod.maxMembers - pod.members
  const isFull = spotsLeft === 0
  const spotsLabel =
    pod.maxMembers === null ? "Open" : isFull ? "Full" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`
  const membersDisplay =
    pod.maxMembers === null ? `${pod.members}` : `${pod.members}/${pod.maxMembers}`
  const imgUrl = CATEGORY_IMAGES[pod.category]

  return (
    <Link
      href={`/pods/${pod.id}`}
      className="group block bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-softer hover:shadow-card-hover hover:border-zinc-200 hover:-translate-y-0.5 transition-all duration-300 ease-spring"
    >
      {/* Image banner */}
      <div className={`${featured ? "h-48" : "h-32"} overflow-hidden relative`}>
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-zinc-100" />
        )}
        {/* Streak badge overlaid on image */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-amber-100 rounded-full px-2.5 py-1">
          <Flame size={11} weight="fill" className="text-amber-500" />
          <span className="text-xs font-bold text-amber-700">{pod.streak}</span>
        </div>
        {/* Private badge */}
        {pod.visibility === "private" && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <Lock size={10} weight="fill" className="text-white/90" />
            <span className="text-[10px] font-bold text-white/90">Private</span>
          </div>
        )}
        {/* Location pill overlaid on bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
        >
          <div className="flex items-center gap-1.5">
            <MapPin size={11} weight="fill" className="text-white/90 flex-shrink-0" />
            <span className="text-xs font-semibold text-white/90 truncate">{pod.location}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
      {/* Header */}
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
                {CADENCE_LABELS[pod.cadence]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-2">{pod.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {pod.memberColors.slice(0, 4).map((color, i) => (
              <div key={i} className={`w-6 h-6 rounded-full ${color} border-2 border-white`} />
            ))}
            {pod.members > 4 && (
              <div className="w-6 h-6 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-zinc-500">
                +{pod.members - 4}
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
    <div className="col-span-2 py-10 text-center">
      <p className="text-sm text-zinc-400">No {type.toLowerCase()} pods match this filter</p>
    </div>
  )
}

export default function PodsPage() {
  const { createdPods, isMember } = usePodState()
  const [query, setQuery] = useState("")
  const [sizeFilter, setSizeFilter] = useState("any")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [radiusFilter, setRadiusFilter] = useState("any")
  const [savedPrefs, setSavedPrefs] = useState(false)

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

  // Combine static + dynamically created pods
  const allPods: Pod[] = [...createdPods as Pod[], ...PODS]
  const myPods = allPods.filter((p) => isMember(p.id))
  const discoverPods = allPods.filter((p) => !isMember(p.id))

  const filterFn = (p: Pod) => {
    const matchSize = sizeFilter === "any"
      || (sizeFilter === "3-6" && p.members >= 3 && p.members <= 6)
      || (sizeFilter === "7-10" && p.members >= 7 && p.members <= 10)
      || (sizeFilter === "10+" && p.members > 10)
    const matchType = typeFilter === "all" || p.type === typeFilter
    const matchLoc = !locationFilter || p.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())
    return matchSize && matchType && matchLoc && matchQ
  }

  const filteredMy = useMemo(() => myPods.filter(filterFn), [myPods, createdPods, sizeFilter, typeFilter, locationFilter, query])
  const filteredHabit = useMemo(
    () => discoverPods.filter((p) => p.type === "Habit").filter(filterFn),
    [discoverPods, createdPods, sizeFilter, typeFilter, locationFilter, query]
  )
  const filteredExplore = useMemo(
    () => discoverPods.filter((p) => p.type === "Explore").filter(filterFn),
    [discoverPods, createdPods, sizeFilter, typeFilter, locationFilter, query]
  )

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5">Discover</p>
          <h1 className="text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">Pods</h1>
          <p className="text-base text-zinc-400 mt-2.5">Find your group</p>
        </div>
        <Link
          href="/pods/new"
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-all duration-200 ease-spring active:scale-[0.97] shadow-sm mt-1"
        >
          <Plus size={15} weight="bold" />
          New pod
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
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

      {/* Filters */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-5 mb-8 space-y-5">
        {/* Size */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2.5">Group size</label>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Any size", value: "any" },
              { label: "3–6 people", value: "3-6" },
              { label: "7–10 people", value: "7-10" },
              { label: "10+ people", value: "10+" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSizeFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                  sizeFilter === opt.value
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2.5">Type</label>
          <div className="flex gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Habit", value: "Habit" },
              { label: "Explore", value: "Explore" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                  typeFilter === opt.value
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2.5">Location</label>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              placeholder="City or neighborhood..."
              className="flex-1 min-w-[160px] bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-xl px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
            />
            <select
              value={radiusFilter}
              onChange={e => setRadiusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-600 outline-none focus:border-amber-400 transition-all"
            >
              <option value="any">Any radius</option>
              <option value="5">Within 5 mi</option>
              <option value="10">Within 10 mi</option>
              <option value="25">Within 25 mi</option>
            </select>
          </div>
        </div>

        {/* Save preferences */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-50">
          <button
            onClick={handleClearFilters}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Clear filters
          </button>
          <button
            onClick={handleSavePreferences}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
              savedPrefs
                ? "bg-emerald-50 text-emerald-600"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {savedPrefs ? "Preferences saved" : "Save preferences"}
          </button>
        </div>
      </div>

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
