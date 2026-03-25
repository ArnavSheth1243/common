"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, Heart, ChatCircle, PlusCircle, DotsThree, PencilSimple, PaperPlaneTilt, TrendUp } from "@phosphor-icons/react"
import { MY_PODS, MY_POD_IDS, PODS, POD_MAP, CADENCE_LABELS } from "@/lib/data"
import type { Checkin, Comment } from "@/lib/data"
import { useUserProfile } from "@/app/context/user-profile"
import { usePodState } from "@/app/context/pod-state"
import { useUserStats } from "@/app/context/user-stats"

// ─── Category color map ────────────────────────────────────────────────────────
const CATEGORY_BADGE: Record<string, string> = {
  running:     "bg-rose-50 text-rose-600",
  cycling:     "bg-orange-50 text-orange-600",
  swimming:    "bg-blue-50 text-blue-600",
  yoga:        "bg-teal-50 text-teal-700",
  strength:    "bg-zinc-900 text-white",
  hiking:      "bg-emerald-50 text-emerald-700",
  reading:     "bg-amber-50 text-amber-700",
  writing:     "bg-violet-50 text-violet-700",
  journaling:  "bg-purple-50 text-purple-700",
  meditation:  "bg-sky-50 text-sky-700",
  cooking:     "bg-orange-50 text-orange-700",
  learning:    "bg-indigo-50 text-indigo-700",
  music:       "bg-pink-50 text-pink-700",
  art:         "bg-fuchsia-50 text-fuchsia-700",
  photography: "bg-cyan-50 text-cyan-700",
  finance:     "bg-green-50 text-green-700",
  other:       "bg-zinc-100 text-zinc-600",
}

// ─── Mock feed ────────────────────────────────────────────────────────────────
const feedCheckins: (Checkin & { podId: string; pod: string; image?: string })[] = [
  {
    id: "1",
    podId: "1",
    author: { name: "Marcus R.", initials: "MR", color: "bg-zinc-900 text-white" },
    pod: "Morning Run Club",
    time: "Just now",
    content: "14 check-ins in. 5K before sunrise — still dark outside when I started. The group keeps me honest.",
    likes: 4,
    comments: 2,
    streakCount: 14,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=300&fit=crop&q=80",
    commentThread: [
      { id: "t1", author: { name: "Jordan L.", initials: "JL", color: "bg-emerald-600 text-white" }, text: "That pre-sunrise run is something else. Nice work.", time: "1h ago" },
      { id: "t2", author: { name: "Priya K.", initials: "PK", color: "bg-amber-500 text-white" }, text: "Keeping the streak alive! See you tomorrow.", time: "45m ago" },
    ],
  },
  {
    id: "2",
    podId: "2",
    author: { name: "Aisha B.", initials: "AB", color: "bg-amber-500 text-white" },
    pod: "The Reader's Pod",
    time: "2h ago",
    content: "Finished chapter 8 of Atomic Habits. The two-minute rule is genuinely life-changing.",
    likes: 6,
    comments: 3,
    streakCount: 22,
    commentThread: [
      { id: "t1", author: { name: "Tom H.", initials: "TH", color: "bg-zinc-800 text-white" }, text: "The two-minute rule is sneaky good. What are you reading next?", time: "1h ago" },
      { id: "t2", author: { name: "Nina C.", initials: "NC", color: "bg-blue-600 text-white" }, text: "I'm starting that one tonight actually.", time: "50m ago" },
      { id: "t3", author: { name: "Tom H.", initials: "TH", color: "bg-zinc-800 text-white" }, text: "Chapter 3 is where it really starts clicking.", time: "40m ago" },
    ],
  },
  {
    id: "3",
    podId: "1",
    author: { name: "Jordan L.", initials: "JL", color: "bg-emerald-600 text-white" },
    pod: "Morning Run Club",
    time: "3h ago",
    content: "Legs were sore but got out anyway. Grateful for everyone here — seeing your check-ins helps.",
    likes: 5,
    comments: 1,
    streakCount: 11,
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=300&fit=crop&q=80",
    commentThread: [
      { id: "t1", author: { name: "Marcus R.", initials: "MR", color: "bg-zinc-900 text-white" }, text: "Sore legs and still out — that's the whole game right there.", time: "2h ago" },
    ],
  },
  {
    id: "4",
    podId: "3",
    author: { name: "Leila M.", initials: "LM", color: "bg-rose-500 text-white" },
    pod: "Daily Writing Practice",
    time: "5h ago",
    content: "600 words on the short story I've been avoiding for 3 months. Something clicked today.",
    likes: 8,
    comments: 4,
    streakCount: 7,
    commentThread: [
      { id: "t1", author: { name: "Dev S.", initials: "DS", color: "bg-zinc-900 text-white" }, text: "The avoidance ending in 600 words is such a good sign.", time: "4h ago" },
      { id: "t2", author: { name: "Carmen V.", initials: "CV", color: "bg-amber-600 text-white" }, text: "What made it finally click?", time: "3h ago" },
      { id: "t3", author: { name: "Leila M.", initials: "LM", color: "bg-rose-500 text-white" }, text: "I stopped trying to make it good and started making it exist.", time: "3h ago" },
      { id: "t4", author: { name: "Dev S.", initials: "DS", color: "bg-zinc-900 text-white" }, text: "That's the whole move.", time: "2h ago" },
    ],
  },
  {
    id: "5",
    podId: "7",
    author: { name: "Maya R.", initials: "MR", color: "bg-orange-500 text-white" },
    pod: "Cook Something New",
    time: "Yesterday",
    content: "Attempted homemade pasta. It came out wrong but delicious. 10/10 would fail again.",
    likes: 11,
    comments: 5,
    streakCount: 3,
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=300&fit=crop&q=80",
    commentThread: [
      { id: "t1", author: { name: "Ingrid L.", initials: "IL", color: "bg-emerald-600 text-white" }, text: "Homemade pasta failure is still 100x better than store bought.", time: "Yesterday" },
      { id: "t2", author: { name: "Felix B.", initials: "FB", color: "bg-zinc-900 text-white" }, text: "What went wrong? Texture?", time: "Yesterday" },
      { id: "t3", author: { name: "Maya R.", initials: "MR", color: "bg-orange-500 text-white" }, text: "Too thick, fell apart in the water. Tasted amazing though.", time: "Yesterday" },
      { id: "t4", author: { name: "Hiro T.", initials: "HT", color: "bg-blue-600 text-white" }, text: "Rest the dough longer next time.", time: "Yesterday" },
      { id: "t5", author: { name: "Ingrid L.", initials: "IL", color: "bg-emerald-600 text-white" }, text: "Also less water in the flour than you think.", time: "Yesterday" },
    ],
  },
]

