"use client"

import { useState, useMemo, useEffect } from "react"
import {
  CaretLeft,
  CaretRight,
  Plus,
  X,
  MapPin,
  Clock,
  Users,
  CalendarBlank,
  ArrowSquareOut,
  Trash,
  Tag,
} from "@phosphor-icons/react"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = "pod" | "personal" | "reminder"

interface CalEvent {
  id: string
  title: string
  date: string        // "YYYY-MM-DD"
  time?: string
  endTime?: string
  type: EventType
  podId?: string
  podName?: string
  color: string       // tailwind bg class
  textColor: string   // tailwind text class
  description?: string
  location?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"]

const POD_COLORS: Record<string, { bg: string; text: string }> = {
  "1": { bg: "bg-rose-500",    text: "text-white" },
  "2": { bg: "bg-violet-500",   text: "text-white" },
  "3": { bg: "bg-violet-500",  text: "text-white" },
  "4": { bg: "bg-emerald-500", text: "text-white" },
  "5": { bg: "bg-sky-500",     text: "text-white" },
  "6": { bg: "bg-pink-500",    text: "text-white" },
}

// ─── Helper to map Supabase events to CalEvent ──────────────────────────────────

function mapSupabaseToCalEvent(row: any): CalEvent {
  const typeColor = row.type === "reminder"
    ? { bg: "bg-violet-400", text: "text-white" }
    : { bg: "bg-zinc-700", text: "text-white" }
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time ?? undefined,
    endTime: row.end_time ?? undefined,
    type: row.type ?? "personal",
    podId: row.pod_id ?? undefined,
    podName: row.pod_id ? `Pod ${row.pod_id}` : undefined,
    color: typeColor.bg,
    textColor: typeColor.text,
    description: row.description ?? undefined,
    location: row.location ?? undefined,
  }
}

// ─── Map component ────────────────────────────────────────────────────────────

