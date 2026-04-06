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
  Compass,
  Racquet,
  TennisBall,
  Basketball,
  SoccerBall,
  Golf,
  Volleyball,
  HandFist,
  Wall,
  Waves,
} from "@phosphor-icons/react"
import type { FC } from "react"
import { CADENCE_LABELS } from "@/lib/data"
import type { Pod } from "@/lib/data"
import { usePodState } from "@/app/context/pod-state"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

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
  pickleball:   "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=200&fit=crop&q=75",
  tennis:       "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=200&fit=crop&q=75",
  basketball:   "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=200&fit=crop&q=75",
  soccer:       "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=200&fit=crop&q=75",
  golf:         "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=200&fit=crop&q=75",
  volleyball:   "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=200&fit=crop&q=75",
  martial_arts: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&h=200&fit=crop&q=75",
  climbing:     "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=200&fit=crop&q=75",
  surfing:      "https://images.unsplash.com/photo-1502680390548-bdbac40e0100?w=600&h=200&fit=crop&q=75",
  skating:      "https://images.unsplash.com/photo-1564429238961-2b3301e25e28?w=600&h=200&fit=crop&q=75",
  dance:        "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&h=200&fit=crop&q=75",
  other:        "https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=600&h=200&fit=crop&q=75",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoryIcons: Record<string, FC<any>> = {
  running: Sneaker, cycling: Bicycle, swimming: Drop, yoga: Leaf,
  strength: Barbell, hiking: Mountains, reading: BookOpen, writing: PencilSimple,
  journaling: NotePencil, meditation: Leaf, cooking: ForkKnife, learning: GraduationCap,
  music: MusicNote, art: PaintBrush, photography: Camera, finance: CurrencyDollar,
  fitness: Barbell, mindfulness: Leaf, productivity: GraduationCap, creativity: PaintBrush,
  pickleball: Racquet, tennis: TennisBall, basketball: Basketball, soccer: SoccerBall,
  golf: Golf, volleyball: Volleyball, martial_arts: HandFist, climbing: Wall,
  surfing: Waves, skating: Sneaker, dance: MusicNote,
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
      className="group block overflow-hidden"
    >
      <Card className="overflow-hidden hover:shadow-2 hover:border-zinc-300 transition-all duration-150">
        {/* Image */}
        <div className={cn("overflow-hidden relative", featured ? "h-44" : "h-32")}>
          {imgUrl ? (
            <img
              src={imgUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          {pod.streak > 0 && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1">
              <Flame size={11} weight="fill" className="text-blue-500" />
              <span className="text-xs font-bold text-blue-800">{pod.streak}</span>
            </div>
          )}
          {pod.visibility === "private" && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
              <Lock size={10} weight="fill" className="text-white/90" />
              <span className="text-[10px] font-bold text-white/90">Private</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={18} weight="duotone" className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
                {pod.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS] || pod.cadence}
                </span>
                {pod.location && (
                  <>
                    <span className="text-zinc-300">·</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {pod.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {pod.description || "No description"}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {(pod.memberProfiles || []).slice(0, 4).map((m: any, i: number) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[7px] font-bold border-2 border-card"
                    title={m.name}
                  >
                    {m.initials}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {membersDisplay} members
              </span>
            </div>
            <span
              className={cn(
                "text-[11px] font-medium px-2 py-0.5 rounded-md",
                isFull
                  ? "bg-muted text-muted-foreground"
                  : "bg-foreground text-background",
              )}
            >
              {spotsLabel}
            </span>
          </div>
        </div>
      </Card>
    </Link>
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
        const { data: pods, error: podsError } = await sb
          .from("pods")
          .select("*, pod_members(user_id)")
          .order("created_at", { ascending: false })

        if (podsError) console.error("Supabase pods query error:", podsError)

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
    [discoverPods, sizeFilter, typeFilter, locationFilter, query],
  )
  const filteredExplore = useMemo(
    () => discoverPods.filter((p) => p.type === "Explore").filter(filterFn),
    [discoverPods, sizeFilter, typeFilter, locationFilter, query],
  )

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading pods...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <PageHeader
        title="Explore"
        description="Thousands of recurring activities. Find one, join a pod, show up."
        action={
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/pods/new" className="gap-2">
              <Plus size={16} weight="bold" />
              Create pod
            </Link>
          </Button>
        }
      />

      {/* Pods | Events segmented toggle */}
      <div className="inline-flex bg-zinc-100 rounded-full p-1 mb-5">
        <Link
          href="/pods"
          className="px-5 py-1.5 rounded-full text-sm font-semibold bg-white text-foreground shadow-sm transition-all"
        >
          Pods
        </Link>
        <Link
          href="/events"
          className="px-5 py-1.5 rounded-full text-sm font-semibold text-zinc-500 hover:text-foreground transition-all"
        >
          Events
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pods..."
            className="w-full bg-card border border-border focus:border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150"
          />
        </div>
        <Button
          variant={showFilters || sizeFilter !== "any" || typeFilter !== "all" || locationFilter ? "default" : "outline"}
          size="default"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5"
        >
          <Faders size={16} />
          Filters
          {(sizeFilter !== "any" || typeFilter !== "all" || locationFilter) && (
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          )}
        </Button>
      </div>

      {/* Type pills */}
      <div className="flex gap-1.5 mb-5">
        {[
          { label: "All", value: "all" },
          { label: "Habit", value: "Habit" },
          { label: "Explore", value: "Explore" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTypeFilter(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
              typeFilter === opt.value
                ? "bg-foreground border-foreground text-background"
                : "bg-card border-border text-muted-foreground hover:border-zinc-300",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <Card className="mb-5">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Group size
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { label: "Any", value: "any" },
                  { label: "3-6", value: "3-6" },
                  { label: "7-10", value: "7-10" },
                  { label: "10+", value: "10+" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSizeFilter(opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                      sizeFilter === opt.value
                        ? "bg-foreground border-foreground text-background"
                        : "bg-accent border-border text-muted-foreground hover:border-zinc-300",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Location
              </label>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="City or neighborhood..."
                  className="flex-1 min-w-[140px] bg-accent border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
                />
                <select
                  value={radiusFilter}
                  onChange={(e) => setRadiusFilter(e.target.value)}
                  className="bg-accent border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground outline-none focus:border-primary transition-all"
                >
                  <option value="any">Any radius</option>
                  <option value="5">5 mi</option>
                  <option value="10">10 mi</option>
                  <option value="25">25 mi</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
              <Button
                size="sm"
                variant={savedPrefs ? "secondary" : "default"}
                onClick={handleSavePreferences}
              >
                {savedPrefs ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* My pods */}
      {filteredMy.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            My pods
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {filteredMy.map((pod) => (
              <PodCard key={pod.id} pod={pod} />
            ))}
          </div>
        </section>
      )}

      {/* Habit Pods */}
      {(typeFilter === "all" || typeFilter === "Habit") && (
        <section className="mb-8">
          <div className="flex items-baseline gap-2 mb-3">
            <h2 className="text-base font-bold text-foreground">Habit Pods</h2>
            <span className="text-xs text-muted-foreground">Build something consistent</span>
          </div>
          {filteredHabit.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredHabit.map((pod, i) => (
                <div key={pod.id} className={i === 0 ? "md:col-span-2" : ""}>
                  <PodCard pod={pod} featured={i === 0} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Compass size={36} />}
              title="No habit pods found"
              description="Try adjusting your filters or create your own."
            />
          )}
        </section>
      )}

      {/* Explore Pods */}
      {(typeFilter === "all" || typeFilter === "Explore") && (
        <section>
          <div className="flex items-baseline gap-2 mb-3">
            <h2 className="text-base font-bold text-foreground">Explore Pods</h2>
            <span className="text-xs text-muted-foreground">Try something new</span>
          </div>
          {filteredExplore.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredExplore.map((pod, i) => (
                <div key={pod.id} className={i === 0 ? "md:col-span-2" : ""}>
                  <PodCard pod={pod} featured={i === 0} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Compass size={36} />}
              title="No explore pods found"
              description="Try adjusting your filters or create your own."
            />
          )}
        </section>
      )}
    </div>
  )
}
