"use client"

import { useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Flame,
  Users,
  Heart,
  ChatCircle,
  PaperPlaneTilt,
  Sneaker,
  BookOpen,
  PencilSimple,
  Leaf,
  ForkKnife,
  GraduationCap,
  CalendarCheck,
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
  CheckCircle,
  X,
  TrendUp,
  GearSix,
  Minus,
  Plus,
} from "@phosphor-icons/react"
import { POD_MAP, CADENCE_LABELS } from "@/lib/data"
import { usePodState } from "@/app/context/pod-state"
import type { FC } from "react"
import type { Checkin, Comment, RsvpStatus, PodApplication } from "@/lib/data"

const CATEGORY_IMAGES: Record<string, string> = {
  running:     "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=300&fit=crop&q=75",
  cycling:     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=300&fit=crop&q=75",
  swimming:    "https://images.unsplash.com/photo-1504578879986-b5dca29e4200?w=800&h=300&fit=crop&q=75",
  yoga:        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=300&fit=crop&q=75",
  strength:    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=300&fit=crop&q=75",
  hiking:      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=300&fit=crop&q=75",
  reading:     "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=300&fit=crop&q=75",
  writing:     "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=300&fit=crop&q=75",
  journaling:  "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&h=300&fit=crop&q=75",
  meditation:  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=300&fit=crop&q=75",
  cooking:     "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=300&fit=crop&q=75",
  learning:    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=300&fit=crop&q=75",
  music:       "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=300&fit=crop&q=75",
  art:         "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=300&fit=crop&q=75",
  photography: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=300&fit=crop&q=75",
  finance:     "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=300&fit=crop&q=75",
  other:       "https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=800&h=300&fit=crop&q=75",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CATEGORY_ICONS: Record<string, FC<any>> = {
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

function CheckinItem({
  checkin,
  likedIds,
  onToggleLike,
  openCommentId,
  onToggleComments,
}: {
  checkin: Checkin
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  openCommentId: string | null
  onToggleComments: (id: string) => void
}) {
  const [thread, setThread] = useState<Comment[]>(checkin.commentThread ?? [])
  const [commentText, setCommentText] = useState("")

  const isLiked = likedIds.has(checkin.id)
  const likeCount = checkin.likes + (isLiked ? 1 : 0)
  const commentsOpen = openCommentId === checkin.id

  const profileHref = (name: string) =>
    name === "Arnav S." ? "/profile" : `/profile/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`

  const handleSubmitComment = () => {
    const text = commentText.trim()
    if (!text) return
    setThread((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        author: { name: "Arnav S.", initials: "AS", color: "bg-zinc-900 text-white" },
        text,
        time: "Just now",
      },
    ])
    setCommentText("")
  }

  return (
    <article className="bg-white border border-zinc-100 rounded-3xl p-6 hover:border-zinc-200 transition-all duration-200">
      <div className="flex items-start gap-3 mb-3">
        <Link href={profileHref(checkin.author.name)} className="flex-shrink-0">
          <div
            className={`w-9 h-9 rounded-full ${checkin.author.color} flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity`}
          >
            {checkin.author.initials}
          </div>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link href={profileHref(checkin.author.name)} className="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors">{checkin.author.name}</Link>
            <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 rounded-full px-2 py-0.5">
              <Flame size={9} weight="fill" />
              <span>{checkin.streakCount}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{checkin.time}</p>
        </div>
      </div>
      <p className="text-[15px] text-zinc-700 leading-relaxed mb-4">{checkin.content}</p>
      <div className="flex items-center gap-5 pt-3 border-t border-zinc-50">
        <button
          onClick={() => onToggleLike(checkin.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors group ${
            isLiked ? "text-rose-500" : "text-zinc-400 hover:text-rose-500"
          }`}
        >
          <Heart
            size={15}
            weight={isLiked ? "fill" : "regular"}
            className="transition-transform group-active:scale-125"
          />
          <span>{likeCount}</span>
        </button>
        <button
          onClick={() => onToggleComments(checkin.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            commentsOpen ? "text-zinc-700" : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          <ChatCircle size={15} weight={commentsOpen ? "fill" : "regular"} />
          <span>{thread.length}</span>
        </button>
      </div>

      {/* Comment thread */}
      {commentsOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-50">
          {thread.length > 0 ? (
            <div className="space-y-3 mb-4">
              {thread.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <Link href={profileHref(comment.author.name)} className="flex-shrink-0">
                    <div
                      className={`w-7 h-7 rounded-full ${comment.author.color} flex items-center justify-center text-[10px] font-bold hover:opacity-80 transition-opacity`}
                    >
                      {comment.author.initials}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <Link href={profileHref(comment.author.name)} className="text-xs font-semibold text-zinc-800 hover:text-amber-600 transition-colors">{comment.author.name}</Link>
                      <span className="text-[10px] text-zinc-400">{comment.time}</span>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed mt-0.5">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-2 mb-3">No comments yet — be first</p>
          )}

          {/* Comment input */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              AS
            </div>
            <div className="flex-1 flex items-center gap-2 bg-zinc-50 border border-zinc-200 focus-within:border-amber-400 focus-within:bg-white rounded-2xl px-3 py-2 transition-all">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                placeholder="Add a comment…"
                className="flex-1 text-sm bg-transparent outline-none text-zinc-900 placeholder:text-zinc-400"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="text-zinc-300 hover:text-amber-500 disabled:opacity-30 transition-colors flex-shrink-0"
              >
                <PaperPlaneTilt size={15} weight="fill" />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default function PodDetailPage() {
  const params = useParams()
  const podState = usePodState()

  // Check static pods first, then dynamically created ones
  const staticPod = POD_MAP[params.id as string]
  const dynamicPod = podState.findPod(params.id as string)
  const pod = staticPod ?? dynamicPod
  if (!pod) notFound()

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [openCommentId, setOpenCommentId] = useState<string | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationText, setApplicationText] = useState("")
  const applicationSent = podState.hasApplied(pod.id)
  const [appToast, setAppToast] = useState<string | null>(null)
  const [maxMembersOverride, setMaxMembersOverride] = useState<number | null>(pod.maxMembers)

  const effectivelyMember = podState.isMember(pod.id)

  const handleApply = () => {
    if (!applicationText.trim()) return
    podState.sendApplication(pod.id)
  }

  const Icon = CATEGORY_ICONS[pod.category] ?? GraduationCap
  const cadenceLabel = CADENCE_LABELS[pod.cadence]

  const acceptedCount = (podState.acceptedApps[pod.id] ?? []).length
  const memberCount = pod.members + acceptedCount

  const spotsLabel =
    maxMembersOverride === null
      ? "Open"
      : maxMembersOverride - memberCount <= 0
      ? "Full"
      : `${maxMembersOverride - memberCount} spot${maxMembersOverride - memberCount === 1 ? "" : "s"} left`

  const membersLabel =
    maxMembersOverride === null
      ? `${memberCount} members`
      : `${memberCount}/${maxMembersOverride} members`

  const handleToggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleComments = (id: string) => {
    setOpenCommentId((prev) => (prev === id ? null : id))
  }

  // Only show apps that haven't been reviewed yet
  const visibleApps = (pod.pendingApplications ?? []).filter(
    (a) => !podState.isAppReviewed(pod.id, a.id)
  )

  const handleAppAction = (id: string, action: "accept" | "decline") => {
    if (action === "accept") podState.acceptApp(pod.id, id)
    else podState.declineApp(pod.id, id)
    podState.reviewApp(pod.id, id)
    setAppToast(action === "accept" ? "✓ Application accepted" : "Application declined")
    setTimeout(() => setAppToast(null), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/pods"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        All pods
      </Link>

      {/* Pod header */}
      <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden mb-6">
        {/* Category image banner */}
        {CATEGORY_IMAGES[pod.category] && (
          <div className="h-44 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CATEGORY_IMAGES[pod.category]}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for text legibility */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
            {/* Streak badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-amber-100 rounded-full px-2.5 py-1">
              <Flame size={11} weight="fill" className="text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{pod.streak}</span>
            </div>
            {/* Pod name overlaid at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight drop-shadow">{pod.name}</h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    pod.type === "Habit"
                      ? "bg-amber-400/90 text-white"
                      : "bg-emerald-400/90 text-white"
                  }`}
                >
                  {pod.type}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {!CATEGORY_IMAGES[pod.category] && (
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-zinc-50 rounded-3xl flex items-center justify-center flex-shrink-0">
                  <Icon size={26} weight="duotone" className="text-zinc-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{pod.name}</h1>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        pod.type === "Habit"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {pod.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2 flex-shrink-0">
                <Flame size={14} weight="fill" className="text-amber-500" />
                <span className="text-sm font-bold text-amber-700">{pod.streak}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-zinc-400 flex-wrap mb-4">
            <div className="flex items-center gap-1">
              <Users size={13} />
              <span>{membersLabel}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <ArrowsClockwise size={13} />
              <span>{cadenceLabel}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <CalendarCheck size={13} />
              <span>Since {pod.createdAt}</span>
            </div>
          </div>

        <p className="text-sm text-zinc-500 leading-relaxed mb-5">{pod.description}</p>

        {/* Members */}
        <div className="border-t border-zinc-50 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Members</h3>
            <span className="text-xs text-zinc-400">{spotsLabel}</span>
          </div>

          {/* Private pod + not a member → blurred lock overlay */}
          {pod.visibility === "private" && !effectivelyMember ? (
            <div className="relative rounded-2xl overflow-hidden">
              {/* Blurred ghost list */}
              <div className="space-y-2.5 blur-sm pointer-events-none select-none" aria-hidden>
                {pod.podMembers.map((member, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                    <div className={`w-8 h-8 rounded-full ${member.color} flex-shrink-0`} />
                    <div className="flex-1 h-3 bg-zinc-200 rounded-full" />
                    <div className="w-8 h-3 bg-zinc-100 rounded-full" />
                  </div>
                ))}
              </div>
              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-3 shadow-soft">
                  <Minus size={0} className="hidden" />
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" fill="white" opacity="0.9"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1.5" fill="#1e1c18"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-zinc-900 mb-1">Members are private</p>
                <p className="text-xs text-zinc-500 text-center max-w-[22ch] leading-relaxed">
                  Apply to join this pod to see who&apos;s inside.
                </p>
              </div>
            </div>
          ) : (
            /* Public pod OR member of private pod → show normally */
            <div className="space-y-2.5">
              {pod.podMembers.map((member, i) => {
                const href = member.isYou
                  ? "/profile"
                  : `/profile/${member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`
                return (
                  <Link
                    key={i}
                    href={href}
                    className="flex items-center gap-3 rounded-2xl hover:bg-zinc-50 px-2 py-1.5 -mx-2 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
                        {member.name}
                        {member.isYou && <span className="ml-1.5 text-xs text-zinc-400 font-normal">(you)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Flame size={10} weight="fill" />
                      <span>{member.streak}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
        </div>{/* /p-6 */}
      </div>

      {/* Location */}
      <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden mb-6">
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(pod.location)}&output=embed&z=15`}
          width="100%"
          height="200"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={pod.location}
        />
        <div className="px-4 py-3 flex items-center justify-between border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-zinc-400 flex-shrink-0" />
            <span className="text-sm text-zinc-600">{pod.location}</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pod.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Directions →
          </a>
        </div>
      </div>

      {/* Upcoming events — shown only to members */}
      {effectivelyMember && pod.events && pod.events.length > 0 && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Upcoming events
          </h2>
          <div className="space-y-4">
            {pod.events.map((event) => {
              const otherMembers = pod.podMembers.filter((m) => !m.isYou)
              return (
                <div key={event.id} className="border border-zinc-100 rounded-2xl p-4">
                  {/* Date + title */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs font-semibold text-amber-600 mb-0.5">{event.dateLabel} · {event.time}</p>
                      <p className="text-sm font-semibold text-zinc-900 leading-tight">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{event.description}</p>
                      )}
                      {event.location && (
                        <div className="mt-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-600 transition-colors"
                          >
                            <MapPin size={11} weight="fill" />
                            {event.location} →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* My RSVP */}
                  {(() => {
                    const myRsvp = podState.getRsvp(pod.id, event.id)
                    return (
                      <div className="flex items-center gap-2 mb-3">
                        {(["going", "maybe", "no"] as RsvpStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => podState.setRsvp(pod.id, event.id, status)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                              myRsvp === status
                                ? status === "going"
                                  ? "bg-emerald-500 text-white"
                                  : status === "maybe"
                                  ? "bg-amber-400 text-white"
                                  : "bg-zinc-300 text-zinc-700"
                                : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100 border border-zinc-100"
                            }`}
                          >
                            {status === "going" ? "Going" : status === "maybe" ? "Maybe" : "Can't go"}
                          </button>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Others' RSVPs */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {otherMembers.map((member) => {
                      const memberRsvp = event.rsvps[member.name]
                      if (!memberRsvp) return null
                      return (
                        <div key={member.name} className="flex items-center gap-1" title={`${member.name}: ${memberRsvp}`}>
                          <div
                            className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center text-[9px] font-bold ring-2 ${
                              memberRsvp === "going"
                                ? "ring-emerald-400"
                                : memberRsvp === "maybe"
                                ? "ring-amber-400"
                                : "ring-zinc-300"
                            }`}
                          >
                            {member.initials}
                          </div>
                        </div>
                      )
                    })}
                    <span className="text-[10px] text-zinc-400 ml-1">
                      {otherMembers.filter((m) => event.rsvps[m.name] === "going").length} going
                      {otherMembers.filter((m) => event.rsvps[m.name] === "maybe").length > 0 &&
                        ` · ${otherMembers.filter((m) => event.rsvps[m.name] === "maybe").length} maybe`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Join / Apply — shown when user is not a member */}
      {!effectivelyMember && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
          {pod.visibility === "public" ? (
            /* Public pod: instant join */
            <>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Join this pod</h3>
              <p className="text-xs text-zinc-400 mb-4">This is an open pod — you can join right now.</p>
              <button
                onClick={() => podState.joinPod(pod.id)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-2xl transition-all active:scale-[0.98]"
              >
                Join pod
              </button>
            </>
          ) : (
            /* Private pod: application flow */
            !applicationSent ? (
              <>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">Want to join?</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  This pod requires an application. The creator will review and accept or decline.
                </p>
                {!showApplicationForm ? (
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-2xl transition-all active:scale-[0.98]"
                  >
                    Apply to join
                  </button>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={applicationText}
                      onChange={(e) => setApplicationText(e.target.value)}
                      placeholder="Why do you want to join? What will you bring to the pod?"
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleApply}
                        disabled={!applicationText.trim()}
                        className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl transition-all"
                      >
                        Send application
                      </button>
                      <button
                        onClick={() => setShowApplicationForm(false)}
                        className="px-4 py-2.5 bg-zinc-100 text-zinc-600 text-sm font-medium rounded-2xl hover:bg-zinc-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={20} weight="fill" className="text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-zinc-900 mb-1">Application sent</p>
                <p className="text-xs text-zinc-400">The pod creator will review your request and get back to you.</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Pod settings — creator only */}
      {pod.createdByYou && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <GearSix size={14} className="text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Pod settings</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Max members</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {maxMembersOverride === null ? "Unlimited — anyone can join" : `${pod.members} joined · ${maxMembersOverride - pod.members} spots left`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMaxMembersOverride((prev) => {
                  if (prev === null) return pod.members + 1
                  return Math.max(pod.members, prev - 1)
                })}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
              >
                <Minus size={13} weight="bold" className="text-zinc-600" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-zinc-900 tabular-nums">
                {maxMembersOverride === null ? "∞" : maxMembersOverride}
              </span>
              <button
                onClick={() => setMaxMembersOverride((prev) => prev === null ? null : prev + 1)}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
              >
                <Plus size={13} weight="bold" className="text-zinc-600" />
              </button>
              {maxMembersOverride !== null && (
                <button
                  onClick={() => setMaxMembersOverride(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 ml-1 transition-colors"
                >
                  Unlimited
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Creator applications panel */}
      {pod.createdByYou && (pod.pendingApplications ?? []).length > 0 && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendUp size={14} className="text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Applications</h2>
            {visibleApps.length > 0 && (
              <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {visibleApps.length} pending
              </span>
            )}
          </div>
          <div className="space-y-3">
            {(pod.pendingApplications ?? []).map((app) => {
              const accepted = podState.isAppAccepted(pod.id, app.id)
              const declined = podState.isAppDeclined(pod.id, app.id)
              const isPending = !accepted && !declined
              return (
                <div key={app.id} className={`border rounded-2xl p-4 transition-all ${
                  accepted ? "border-emerald-200 bg-emerald-50/50" :
                  declined ? "border-zinc-100 bg-zinc-50/60 opacity-60" :
                  "border-zinc-100"
                }`}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full ${app.applicantColor} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                      {app.applicantInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-900">{app.applicantName}</span>
                        <div className="flex items-center gap-2">
                          {accepted && <span className="text-[10px] font-bold text-emerald-600">✓ Accepted</span>}
                          {declined && <span className="text-[10px] font-bold text-zinc-400">Declined</span>}
                          <span className="text-[10px] text-zinc-400">{app.submittedAt}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{app.text}</p>
                    </div>
                  </div>
                  {isPending && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAppAction(app.id, "accept")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-all active:scale-[0.97]"
                      >
                        <CheckCircle size={13} weight="fill" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleAppAction(app.id, "decline")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-semibold rounded-xl transition-all border border-zinc-200 active:scale-[0.97]"
                      >
                        <X size={12} weight="bold" />
                        Decline
                      </button>
                    </div>
                  )}
                  {accepted && (
                    <button
                      onClick={() => handleAppAction(app.id, "decline")}
                      className="mt-2 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      Undo accept
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {appToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm font-medium px-4 py-2.5 rounded-2xl shadow-lg animate-fade-up">
          {appToast}
        </div>
      )}

      {/* Feed */}
      <div>
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Recent check-ins
        </h2>
        {pod.visibility === "private" && !effectivelyMember ? (
          /* Private pod, not a member — blur the feed */
          <div className="relative rounded-3xl overflow-hidden">
            <div className="space-y-4 blur-sm pointer-events-none select-none" aria-hidden>
              {pod.recentCheckins.slice(0, 2).map((checkin) => (
                <div key={checkin.id} className="bg-white border border-zinc-100 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full ${checkin.author.color} flex-shrink-0`} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-zinc-200 rounded-full w-24" />
                      <div className="h-2.5 bg-zinc-100 rounded-full w-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-100 rounded-full w-full" />
                    <div className="h-3 bg-zinc-100 rounded-full w-4/5" />
                    <div className="h-3 bg-zinc-100 rounded-full w-3/5" />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-3xl">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-3 shadow-soft">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="white" opacity="0.9"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1.5" fill="#1e1c18"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-zinc-900 mb-1">Posts are members-only</p>
              <p className="text-xs text-zinc-500 text-center max-w-[24ch] leading-relaxed">
                Apply to join to read check-ins from this pod.
              </p>
            </div>
          </div>
        ) : (() => {
          const visibleCheckins = pod.recentCheckins.filter(
            (c) => c.visibility !== "private"
          )
          if (visibleCheckins.length === 0) {
            return (
              <div className="text-center py-8 text-zinc-400">
                <p className="text-sm">(Private post)</p>
              </div>
            )
          }
          return (
            <div className="space-y-4">
              {visibleCheckins.map((checkin) => (
                <CheckinItem
                  key={checkin.id}
                  checkin={checkin}
                  likedIds={likedIds}
                  onToggleLike={handleToggleLike}
                  openCommentId={openCommentId}
                  onToggleComments={handleToggleComments}
                />
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