function LocationMap({ location }: { location: string }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed&z=15`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-100">
      <iframe
        src={src}
        width="100%"
        height="180"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={location}
      />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-50 border-t border-zinc-100 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        <ArrowSquareOut size={13} />
        Open in Google Maps
      </a>
    </div>
  )
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({
  event,
  onDelete,
  rsvpStatus,
  onRsvp,
  rsvpSaving,
}: {
  event: CalEvent & { _podEventId?: string }
  onDelete: (id: string) => void
  rsvpStatus?: string
  onRsvp?: (podEventId: string, status: string) => void
  rsvpSaving?: boolean
}) {
  const [showMap, setShowMap] = useState(false)
  const isPodEvent = event.id.startsWith("pod-event-")
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-softer">
      <div className="flex items-start gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${event.color} flex-shrink-0 mt-1.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900">{event.title}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            {event.time && (
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <Clock size={11} />
                {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
              </span>
            )}
            {event.podName && (
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <Users size={11} />
                {event.podName}
              </span>
            )}
            {event.type === "reminder" && (
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <Tag size={11} />
                Reminder
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{event.description}</p>
          )}
          {event.location && (
            <div className="mt-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-violet-600 transition-colors"
              >
                <MapPin size={11} weight="fill" />
                {event.location}
              </button>
              {showMap && <LocationMap location={event.location} />}
            </div>
          )}
          {/* RSVP buttons for pod events */}
          {isPodEvent && onRsvp && event._podEventId && (
            <div className="flex items-center gap-1.5 mt-3">
              {(["going", "maybe", "no"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => onRsvp(event._podEventId!, status)}
                  disabled={rsvpSaving}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all capitalize
                    ${rsvpStatus === status
                      ? status === "going"
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : status === "maybe"
                          ? "bg-violet-500 border-violet-500 text-white"
                          : "bg-zinc-400 border-zinc-400 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                    } disabled:opacity-50`}
                >
                  {status === "no" ? "Can't go" : status}
                </button>
              ))}
            </div>
          )}
        </div>
        {!isPodEvent && (
          <button
            onClick={() => onDelete(event.id)}
            className="text-zinc-300 hover:text-zinc-500 transition-colors flex-shrink-0"
          >
            <Trash size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Add event form ───────────────────────────────────────────────────────────

function AddEventForm({
  defaultDate,
  onAdd,
  onClose,
  myPods = [],
}: {
  defaultDate: string
  onAdd: (e: CalEvent) => void
  onClose: () => void
  myPods?: any[]
}) {
  const [title, setTitle]       = useState("")
  const [date, setDate]         = useState(defaultDate)
  const [time, setTime]         = useState("")
  const [type, setType]         = useState<EventType>("personal")
  const [podId, setPodId]       = useState("")
  const [location, setLocation] = useState("")
  const [desc, setDesc]         = useState("")
  const [saving, setSaving]     = useState(false)
  const { user } = useSession()

  const podOptions = myPods

  const handleSubmit = async () => {
    if (!title.trim() || !date || !user) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("calendar_events").insert([{
        user_id: user.id,
        title: title.trim(),
        date,
        time: time || null,
        end_time: null,
        type,
        pod_id: type === "pod" ? podId : null,
        location: location.trim() || null,
        description: desc.trim() || null,
      }])
      if (!error) {
        const selectedPod = podOptions.find((p) => p.id === podId)
        const typeColor = type === "reminder" ? { bg: "bg-violet-400", text: "text-white" } : { bg: "bg-zinc-700", text: "text-white" }
        onAdd({
          id: `user-${Date.now()}`,
          title: title.trim(),
          date,
          time: time || undefined,
          type,
          podId: selectedPod?.id,
          podName: selectedPod?.name,
          color: typeColor.bg,
          textColor: typeColor.text,
          location: location.trim() || undefined,
          description: desc.trim() || undefined,
        })
        onClose()
      }
    } catch (error) {
      console.error("Failed to save event:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-card mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-zinc-900">New event</p>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <X size={15} />
        </button>
      </div>
      <div className="space-y-2.5">
        <input
          autoFocus
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        {/* Type selector */}
        <div className="flex gap-1.5">
          {(["personal","pod","reminder"] as EventType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize
                ${type === t ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {type === "pod" && (
          <select
            value={podId}
            onChange={(e) => setPodId(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-700 outline-none focus:border-violet-400"
          >
            <option value="">Select a pod…</option>
            {podOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        <input
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <textarea
          placeholder="Notes (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
        >
          Add to calendar
        </button>
      </div>
    </div>
  )
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { user } = useSession()
  const today       = new Date()
  const todayStr    = today.toISOString().slice(0, 10)
  const startYear   = today.getFullYear()

  const [events, setEvents] = useState<CalEvent[]>([])
  const [myPods, setMyPods] = useState<any[]>([])
  const [rsvps, setRsvps] = useState<Record<string, string>>({}) // eventId -> status
  const [loading, setLoading] = useState(true)
  const [viewYear,   setViewYear]   = useState(startYear)
  const [viewMonth,  setViewMonth]  = useState(today.getMonth())
  const [selected,   setSelected]   = useState(todayStr)
  const [showForm,   setShowForm]   = useState(false)
  const [rsvpSaving, setRsvpSaving] = useState<string | null>(null)

  // Fetch events, pod events, and RSVPs from Supabase
  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch personal calendar events
      const { data: calEvents } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })

      // Fetch user's pods
      const { data: podMemberships } = await supabase
        .from("pod_members")
        .select("pod_id, pods(id, name)")
        .eq("user_id", user.id)

      const pods = (podMemberships || []).map((m: any) => ({ id: m.pods.id, name: m.pods.name }))
      const podIds = pods.map((p: any) => p.id)
      const podNameMap: Record<string, string> = {}
      pods.forEach((p: any) => { podNameMap[p.id] = p.name })

      // Fetch pod events for all user's pods
      let podEventsMapped: CalEvent[] = []
      if (podIds.length > 0) {
        const { data: podEvents } = await supabase
          .from("pod_events")
          .select("*")
          .in("pod_id", podIds)
          .order("date", { ascending: true })

        const podColorKeys = Object.keys(POD_COLORS)
        podEventsMapped = (podEvents || []).map((pe: any, idx: number) => {
          const colorKey = podColorKeys[idx % podColorKeys.length]
          const colors = POD_COLORS[colorKey]
          return {
            id: `pod-event-${pe.id}`,
            _podEventId: pe.id, // real ID for RSVP
            title: pe.title,
            date: pe.date,
            time: pe.time ?? undefined,
            endTime: pe.end_time ?? undefined,
            type: "pod" as EventType,
            podId: pe.pod_id,
            podName: podNameMap[pe.pod_id] || "Pod",
            color: colors.bg,
            textColor: colors.text,
            description: pe.description ?? undefined,
            location: pe.location ?? undefined,
          } as CalEvent & { _podEventId: string }
        })

        // Fetch user's RSVPs for these pod events
        const podEventIds = (podEvents || []).map((pe: any) => pe.id)
        if (podEventIds.length > 0) {
          const { data: userRsvps } = await supabase
            .from("event_rsvps")
            .select("event_id, status")
            .eq("user_id", user.id)
            .in("event_id", podEventIds)

          const rsvpMap: Record<string, string> = {}
          for (const r of userRsvps || []) {
            rsvpMap[r.event_id] = r.status
          }
          setRsvps(rsvpMap)
        }
      }

      const personalEvents = (calEvents || []).map(mapSupabaseToCalEvent)
      setEvents([...personalEvents, ...podEventsMapped])
      setMyPods(pods)
      setLoading(false)
    }
    fetchData()
  }, [user])

  const handleRsvp = async (podEventId: string, status: string) => {
    if (!user) return
    setRsvpSaving(podEventId)
    try {
      const supabase = createClient()
      await supabase.from("event_rsvps").upsert({
        event_id: podEventId,
        user_id: user.id,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: "event_id,user_id" })
      setRsvps((prev) => ({ ...prev, [podEventId]: status }))
    } catch (err) {
      console.error("Failed to RSVP:", err)
    } finally {
      setRsvpSaving(null)
    }
  }

  const YEARS = [startYear, startYear + 1, startYear + 2]

  // ── Calendar grid ──────────────────────────────────────────────────────────
  const { cells, daysInMonth } = useMemo(() => {
    const dim = new Date(viewYear, viewMonth + 1, 0).getDate()
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const arr: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let d = 1; d <= dim; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return { cells: arr, daysInMonth: dim }
  }, [viewYear, viewMonth])

  // ── Event index ────────────────────────────────────────────────────────────
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {}
    for (const e of events) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return map
  }, [events])

  const selectedEvents = eventsByDate[selected] ?? []

  // Upcoming events (from today, sorted)
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""))
      .slice(0, 15)
  }, [events, todayStr])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const selectDate = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    setSelected(`${viewYear}-${m}-${d}`)
    setShowForm(false)
  }

  const deleteEvent = async (id: string) => {
    const supabase = createClient()
    await supabase.from("calendar_events").delete().eq("id", id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const addEvent = (e: CalEvent) => {
    setEvents((prev) => [...prev, e])
  }

  // ── Apple Calendar / .ics export ───────────────────────────────────────────
  const exportToAppleCalendar = (eventsToExport: CalEvent[] = upcomingEvents) => {
    const fmt = (d: string, t?: string) => {
      const dt = d.replace(/-/g, "")
      if (!t) return `${dt}`
      const [h, m] = t.split(":").map(Number)
      return `${dt}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`
    }
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Common//Common App//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ]
    for (const e of eventsToExport) {
      lines.push("BEGIN:VEVENT")
      lines.push(`UID:${e.id}@common`)
      lines.push(`SUMMARY:${e.title}${e.podName ? ` (${e.podName})` : ""}`)
      if (e.time) {
        lines.push(`DTSTART:${fmt(e.date, e.time)}`)
        lines.push(`DTEND:${fmt(e.date, e.endTime ?? e.time)}`)
      } else {
        lines.push(`DTSTART;VALUE=DATE:${fmt(e.date)}`)
        lines.push(`DTEND;VALUE=DATE:${fmt(e.date)}`)
      }
      if (e.location) lines.push(`LOCATION:${e.location}`)
      if (e.description) lines.push(`DESCRIPTION:${e.description}`)
      lines.push("END:VEVENT")
    }
    lines.push("END:VCALENDAR")
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "common-events.ics"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Formatted selected date label ──────────────────────────────────────────
  const selectedLabel = new Date(selected + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })

  const isToday = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${viewYear}-${m}-${d}` === todayStr
  }

  const isSelected = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${viewYear}-${m}-${d}` === selected
  }

  const dateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${viewYear}-${m}-${d}`
  }

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-up flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">Calendar</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-2">Track events across all your pods</p>
        </div>
        <button
          onClick={() => exportToAppleCalendar()}
          className="flex-shrink-0 flex items-center justify-center gap-2 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold px-4 py-2.5 rounded-2xl transition-all shadow-softer w-full sm:w-auto"
        >
          <CalendarBlank size={15} weight="fill" className="text-zinc-500" />
          Add to iPhone
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* ── Left: Calendar ─────────────────────────────────────────────── */}
        <div className="bg-white border border-zinc-100 rounded-3xl p-4 sm:p-6 shadow-card animate-fade-up">
          {/* Year tabs */}
          <div className="flex gap-1 mb-6 bg-zinc-50 rounded-2xl p-1">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setViewYear(y)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  viewYear === y ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <CaretLeft size={15} weight="bold" className="text-zinc-600" />
            </button>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <CaretRight size={15} weight="bold" className="text-zinc-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wide py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-[52px] sm:h-[72px]" />
              }
              const ds = dateStr(day)
              const dayEvents = eventsByDate[ds] ?? []
              const today_ = isToday(day)
              const selected_ = isSelected(day)
              const isPast = ds < todayStr

              return (
                <button
                  key={ds}
                  onClick={() => selectDate(day)}
                  className={`h-[52px] sm:h-[72px] p-1 sm:p-1.5 rounded-xl text-left transition-all duration-150 group flex flex-col
                    ${selected_ ? "bg-zinc-900 shadow-sm" : "hover:bg-zinc-50"}
                    ${isPast && !selected_ ? "opacity-60" : ""}
                  `}
                >
                  {/* Date number */}
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 flex-shrink-0
                    ${today_ && !selected_ ? "bg-violet-500 text-white" : ""}
                    ${selected_ ? "text-white" : "text-zinc-700"}
                  `}>
                    {day}
                  </span>
                  {/* Event dots */}
                  <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className={`text-[10px] font-medium px-1 rounded-sm truncate leading-tight py-px
                          ${selected_ ? "bg-white/20 text-white" : `${e.color} ${e.textColor}`}
                        `}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className={`text-[10px] font-medium px-1 ${selected_ ? "text-white/60" : "text-zinc-400"}`}>
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Month quick-jump strip */}
          <div className="flex gap-1 mt-5 flex-wrap">
            {MONTHS.map((m, i) => (
              <button
                key={m}
                onClick={() => setViewMonth(i)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all
                  ${viewMonth === i ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Day detail + upcoming ───────────────────────────────── */}
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "70ms" }}>
          {/* Selected day header */}
          <div className="bg-white border border-zinc-100 rounded-3xl px-5 pt-5 pb-4 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.1em]">Selected</p>
                <p className="text-base font-bold text-zinc-900 mt-0.5 leading-tight">{selectedLabel}</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all active:scale-[0.97]"
              >
                <Plus size={12} weight="bold" />
                Add
              </button>
            </div>

            {showForm && (
              <AddEventForm
                defaultDate={selected}
                onAdd={addEvent}
                onClose={() => setShowForm(false)}
                myPods={myPods}
              />
            )}

            {selectedEvents.length === 0 && !showForm ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CalendarBlank size={28} className="text-zinc-200 mb-2" />
                <p className="text-sm text-zinc-400">Nothing scheduled</p>
                <p className="text-xs text-zinc-300 mt-0.5">Tap + Add to create an event</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedEvents
                  .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
                  .map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      onDelete={deleteEvent}
                      rsvpStatus={(e as any)._podEventId ? rsvps[(e as any)._podEventId] : undefined}
                      onRsvp={handleRsvp}
                      rsvpSaving={rsvpSaving === (e as any)?._podEventId}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div className="bg-white border border-zinc-100 rounded-3xl px-5 pt-5 pb-4 shadow-card">
            <p className="text-sm font-bold text-zinc-900 mb-3">Upcoming</p>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((e) => {
                  const dt = new Date(e.date + "T00:00:00")
                  const label = e.date === todayStr
                    ? "Today"
                    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelected(e.date)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors text-left"
                    >
                      <div className={`w-2 h-2 rounded-full ${e.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-800 truncate">{e.title}</p>
                        <p className="text-[10px] text-zinc-400">
                          {label}{e.time ? ` · ${e.time}` : ""}
                          {e.podName ? ` · ${e.podName}` : ""}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
