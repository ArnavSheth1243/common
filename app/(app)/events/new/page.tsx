"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Globe, Lock, CheckCircle } from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/app/context/session"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { value: "running",     label: "Running" },
  { value: "cycling",     label: "Cycling" },
  { value: "swimming",    label: "Swimming" },
  { value: "yoga",        label: "Yoga" },
  { value: "strength",    label: "Strength" },
  { value: "hiking",      label: "Hiking" },
  { value: "pickleball",  label: "Pickleball" },
  { value: "tennis",      label: "Tennis" },
  { value: "basketball",  label: "Basketball" },
  { value: "soccer",      label: "Soccer" },
  { value: "golf",        label: "Golf" },
  { value: "volleyball",  label: "Volleyball" },
  { value: "climbing",    label: "Climbing" },
  { value: "surfing",     label: "Surfing" },
  { value: "skating",     label: "Skating" },
  { value: "dance",       label: "Dance" },
  { value: "reading",     label: "Reading" },
  { value: "music",       label: "Music" },
  { value: "art",         label: "Art" },
  { value: "cooking",     label: "Cooking" },
  { value: "other",       label: "Other" },
]

interface UserPod {
  id: string
  name: string
}

export default function NewEventPage() {
  const router = useRouter()
  const { user } = useSession()

  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("running")
  const [imageUrl, setImageUrl] = useState("")
  const [hostPodId, setHostPodId] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [userPods, setUserPods] = useState<UserPod[]>([])

  useEffect(() => {
    if (!user) return
    const fetchUserPods = async () => {
      const sb = createClient()
      const { data } = await sb
        .from("pod_members")
        .select("pod_id, pods(id, name)")
        .eq("user_id", user.id)
      const pods = (data || [])
        .map((row: any) => row.pods)
        .filter(Boolean) as UserPod[]
      setUserPods(pods)
    }
    fetchUserPods()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError("You must be signed in to create an event")
      return
    }
    if (!title.trim() || !date) {
      setError("Title and date are required")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const sb = createClient()
      const { data, error: insertError } = await sb
        .from("pod_events")
        .insert([
          {
            pod_id: hostPodId,
            title: title.trim(),
            date,
            time: time || null,
            end_time: endTime || null,
            location: location.trim() || null,
            description: description.trim() || null,
            created_by: user.id,
            is_public: isPublic,
            image_url: imageUrl.trim() || null,
            category,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError
      router.push(`/events/${(data as any).id}`)
    } catch (err: any) {
      console.error("Failed to create event:", err)
      setError(err.message || "Failed to create event")
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to events
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create event</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Host a one-off event for your pod or the whole community.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-5 sm:p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Saturday morning trail run"
              required
              className="w-full bg-white border border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-all"
            />
          </div>

          {/* Date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-white border border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                Start time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white border border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              End time (optional)
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-white border border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-all"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Golden Gate Park, San Francisco"
              className="w-full bg-white border border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what to expect..."
              rows={4}
              className="w-full bg-white border border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Category
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    category === opt.value
                      ? "bg-foreground border-foreground text-background"
                      : "bg-white border-border text-muted-foreground hover:border-zinc-300",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Cover image URL (optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white border border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-all"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Leave blank to use a category default.
            </p>
          </div>

          {/* Host as */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Host as
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setHostPodId(null)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                  hostPodId === null
                    ? "bg-violet-50 border-violet-400"
                    : "bg-white border-border hover:border-zinc-300",
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  ME
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">Personal</div>
                  <div className="text-[11px] text-muted-foreground">Solo event you're hosting</div>
                </div>
                {hostPodId === null && <CheckCircle size={18} weight="fill" className="text-violet-500" />}
              </button>

              {userPods.map((pod) => (
                <button
                  key={pod.id}
                  type="button"
                  onClick={() => setHostPodId(pod.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                    hostPodId === pod.id
                      ? "bg-violet-50 border-violet-400"
                      : "bg-white border-border hover:border-zinc-300",
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{pod.name}</div>
                    <div className="text-[11px] text-muted-foreground">Pod event</div>
                  </div>
                  {hostPodId === pod.id && <CheckCircle size={18} weight="fill" className="text-violet-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                  isPublic
                    ? "bg-violet-50 border-violet-400"
                    : "bg-white border-border hover:border-zinc-300",
                )}
              >
                <Globe size={16} className={isPublic ? "text-violet-600" : "text-muted-foreground"} />
                <div className="text-left flex-1">
                  <div className="text-xs font-semibold text-foreground">Public</div>
                  <div className="text-[10px] text-muted-foreground">Anyone can see and RSVP</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                disabled={!hostPodId}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                  !isPublic
                    ? "bg-violet-50 border-violet-400"
                    : "bg-white border-border hover:border-zinc-300",
                  !hostPodId && "opacity-50 cursor-not-allowed",
                )}
              >
                <Lock size={16} className={!isPublic ? "text-violet-600" : "text-muted-foreground"} />
                <div className="text-left flex-1">
                  <div className="text-xs font-semibold text-foreground">Pod-only</div>
                  <div className="text-[10px] text-muted-foreground">Only pod members</div>
                </div>
              </button>
            </div>
            {!hostPodId && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Solo events are always public.
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white rounded-full px-6"
            >
              {submitting ? "Creating..." : "Create event"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