// ─── Check-in card ────────────────────────────────────────────────────────────
function CheckinCard({
  checkin,
  likedIds,
  onToggleLike,
  openCommentId,
  onToggleComments,
}: {
  checkin: (typeof feedCheckins)[0]
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

  const podCategory = POD_MAP[checkin.podId]?.category ?? "other"
  const badgeColor = CATEGORY_BADGE[podCategory] ?? CATEGORY_BADGE.other

  const profileHref = (name: string) =>
    name === "Arnav S." ? "/profile" : `/profile/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`

  const handleSubmitComment = () => {
    const text = commentText.trim()
    if (!text) return
    const newComment: Comment = {
      id: `user-${Date.now()}`,
      author: { name: "Arnav S.", initials: "AS", color: "bg-zinc-900 text-white" },
      text,
      time: "Just now",
    }
    setThread((prev) => [...prev, newComment])
    setCommentText("")
  }

  return (
    <article className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-softer hover:shadow-card hover:border-zinc-200 transition-all duration-300 ease-spring">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <Link href={profileHref(checkin.author.name)} className="flex-shrink-0">
            <div
              className={`w-10 h-10 rounded-full ${checkin.author.color} flex items-center justify-center text-sm font-bold hover:opacity-80 transition-opacity`}
            >
              {checkin.author.initials}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={profileHref(checkin.author.name)} className="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors">{checkin.author.name}</Link>
              <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 rounded-full px-2 py-0.5">
                <Flame size={10} weight="fill" />
                <span>{checkin.streakCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Link
                href={`/pods/${checkin.podId}`}
                className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity hover:opacity-80 ${badgeColor}`}
              >
                {checkin.pod}
              </Link>
              <span className="text-zinc-200">·</span>
              <span className="text-xs text-zinc-400">{checkin.time}</span>
            </div>
          </div>
        </div>
        <button className="text-zinc-300 hover:text-zinc-500 transition-colors p-1 -mr-1 rounded-lg hover:bg-zinc-50">
          <DotsThree size={18} weight="bold" />
        </button>
      </div>

      {/* Content */}
      <p className="text-[15px] text-zinc-700 leading-relaxed mb-4">{checkin.content}</p>

      {/* Image */}
      {checkin.image && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-zinc-100">
          <img src={checkin.image} alt="" className="w-full object-cover max-h-64" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-zinc-50">
        <button
          onClick={() => onToggleLike(checkin.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors group ${
            isLiked ? "text-rose-500" : "text-zinc-400 hover:text-rose-500"
          }`}
        >
          <Heart
            size={16}
            weight={isLiked ? "fill" : "regular"}
            className="transition-transform group-active:scale-125"
          />
          <span className="tabular-nums">{likeCount}</span>
        </button>
        <button
          onClick={() => onToggleComments(checkin.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            commentsOpen ? "text-zinc-700" : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          <ChatCircle size={16} weight={commentsOpen ? "fill" : "regular"} />
          <span className="tabular-nums">{thread.length}</span>
        </button>
      </div>

      {/* Comment thread */}
      {commentsOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-50">
          {/* Existing comments */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { profile } = useUserProfile()
  const { checkins: savedCheckins, createdPods } = usePodState()
  const firstName = profile.displayName.split(" ")[0]

  // Combine static my-pods with dynamically created ones
  const allMyPods = [...createdPods, ...MY_PODS]

  const trendingPods = PODS
    .filter((p) => !MY_POD_IDS.includes(p.id) && !createdPods.some((cp) => cp.id === p.id))
    .sort((a, b) => (b.streak * b.members) - (a.streak * a.members))
    .slice(0, 3)

  // Prepend user's saved check-ins to the static feed
  const userFeedItems = savedCheckins.map((ci) => ({
    id: ci.id,
    podId: ci.podId,
    pod: POD_MAP[ci.podId]?.name ?? "Your pod",
    author: { name: profile.displayName, initials: profile.displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2), color: "bg-zinc-900 text-white" },
    time: "Just now",
    content: ci.content,
    likes: 0,
    comments: 0,
    streakCount: ci.streakCount,
    image: ci.photo,
    commentThread: [],
  }))
  const allFeedItems = [...userFeedItems, ...feedCheckins]

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [openCommentId, setOpenCommentId] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerText, setComposerText] = useState("")
  const [composerPod, setComposerPod] = useState<string | undefined>(allMyPods[0]?.id)
  const [composerPosted, setComposerPosted] = useState(false)

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

  const { postCheckin } = usePodState()
  const { currentStreak, recordCheckin } = useUserStats()

  const handleQuickPost = () => {
    if (!composerText.trim()) return
    postCheckin({ podId: composerPod ?? "solo", content: composerText.trim(), visibility: "pod", streakCount: currentStreak + 1 })
    if (composerPod && composerPod !== "solo") recordCheckin(composerPod)
    setComposerPosted(true)
    setTimeout(() => {
      setComposerPosted(false)
      setComposerOpen(false)
      setComposerText("")
    }, 2500)
  }

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">Hey, {firstName}.</h1>
          <p className="text-base text-zinc-500 mt-2.5">See what your pods are up to</p>
        </div>
        <Link
          href="/checkin"
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-all duration-200 ease-spring active:scale-[0.97] shadow-sm mt-1"
        >
          <PlusCircle size={16} weight="fill" />
          Check in
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
        {/* Feed */}
        <div>
          {/* My pods strip */}
          <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
            {allMyPods.map((pod) => (
              <Link
                key={pod.id}
                href={`/pods/${pod.id}`}
                className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-zinc-100 rounded-2xl px-3.5 py-2.5 hover:border-zinc-300 hover:shadow-softer transition-all duration-200 ease-spring active:scale-[0.97]"
              >
                <div
                  className={`w-6 h-6 rounded-lg ${pod.memberColors[0]} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {pod.name[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-800 whitespace-nowrap">{pod.name}</div>
                  <div className="text-[10px] text-zinc-400">{CADENCE_LABELS[pod.cadence]}</div>
                </div>
              </Link>
            ))}
            <Link
              href="/pods"
              className="flex-shrink-0 flex items-center gap-2 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all duration-200"
            >
              <PlusCircle size={14} />
              Find pods
            </Link>
          </div>

          {/* Composer */}
          <div className="mb-4 bg-white border border-zinc-100 rounded-3xl p-4 shadow-softer hover:shadow-card hover:border-zinc-200 transition-all duration-300 ease-spring">
            {!composerOpen ? (
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setComposerOpen(true)}
              >
                <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  AS
                </div>
                <div className="flex-1">
                  <span className="text-sm text-zinc-400">Check in…</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0">
                  <PencilSimple size={12} weight="fill" />
                  Post
                </div>
              </div>
            ) : (
              <div>
                {/* Avatar + pod selector row */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    AS
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {allMyPods.map((pod) => (
                      <button
                        key={pod.id}
                        onClick={() => setComposerPod(pod.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all duration-150 ${
                          composerPod === pod.id
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700"
                        }`}
                      >
                        {pod.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  rows={3}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value.slice(0, 300))}
                  placeholder="How's progress going?"
                  className="w-full text-sm text-zinc-900 placeholder:text-zinc-400 bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:bg-white rounded-2xl px-3 py-2.5 outline-none resize-none transition-all"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-zinc-400 tabular-nums">{composerText.length}/300</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setComposerOpen(false)
                        setComposerText("")
                      }}
                      className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleQuickPost}
                      disabled={!composerText.trim()}
                      className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150"
                    >
                      <PencilSimple size={12} weight="fill" />
                      Post
                    </button>
                  </div>
                </div>

                {/* Success message */}
                {composerPosted && (
                  <div className="mt-3 text-xs text-emerald-600 font-semibold text-center bg-emerald-50 rounded-xl py-2">
                    Posted! Nice work.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {allFeedItems.map((checkin, i) => (
              <div
                key={checkin.id}
                className={`animate-fade-up stagger-${Math.min(i + 1, 5)}`}
              >
                <CheckinCard
                  checkin={checkin}
                  likedIds={likedIds}
                  onToggleLike={handleToggleLike}
                  openCommentId={openCommentId}
                  onToggleComments={handleToggleComments}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-5 sticky top-8">
          {/* Check-in prompt */}
          <div className="bg-zinc-900 rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-amber-500 rounded-full opacity-15 blur-3xl pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-zinc-700 rounded-full opacity-30 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-3">
                <Flame size={13} weight="fill" className="text-amber-400" />
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Keep going</span>
              </div>
              <p className="text-[15px] font-semibold text-white leading-snug mb-1">
                Your streak is alive.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Drop a quick update and keep the momentum.
              </p>
              <Link
                href="/checkin"
                className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold py-3 rounded-2xl transition-all duration-200 ease-spring active:scale-[0.97] shadow-amber"
              >
                Post a check-in
              </Link>
            </div>
          </div>

          {/* My pods list */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-5">
            <h3 className="text-sm font-semibold text-zinc-800 mb-4">My pods</h3>
            <div className="space-y-3">
              {allMyPods.map((pod, i) => (
                <Link
                  key={i}
                  href={`/pods/${pod.id}`}
                  className="flex items-center gap-2.5 group"
                >
                  <div
                    className={`w-7 h-7 rounded-full ${pod.memberColors[0]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
                  >
                    {pod.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-700 truncate group-hover:text-zinc-900 transition-colors">
                      {pod.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">{CADENCE_LABELS[pod.cadence]}</div>
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold flex-shrink-0">
                    <Flame size={9} weight="fill" />
                    <span>{pod.streak}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending pods */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendUp size={14} weight="bold" className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-800">Trending</h3>
            </div>
            <div className="space-y-3">
              {trendingPods.map((pod) => (
                <Link
                  key={pod.id}
                  href={`/pods/${pod.id}`}
                  className="flex items-center gap-2.5 group"
                >
                  <div
                    className={`w-7 h-7 rounded-full ${pod.memberColors[0]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
                  >
                    {pod.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-700 truncate group-hover:text-zinc-900 transition-colors">
                      {pod.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">{pod.members} members</div>
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold flex-shrink-0">
                    <Flame size={9} weight="fill" />
                    <span>{pod.streak}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
