"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Flame,
  Heart,
  ChatCircle,
  PlusCircle,
  DotsThree,
  PencilSimple,
  PaperPlaneTilt,
  TrendUp,
  MapPin,
  ShareNetwork,
  Trophy,
  Lightning,
} from "@phosphor-icons/react"
import { CADENCE_LABELS } from "@/lib/data"
import type { Comment } from "@/lib/data"
import { useUserProfile } from "@/app/context/user-profile"
import { usePodState } from "@/app/context/pod-state"
import { useUserStats } from "@/app/context/user-stats"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

const CATEGORY_BADGE: Record<string, string> = {
  running: "bg-rose-50 text-rose-600",
  cycling: "bg-orange-50 text-orange-600",
  swimming: "bg-blue-50 text-blue-600",
  yoga: "bg-teal-50 text-teal-700",
  strength: "bg-zinc-900 text-white",
  hiking: "bg-emerald-50 text-emerald-700",
  reading: "bg-amber-50 text-amber-700",
  writing: "bg-violet-50 text-violet-700",
  journaling: "bg-purple-50 text-purple-700",
  meditation: "bg-sky-50 text-sky-700",
  cooking: "bg-orange-50 text-orange-700",
  learning: "bg-indigo-50 text-indigo-700",
  music: "bg-pink-50 text-pink-700",
  art: "bg-fuchsia-50 text-fuchsia-700",
  photography: "bg-cyan-50 text-cyan-700",
  finance: "bg-green-50 text-green-700",
  fitness: "bg-rose-50 text-rose-700",
  mindfulness: "bg-sky-50 text-sky-700",
  productivity: "bg-indigo-50 text-indigo-700",
  creativity: "bg-fuchsia-50 text-fuchsia-700",
  other: "bg-zinc-100 text-zinc-600",
}

// Pod icon images by category — small square crops for profile-pic style icons
const POD_ICONS: Record<string, string> = {
  fitness:      "https://images.unsplash.com/photo-1571019614242-c5c085234bf1?w=120&h=120&fit=crop&q=80",
  running:      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120&h=120&fit=crop&q=80",
  cycling:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop&q=80",
  swimming:     "https://images.unsplash.com/photo-1504578879986-b5dca29e4200?w=120&h=120&fit=crop&q=80",
  yoga:         "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&h=120&fit=crop&q=80",
  strength:     "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=120&h=120&fit=crop&q=80",
  hiking:       "https://images.unsplash.com/photo-1551632811-561732d1e306?w=120&h=120&fit=crop&q=80",
  learning:     "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=120&h=120&fit=crop&q=80",
  reading:      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=120&h=120&fit=crop&q=80",
  writing:      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=120&h=120&fit=crop&q=80",
  journaling:   "https://images.unsplash.com/photo-1517842645767-c639042777db?w=120&h=120&fit=crop&q=80",
  meditation:   "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=120&h=120&fit=crop&q=80",
  mindfulness:  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=120&h=120&fit=crop&q=80",
  cooking:      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop&q=80",
  music:        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=120&h=120&fit=crop&q=80",
  art:          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&h=120&fit=crop&q=80",
  photography:  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=120&h=120&fit=crop&q=80",
  creativity:   "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&h=120&fit=crop&q=80",
  finance:      "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=120&h=120&fit=crop&q=80",
  productivity: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=120&h=120&fit=crop&q=80",
  other:        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&h=120&fit=crop&q=80",
}

function getPodIcon(category: string): string {
  return POD_ICONS[category] || POD_ICONS.other
}

