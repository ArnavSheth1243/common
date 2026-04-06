"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarBlank,
  MapPin,
  Plus,
  MagnifyingGlass,
  Users,
  Clock,
} from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/app/context/session"
import { usePodState } from "@/app/context/pod-state"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

const CATEGORY_IMAGES: Record<string, string> = {
  running:      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=300&fit=crop&q=75",
  cycling:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=300&fit=crop&q=75",
  swimming:     "https://images.unsplash.com/photo-1504578879986-b5dca29e4200?w=600&h=300&fit=crop&q=75",
  yoga:         "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=300&fit=crop&q=75",
  strength:     "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&h=300&fit=crop&q=75",
  hiking:       "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=300&fit=crop&q=75",
  reading:      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=300&fit=crop&q=75",
  writing:      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=300&fit=crop&q=75",
  journaling:   "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=600&h=300&fit=crop&q=75",
  meditation:   "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=300&fit=crop&q=75",
  cooking:      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=300&fit=crop&q=75",
  learning:     "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=300&fit=crop&q=75",
  music:        "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=300&fit=crop&q=75",
  art:          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=300&fit=crop&q=75",
  photography:  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=300&fit=crop&q=75",
  finance:      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=300&fit=crop&q=75",
  pickleball:   "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=300&fit=crop&q=75",
  tennis:       "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=300&fit=crop&q=75",
  basketball:   "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=300&fit=crop&q=75",
  soccer:       "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=300&fit=crop&q=75",
  golf:         "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=300&fit=crop&q=75",
  volleyball:   "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=300&fit=crop&q=75",
  martial_arts: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&h=300&fit=crop&q=75",
  climbing:     "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=300&fit=crop&q=75",
  surfing:      "https://images.unsplash.com/photo-1502680390548-bdbac40e0100?w=600&h=300&fit=crop&q=75",
  skating:      "https://images.unsplash.com/photo-1564429238961-2b3301e25e28?w=600&h=300&fit=crop&q=75",
  dance:        "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&h=300&fit=crop&q=75",
  other:        "https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=600&h=300&fit=crop&q=75",
}

interface EventRow {
  id: string
  pod_id: string | null
  title: string
  date: string
  time: string | null
  end_time: string | null
  location: string | null
  description: string | null
  created_by: string | null
  is_public: boolean
  image_url: string | null
  category: string | null
  pods?: { id: string; name: string; category: string } | null
  hostName?: string
  rsvpCount?: number
}

const CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Cycling", value: "cycling" },
  { label: "Yoga", value: "yoga" },
  { label: "Hiking", value: "hiking" },
  { label: "Pickleball", value: "pickleball" },
  { label: "Tennis", value: "tennis" },
  { label: "Basketball", value: "basketball" },
  { label: "Climbing", value: "climbing" },
]

