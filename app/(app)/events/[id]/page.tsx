"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarBlank,
  Clock,
  MapPin,
  Users,
  Trash,
} from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/app/context/session"
import { usePodState } from "@/app/context/pod-state"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { cn } from "@/lib/utils"
import type { RsvpStatus } from "@/lib/data"

const CATEGORY_IMAGES: Record<string, string> = {
  running:      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&h=400&fit=crop&q=80",
  cycling:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=400&fit=crop&q=80",
  swimming:     "https://images.unsplash.com/photo-1504578879986-b5dca29e4200?w=900&h=400&fit=crop&q=80",
  yoga:         "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&h=400&fit=crop&q=80",
  strength:     "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=900&h=400&fit=crop&q=80",
  hiking:       "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&h=400&fit=crop&q=80",
  pickleball:   "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&h=400&fit=crop&q=80",
  tennis:       "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&h=400&fit=crop&q=80",
  basketball:   "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&h=400&fit=crop&q=80",
  soccer:       "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&h=400&fit=crop&q=80",
  climbing:     "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=900&h=400&fit=crop&q=80",
  other:        "https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=900&h=400&fit=crop&q=80",
}

interface EventData {
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
}

interface Attendee {
  user_id: string
  status: RsvpStatus
  display_name: string
  avatar_url: string | null
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
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

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSession()
  const podState = usePodState()
  const eventId = params?.id as string

  const [event, setEvent] = useState<EventData | null>(null)
  const [hostName, setHostName] = useState<string | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!eventId) return

    const fetchEvent = async () => {
      const sb = createClient()
      try {
        const { data, error } = await sb
          .from("pod_events")
          .select("*, pods(id, name, category)")
          .eq("id", eventId)
          .single()

        if (error || !data) {
          console.error("event fetch error:", error)
          setLoading(false)
          return
        }

        setEvent(data as any)

        // Get host name for solo events
        if (!data.pod_id && data.created_by) {
          const { data: profile } = await sb
            .from("profiles")
            .select("display_name")
            .eq("id", data.created_by)
            .single()
          if (profile) setHostName((profile as any).display_name)
        }

        // Get attendees
        const { data: rsvps } = await sb
          .from("event_rsvps")
          .select("user_id, status")
          .eq("event_id", eventId)
          .eq("status", "going")

        if (rsvps && rsvps.length > 0) {
          const userIds = rsvps.map((r: any) => r.user_id)
          const { data: profiles } = await sb
            .from("profiles")
            .select("id, display_name, avatar_url")
            .in("id", userIds)

          const profileMap: Record<string, any> = {}
          ;(profiles || []).forEach((p: any) => {
            profileMap[p.id] = p
          })

          setAttendees(
            rsvps.map((r: any) => ({
              user_id: r.user_id,
              status: r.status,
              display_name: profileMap[r.user_id]?.display_name || "Someone",
              avatar_url: profileMap[r.user_id]?.avatar_url || null,
            })),
          )
        }
      } catch (err) {
        console.error("Failed to fetch event:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [eventId])

  const myRsvp = podState.getRsvp(eventId)

  const handleRsvp = async (status: RsvpStatus) => {
    try {
      await podState.setRsvp(eventId, status)
      // Optimistically refresh attendees if going
      if (status === "going" && user && event) {
        const sb = createClient()
        const { data: profile } = await sb
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .single()
        const exists = attendees.some((a) => a.user_id === user.id)
        if (!exists && profile) {
          setAttendees((prev) => [
            ...prev,
            {
              user_id: user.id,
              status: "going",
              display_name: (profile as any).display_name || "You",
              avatar_url: (profile as any).avatar_url || null,
            },
          ])
        }
      } else if (status !== "going") {
        setAttendees((prev) => prev.filter((a) => a.user_id !== user?.id))
      }
    } catch (err) {
      console.error("Failed to RSVP:", err)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this event? This cannot be undone.")) return
    setDeleting(true)
    try {
      const sb = createClient()
      const { error } = await sb.from("pod_events").delete().eq("id", eventId)
      if (error) throw error
      router.push("/events")
    } catch (err) {
      console.error("Failed to delete event:", err)
      alert("Failed to delete event")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading event...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">Event not found.</p>
        <Button asChild>
          <Link href="/events">Back to events</Link>
        </Button>
      </div>
    )
  }

  const category = event.category || event.pods?.category || "other"
  const imgUrl = event.image_url || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.other
  const isCreator = user && event.created_by === user.id

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <Card className="overflow-hidden">
        {/* Hero image */}
        <div className="h-56 sm:h-72 overflow-hidden relative">
          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Meta */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-foreground">
              <CalendarBlank size={16} className="text-violet-500" />
              <span className="font-medium">{formatDate(event.date)}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2.5 text-sm text-foreground">
                <Clock size={16} className="text-violet-500" />
                <span className="font-medium">
                  {formatTime(event.time)}
                  {event.end_time && ` – ${formatTime(event.end_time)}`}
                </span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2.5 text-sm text-foreground">
                <MapPin size={16} className="text-violet-500" />
                <span className="font-medium">{event.location}</span>
              </div>
            )}
          </div>

          {/* Host */}
          <div className="pt-4 border-t border-border/60">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Hosted by
            </div>
            {event.pods ? (
              <Link
                href={`/pods/${event.pods.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-violet-600 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                {event.pods.name}
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserAvatar name={hostName || "Solo host"} size="sm" />
                {hostName || "Solo host"}
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="pt-4 border-t border-border/60">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                About
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* RSVP */}
          <div className="pt-4 border-t border-border/60">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              Your RSVP
            </div>
            <div className="flex items-center gap-2 mb-4">
              {(["going", "maybe", "no"] as RsvpStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleRsvp(status)}
                  disabled={!user}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-full transition-all",
                    myRsvp === status
                      ? status === "going"
                        ? "bg-emerald-500 text-white"
                        : status === "maybe"
                        ? "bg-violet-400 text-white"
                        : "bg-zinc-300 text-zinc-700"
                      : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border border-zinc-100",
                  )}
                >
                  {status === "going" ? "Going" : status === "maybe" ? "Maybe" : "Can't go"}
                </button>
              ))}
            </div>

            {/* Attendees */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users size={14} />
              <span>
                <span className="font-semibold text-foreground">{attendees.length}</span>{" "}
                going
              </span>
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {attendees.slice(0, 12).map((a) => (
                  <div key={a.user_id} className="flex items-center gap-1.5">
                    <UserAvatar
                      name={a.display_name}
                      imageUrl={a.avatar_url}
                      size="sm"
                    />
                  </div>
                ))}
                {attendees.length > 12 && (
                  <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-bold flex items-center justify-center">
                    +{attendees.length - 12}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Creator actions */}
          {isCreator && (
            <div className="pt-4 border-t border-border/60">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <Trash size={13} />
                {deleting ? "Deleting..." : "Delete event"}
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