// Avatar colors for visual variety in feed
const AVATAR_COLORS = [
  "bg-zinc-900 text-white",
  "bg-rose-500 text-white",
  "bg-amber-500 text-white",
  "bg-emerald-500 text-white",
  "bg-sky-500 text-white",
  "bg-violet-500 text-white",
  "bg-indigo-500 text-white",
  "bg-pink-500 text-white",
  "bg-teal-500 text-white",
  "bg-orange-500 text-white",
  "bg-cyan-500 text-white",
  "bg-fuchsia-500 text-white",
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// Streak level thresholds for visual progression
function getStreakLevel(count: number): { label: string; color: string; glow: string } {
  if (count >= 50) return { label: "Legendary", color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white", glow: "shadow-[0_0_12px_rgba(245,158,11,0.4)]" }
  if (count >= 30) return { label: "On fire", color: "bg-gradient-to-r from-rose-500 to-orange-500 text-white", glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]" }
  if (count >= 14) return { label: "Locked in", color: "bg-amber-500 text-white", glow: "" }
  if (count >= 7) return { label: "Rolling", color: "bg-amber-100 text-amber-700", glow: "" }
  return { label: "", color: "bg-amber-50 text-amber-600", glow: "" }
}

interface FeedItem {
  id: string
  podId: string
  pod: string
  category: string
  author: { name: string; initials: string; color: string }
  authorId: string
  time: string
  relativeTime: string
  content: string
  likes: number
  comments: number
  streakCount: number
  image?: string
  location?: string
  likedByMe: boolean
  commentThread: Comment[]
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay === 1) return "Yesterday"
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function CheckinCard({
  checkin,
  likedIds,
  onToggleLike,
  openCommentId,
  onToggleComments,
  userId,
  userDisplayName,
}: {
  checkin: FeedItem
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  openCommentId: string | null
  onToggleComments: (id: string) => void
  userId: string | null
  userDisplayName: string
}) {
  const [thread, setThread] = useState<Comment[]>(checkin.commentThread ?? [])
  const [commentText, setCommentText] = useState("")
  const [likeAnimating, setLikeAnimating] = useState(false)
  const [shared, setShared] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  const isLiked = likedIds.has(checkin.id)
  // Adjust count based on toggle vs original DB state
  const likeDelta = isLiked === checkin.likedByMe ? 0 : isLiked ? 1 : -1
  const likeCount = checkin.likes + likeDelta
  const commentsOpen = openCommentId === checkin.id
  const isHot = checkin.likes >= 4 || thread.length >= 3
  const streakLevel = getStreakLevel(checkin.streakCount)

  const badgeColor = CATEGORY_BADGE[checkin.category] ?? CATEGORY_BADGE.other

  const userInitials = userDisplayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "?"

  const profileHref = (name: string) =>
    name === "You" ? "/profile" : `/profile/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`

  const handleSubmitComment = async () => {
    const text = commentText.trim()
    if (!text || !userId) return
    setSubmittingComment(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("checkin_comments")
        .insert({ checkin_id: checkin.id, user_id: userId, content: text })
        .select("id, created_at")
        .single()

      if (error) {
        console.error("Failed to save comment:", error)
        return
      }

      const newComment: Comment = {
        id: data.id,
        author: { name: "You", initials: userInitials, color: "bg-zinc-900 text-white" },
        text,
        time: "Just now",
      }
      setThread((prev) => [...prev, newComment])
      setCommentText("")
    } catch (err) {
      console.error("Failed to save comment:", err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleLike = (id: string) => {
    if (!isLiked) {
      setLikeAnimating(true)
      setTimeout(() => setLikeAnimating(false), 600)
    }
    onToggleLike(id)
  }

  const handleShare = () => {
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <article className="bg-white border border-zinc-100 rounded-3xl p-4 sm:p-6 shadow-softer hover:shadow-card hover:border-zinc-200 transition-all duration-300 ease-spring overflow-hidden">
      {/* Author header */}
      <div className="flex items-start justify-between mb-4 min-w-0">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Link href={profileHref(checkin.author.name)} className="flex-shrink-0">
            <div
              className={`w-10 h-10 rounded-full ${checkin.author.color} flex items-center justify-center text-sm font-bold hover:opacity-80 transition-opacity ring-2 ring-white`}
            >
              {checkin.author.initials}
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={profileHref(checkin.author.name)} className="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors">{checkin.author.name}</Link>
              {/* Streak badge with level */}
              <div className={`flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${streakLevel.color} ${streakLevel.glow}`}>
                <Flame size={10} weight="fill" />
                <span>{checkin.streakCount}</span>
                {streakLevel.label && <span className="hidden sm:inline">· {streakLevel.label}</span>}
              </div>
              {/* Hot indicator for popular posts */}
              {isHot && (
                <div className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500 bg-orange-50 rounded-full px-1.5 py-0.5">
                  <Lightning size={9} weight="fill" />
                  <span>Hot</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Link
                href={`/pods/${checkin.podId}`}
                className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity hover:opacity-80 ${badgeColor}`}
              >
                {checkin.pod}
              </Link>
              {checkin.location && (
                <>
                  <span className="text-zinc-200">·</span>
                  <div className="flex items-center gap-0.5 text-xs text-zinc-400">
                    <MapPin size={10} weight="fill" className="text-zinc-300" />
                    <span>{checkin.location}</span>
                  </div>
                </>
              )}
              <span className="text-zinc-200">·</span>
              <span className="text-xs text-zinc-400">{checkin.relativeTime}</span>
            </div>
          </div>
        </div>
        <button className="text-zinc-300 hover:text-zinc-500 transition-colors p-1 -mr-1 rounded-lg hover:bg-zinc-50">
          <DotsThree size={18} weight="bold" />
        </button>
      </div>

      {/* Content */}
      <p className="text-[15px] text-zinc-700 leading-relaxed mb-4 break-words">{checkin.content}</p>

      {/* Image */}
      {checkin.image && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-zinc-100">
          <img src={checkin.image} alt="" className="w-full object-cover max-h-72" />
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-50">
        <div className="flex items-center gap-5">
          {/* Like button */}
          <button
            onClick={() => handleLike(checkin.id)}
            className={`flex items-center gap-1.5 text-sm transition-all group ${
              isLiked ? "text-rose-500" : "text-zinc-400 hover:text-rose-500"
            }`}
          >
            <Heart
              size={17}
              weight={isLiked ? "fill" : "regular"}
              className={`transition-transform group-active:scale-125 ${likeAnimating ? "animate-bounce" : ""}`}
            />
            <span className="tabular-nums font-medium">{likeCount}</span>
          </button>
          {/* Comment button */}
          <button
            onClick={() => onToggleComments(checkin.id)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              commentsOpen ? "text-zinc-700" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <ChatCircle size={17} weight={commentsOpen ? "fill" : "regular"} />
            <span className="tabular-nums font-medium">{thread.length}</span>
          </button>
          {/* Share button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              shared ? "text-emerald-500" : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <ShareNetwork size={16} weight={shared ? "fill" : "regular"} />
            {shared && <span className="text-xs font-medium">Copied!</span>}
          </button>
        </div>
        {/* Like faces - social proof */}
        {likeCount > 0 && (
          <div className="text-[11px] text-zinc-400">
            {likeCount === 1 ? "1 like" : `${likeCount} likes`}
          </div>
        )}
      </div>

      {/* Comments section */}
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

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2 bg-zinc-50 border border-zinc-200 focus-within:border-amber-400 focus-within:bg-white rounded-2xl px-3 py-2 transition-all">
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

export default function DashboardPage() {
  const { user } = useSession()
  const { profile } = useUserProfile()
  const { currentStreak, totalCheckins } = useUserStats()
  const { joinedPodIds, createdPods } = usePodState()

  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [myPods, setMyPods] = useState<any[]>([])
  const [trendingPods, setTrendingPods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [openCommentId, setOpenCommentId] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerText, setComposerText] = useState("")
  const [composerPod, setComposerPod] = useState<string | undefined>()
  const [composerPosted, setComposerPosted] = useState(false)

  const supabase = createClient()
  const firstName = profile?.displayName?.split(" ")[0] || "User"

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return
        const sb = createClient()

        // Fetch checkins with pod, likes, and comments (no profiles join — FK missing)
        const { data: checkins } = await sb
          .from("checkins")
          .select("*, pods(name, category, location), checkin_likes(user_id), checkin_comments(id, user_id, content, created_at)")
          .order("created_at", { ascending: false })
          .limit(50)

        // Collect all user IDs from checkins + comments for profile lookup
        const allUserIds = new Set<string>()
        ;(checkins || []).forEach((c: any) => {
          allUserIds.add(c.user_id)
          ;(c.checkin_comments || []).forEach((cm: any) => allUserIds.add(cm.user_id))
        })

        // Fetch profiles for all referenced users
        const profileMap: Record<string, { name: string; location: string }> = {}
        if (allUserIds.size > 0) {
          const { data: profiles } = await sb
            .from("profiles")
            .select("id, display_name, location")
            .in("id", Array.from(allUserIds))

          ;(profiles || []).forEach((p: any) => {
            profileMap[p.id] = { name: p.display_name || "Unknown", location: p.location || "" }
          })
        }

        // Fetch user's pod memberships
        const { data: memberships } = await sb
          .from("pod_members")
          .select("pod_id, pods(id, name, cadence, member_count, created_by)")
          .eq("user_id", user.id)

        // Fetch all pods for trending
        const { data: allPods } = await sb
          .from("pods")
          .select("*")
          .order("member_count", { ascending: false })
          .limit(10)

        // Build feed items
        const items: FeedItem[] = (checkins || []).map((c: any) => {
          const authorProfile = profileMap[c.user_id] || { name: "Unknown User", location: "" }
          const displayName = authorProfile.name
          const initials = displayName
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
          const createdAt = new Date(c.created_at)
          // Use profile location, fallback to pod location
          const location = authorProfile.location || c.pods?.location || null
          return {
            id: c.id,
            podId: c.pod_id,
            pod: c.pods?.name || "Unknown Pod",
            category: c.pods?.category || "other",
            author: {
              name: displayName,
              initials,
              color: getAvatarColor(displayName),
            },
            authorId: c.user_id,
            time: createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            relativeTime: getRelativeTime(createdAt),
            content: c.content,
            likes: c.checkin_likes?.length || 0,
            comments: c.checkin_comments?.length || 0,
            streakCount: c.streak_count,
            image: c.image_url,
            location,
            likedByMe: (c.checkin_likes || []).some((l: any) => l.user_id === user.id),
            commentThread: (c.checkin_comments || []).map((cm: any) => {
              const cmProfile = profileMap[cm.user_id] || { name: "Unknown", location: "" }
              const cmName = cmProfile.name
              const cmInitials = cmName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)
              return {
                id: cm.id,
                author: { name: cmName, initials: cmInitials, color: getAvatarColor(cmName) },
                text: cm.content,
                time: getRelativeTime(new Date(cm.created_at)),
              }
            }),
          }
        })

        // Build my pods
        const myPodsData = (memberships || []).map((m: any) => m.pods)
        setMyPods(myPodsData.filter(Boolean))

        // Trending pods (not in user's pods)
        const myPodIds = new Set(myPodsData.map((p: any) => p?.id))
        setTrendingPods((allPods || []).filter((p: any) => !myPodIds.has(p.id)).slice(0, 3))

        // Initialize liked IDs from database
        const userLikedIds = new Set<string>()
        ;(checkins || []).forEach((c: any) => {
          if (c.checkin_likes?.some((l: any) => l.user_id === user.id)) {
            userLikedIds.add(c.id)
          }
        })
        setLikedIds(userLikedIds)

        setFeedItems(items)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleQuickPost = async () => {
    if (!composerText.trim() || !composerPod || !user) return

    try {
      await supabase.from("checkins").insert([
        {
          pod_id: composerPod,
          user_id: user.id,
          content: composerText.trim(),
          visibility: "pod",
          streak_count: currentStreak + 1,
        },
      ])

      setComposerPosted(true)
      setTimeout(() => {
        setComposerPosted(false)
        setComposerOpen(false)
        setComposerText("")
        window.location.reload()
      }, 2500)
    } catch (err) {
      console.error("Failed to post checkin:", err)
    }
  }

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 overflow-x-hidden w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 sm:mb-10 animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">{greeting}, {firstName}.</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-2">See what your pods are up to</p>
        </div>
        <Link
          href="/checkin"
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-all duration-200 ease-spring active:scale-[0.97] shadow-sm w-full sm:w-auto flex-shrink-0"
        >
          <PlusCircle size={16} weight="fill" />
          Check in
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
        <div className="min-w-0">
          {/* My pods strip */}
          <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {myPods.map((pod) => (
              <Link
                key={pod.id}
                href={`/pods/${pod.id}`}
                className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-zinc-100 rounded-2xl px-3.5 py-2.5 hover:border-zinc-300 hover:shadow-softer transition-all duration-200 ease-spring active:scale-[0.97]"
              >
                <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">
                  {pod.name[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-800 whitespace-nowrap">{pod.name}</div>
                  <div className="text-[10px] text-zinc-400">{CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS]}</div>
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
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setComposerOpen(true)}>
                <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {profile?.displayName?.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "?"}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-zinc-400">What did you work on today?</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0">
                  <PencilSimple size={12} weight="fill" />
                  Post
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {profile?.displayName?.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "?"}
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {myPods.map((pod) => (
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
                      disabled={!composerText.trim() || !composerPod}
                      className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150"
                    >
                      <PencilSimple size={12} weight="fill" />
                      Post
                    </button>
                  </div>
                </div>

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
            {loading ? (
              <div className="text-center py-12">
                <div className="w-6 h-6 border-2 border-zinc-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-zinc-400">Loading your feed...</p>
              </div>
            ) : (
              <>
                {/* Pinned IG post — first in feed */}
                <div className="animate-fade-up stagger-1">
                  <article className="bg-white border border-zinc-100 rounded-3xl shadow-softer relative overflow-hidden">
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50/90 backdrop-blur-sm border border-amber-100 rounded-full px-2 py-0.5">
                        <Lightning size={9} weight="fill" />
                        <span>Pinned</span>
                      </div>
                    </div>
                    <div className="w-full overflow-hidden relative" style={{ maxHeight: 820 }}>
                      <iframe
                        src="https://www.instagram.com/reel/DVwHV5oEYN-/embed/captioned/"
                        className="w-full"
                        style={{ height: 960, border: 0, marginBottom: -140, maxWidth: "100%" }}
                        allowFullScreen
                        scrolling="no"
                      />
                    </div>
                    <div className="p-4 sm:p-6 pt-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white flex-shrink-0">
                          C
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-900">Common</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-1.5 py-0.5">Official</span>
                          </div>
                          <span className="text-xs text-zinc-400">Welcome to the community</span>
                        </div>
                      </div>
                      <p className="text-[15px] text-zinc-700 leading-relaxed">
                        This is what accountability looks like. Real people, real pods, real progress. Welcome to Common.
                      </p>
                    </div>
                  </article>
                </div>

                {/* Check-in posts from Supabase */}
                {feedItems.map((checkin, i) => (
                  <div key={checkin.id} className={`animate-fade-up stagger-${Math.min(i + 2, 5)}`}>
                    <CheckinCard
                      checkin={checkin}
                      likedIds={likedIds}
                      onToggleLike={async (id) => {
                        if (!user) return
                        const next = new Set(likedIds)
                        if (next.has(id)) {
                          next.delete(id)
                          setLikedIds(next)
                          await supabase
                            .from("checkin_likes")
                            .delete()
                            .eq("checkin_id", id)
                            .eq("user_id", user.id)
                        } else {
                          next.add(id)
                          setLikedIds(next)
                          await supabase
                            .from("checkin_likes")
                            .insert({ checkin_id: id, user_id: user.id })
                        }
                      }}
                      openCommentId={openCommentId}
                      onToggleComments={(id) => setOpenCommentId((prev) => (prev === id ? null : id))}
                      userId={user?.id ?? null}
                      userDisplayName={profile?.displayName || "User"}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-5 sticky top-8">
          {/* Streak card */}
          <div className="bg-zinc-900 rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-amber-500 rounded-full opacity-15 blur-3xl pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-zinc-700 rounded-full opacity-30 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-3">
                <Flame size={13} weight="fill" className="text-amber-400" />
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Your streak</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold text-white tracking-tighter tabular-nums">{currentStreak}</span>
                <span className="text-sm text-zinc-500 font-medium">days</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                {currentStreak === 0
                  ? "Start your streak today."
                  : currentStreak < 7
                  ? "Keep it going — 7 days is your next milestone."
                  : currentStreak < 30
                  ? "You're building real momentum."
                  : "Legendary consistency. Don't stop now."}
              </p>
              <Link
                href="/checkin"
                className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold py-3 rounded-2xl transition-all duration-200 ease-spring active:scale-[0.97] shadow-amber"
              >
                Post a check-in
              </Link>
            </div>
          </div>

          {/* Your stats */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={14} weight="fill" className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-800">Your stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 rounded-2xl p-3 text-center">
                <div className="text-2xl font-bold text-zinc-900 tabular-nums tracking-tight">{totalCheckins}</div>
                <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Check-ins</div>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-3 text-center">
                <div className="text-2xl font-bold text-zinc-900 tabular-nums tracking-tight">{myPods.length}</div>
                <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Active pods</div>
              </div>
            </div>
          </div>

          {/* My pods sidebar */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-5">
            <h3 className="text-sm font-semibold text-zinc-800 mb-4">My pods</h3>
            <div className="space-y-3">
              {myPods.map((pod) => (
                <Link key={pod.id} href={`/pods/${pod.id}`} className="flex items-center gap-2.5 group">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {pod.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-700 truncate group-hover:text-zinc-900 transition-colors">
                      {pod.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">{CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS]}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendUp size={14} weight="bold" className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-800">Trending</h3>
            </div>
            <div className="space-y-3">
              {trendingPods.map((pod) => (
                <Link key={pod.id} href={`/pods/${pod.id}`} className="flex items-center gap-2.5 group">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {pod.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-700 truncate group-hover:text-zinc-900 transition-colors">
                      {pod.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">{pod.member_count || 0} members</div>
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