const DATE_FILTERS = [
  { label: "Upcoming", value: "all" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function formatTime(time: string | null) {
  if (!time) return null
  const [h, m] = time.split(":")
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}

function EventCard({ event }: { event: EventRow }) {
  const podState = usePodState()
  const myRsvp = podState.getRsvp(event.id)
  const category = event.category || event.pods?.category || "other"
  const imgUrl = event.image_url || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.other
  const hostLabel = event.pods?.name || event.hostName || "Solo event"

  const handleRsvp = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await podState.setRsvp(event.id, "going")
    } catch (err) {
      console.error("RSVP failed:", err)
    }
  }

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Card className="overflow-hidden hover:shadow-2 hover:border-zinc-300 transition-all duration-150">
        <div className="h-36 overflow-hidden relative">
          <img
            src={imgUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1 shadow-sm">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-violet-600 leading-none mb-0.5">
              {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
            </div>
            <div className="text-base font-bold text-foreground leading-none">
              {new Date(event.date + "T00:00:00").getDate()}
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-foreground leading-tight mb-1 truncate">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
            <Clock size={11} />
            <span>{formatDate(event.date)}{event.time && ` · ${formatTime(event.time)}`}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
              <MapPin size={11} />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] text-muted-foreground truncate">
                hosted by <span className="font-medium text-foreground">{hostLabel}</span>
              </span>
            </div>
            <button
              onClick={handleRsvp}
              className={cn(
                "text-[11px] font-semibold px-3 py-1 rounded-full transition-all flex-shrink-0",
                myRsvp === "going"
                  ? "bg-emerald-500 text-white"
                  : "bg-foreground text-background hover:bg-foreground/90",
              )}
            >
              {myRsvp === "going" ? "Going" : "RSVP"}
            </button>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function EventsPage() {
  const { user } = useSession()
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    const fetchEvents = async () => {
      const sb = createClient()
      try {
        const today = new Date().toISOString().split("T")[0]
        const { data, error } = await sb
          .from("pod_events")
          .select("*, pods(id, name, category)")
          .eq("is_public", true)
          .gte("date", today)
          .order("date", { ascending: true })

        if (error) console.error("events fetch error:", error)

        // Get host names for solo events
        const soloCreatorIds = Array.from(
          new Set(
            (data || [])
              .filter((e: any) => !e.pod_id && e.created_by)
              .map((e: any) => e.created_by),
          ),
        )

        const profileMap: Record<string, string> = {}
        if (soloCreatorIds.length > 0) {
          const { data: profiles } = await sb
            .from("profiles")
            .select("id, display_name")
            .in("id", soloCreatorIds)
          ;(profiles || []).forEach((p: any) => {
            profileMap[p.id] = p.display_name || "?"
          })
        }

        // Get RSVP counts
        const eventIds = (data || []).map((e: any) => e.id)
        const rsvpCounts: Record<string, number> = {}
        if (eventIds.length > 0) {
          const { data: rsvps } = await sb
            .from("event_rsvps")
            .select("event_id")
            .eq("status", "going")
            .in("event_id", eventIds)
          ;(rsvps || []).forEach((r: any) => {
            rsvpCounts[r.event_id] = (rsvpCounts[r.event_id] || 0) + 1
          })
        }

        const enriched = (data || []).map((e: any) => ({
          ...e,
          hostName: e.created_by ? profileMap[e.created_by] : undefined,
          rsvpCount: rsvpCounts[e.id] || 0,
        }))

        setEvents(enriched)
      } catch (err) {
        console.error("Failed to fetch events:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [user])

  const filtered = useMemo(() => {
    const now = new Date()
    return events.filter((e) => {
      // Category filter
      const cat = e.category || e.pods?.category
      if (categoryFilter !== "all" && cat !== categoryFilter) return false

      // Date filter
      if (dateFilter !== "all") {
        const eventDate = new Date(e.date + "T00:00:00")
        const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        if (dateFilter === "week" && diffDays > 7) return false
        if (dateFilter === "month" && diffDays > 30) return false
      }

      // Search
      if (query) {
        const q = query.toLowerCase()
        if (
          !e.title.toLowerCase().includes(q) &&
          !(e.description || "").toLowerCase().includes(q) &&
          !(e.location || "").toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [events, categoryFilter, dateFilter, query])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <PageHeader
        title="Explore"
        description="One-off events from pods and people in your community."
        action={
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/events/new" className="gap-2">
              <Plus size={16} weight="bold" />
              Create event
            </Link>
          </Button>
        }
      />

      {/* Pods | Events segmented toggle */}
      <div className="inline-flex bg-zinc-100 rounded-full p-1 mb-5">
        <Link
          href="/pods"
          className="px-5 py-1.5 rounded-full text-sm font-semibold text-zinc-500 hover:text-foreground transition-all"
        >
          Pods
        </Link>
        <Link
          href="/events"
          className="px-5 py-1.5 rounded-full text-sm font-semibold bg-white text-foreground shadow-sm transition-all"
        >
          Events
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <MagnifyingGlass
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events..."
          className="w-full bg-card border border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150"
        />
      </div>

      {/* Date filter */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {DATE_FILTERS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDateFilter(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 flex-shrink-0",
              dateFilter === opt.value
                ? "bg-foreground border-foreground text-background"
                : "bg-card border-border text-muted-foreground hover:border-zinc-300",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORY_FILTERS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setCategoryFilter(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 flex-shrink-0 capitalize",
              categoryFilter === opt.value
                ? "bg-foreground border-foreground text-background"
                : "bg-card border-border text-muted-foreground hover:border-zinc-300",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarBlank size={36} />}
          title="No events found"
          description={
            events.length === 0
              ? "Be the first to host an event."
              : "Try a different filter or search."
          }
          action={
            <Button asChild>
              <Link href="/events/new" className="gap-2">
                <Plus size={16} weight="bold" />
                Create event
              </Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
