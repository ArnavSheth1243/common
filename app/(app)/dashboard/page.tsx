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
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserAvatar, getAvatarColor } from "@/components/ui/user-avatar"
import { PageHeader } from "@/components/ui/page-header"
import { StatBlock } from "@/components/ui/stat-block"
import { EmptyState } from "@/components/ui/empty-state"
import { CategoryBadge } from "@/components/ui/category-badge"
import { cn } from "@/lib/utils"

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

/* ─── Check-in Card ─── */

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
  const [submittingComment, setSubmittingComment] = useState(false)

  const isLiked = likedIds.has(checkin.id)
  const likeDelta = isLiked === checkin.likedByMe ? 0 : isLiked ? 1 : -1
  const likeCount = checkin.likes + likeDelta
  const commentsOpen = openCommentId === checkin.id

  const userInitials = userDisplayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2) || "?"

  const profileHref = (name: string) =>
    name === "You"
      ? "/profile"
      : `/profile/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`

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

  return (
    <Card className="overflow-hidden hover:shadow-2 hover:border-zinc-200 transition-all duration-150">
      <div className="p-4 sm:p-5">
        {/* Author header — simplified single line */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={profileHref(checkin.author.name)} className="flex-shrink-0">
              <UserAvatar name={checkin.author.name} size="md" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Link
                  href={profileHref(checkin.author.name)}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {checkin.author.name}
                </Link>
                <span className="text-zinc-300">·</span>
                <Link
                  href={`/pods/${checkin.podId}`}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {checkin.pod}
                </Link>
                <span className="text-zinc-300">·</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {checkin.relativeTime}
                </span>
              </div>
              {checkin.streakCount > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame size={11} weight="fill" className="text-blue-500" />
                  <span className="text-xs font-medium text-blue-700 tabular-nums">
                    {checkin.streakCount} day streak
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="relative group">
            <button className="text-zinc-300 hover:text-zinc-500 transition-colors p-1 rounded-lg hover:bg-accent peer">
              <DotsThree size={18} weight="bold" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-xl shadow-3 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-10">
              <button
                onClick={() => {
                  // Copy link
                  navigator.clipboard?.writeText(`${window.location.origin}/pods/${checkin.podId}`)
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground leading-relaxed mb-3 break-words">
          {checkin.content}
        </p>

        {/* Image */}
        {checkin.image && (
          <div className="rounded-xl overflow-hidden mb-3 border border-border">
            <img src={checkin.image} alt="" className="w-full object-cover max-h-72" />
          </div>
        )}

        {/* Engagement bar */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <button
            onClick={() => handleLike(checkin.id)}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-all group",
              isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500",
            )}
          >
            <Heart
              size={17}
              weight={isLiked ? "fill" : "regular"}
              className={cn(
                "transition-transform group-active:scale-125",
                likeAnimating && "animate-bounce",
              )}
            />
            <span className="tabular-nums font-medium">{likeCount}</span>
          </button>
          <button
            onClick={() => onToggleComments(checkin.id)}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              commentsOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ChatCircle size={17} weight={commentsOpen ? "fill" : "regular"} />
            <span className="tabular-nums font-medium">{thread.length}</span>
          </button>
        </div>

        {/* Comments section */}
        {commentsOpen && (
          <div className="mt-3 pt-3 border-t border-border">
            {thread.length > 0 ? (
              <div className="space-y-3 mb-3">
                {thread.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2.5">
                    <Link href={profileHref(comment.author.name)} className="flex-shrink-0">
                      <UserAvatar name={comment.author.name} size="xs" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <Link
                          href={profileHref(comment.author.name)}
                          className="text-xs font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {comment.author.name}
                        </Link>
                        <span className="text-[10px] text-muted-foreground">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2 mb-3">
                No comments yet
              </p>
            )}

            <div className="flex items-center gap-2">
              <UserAvatar name={userDisplayName} size="xs" />
              <div className="flex-1 min-w-0 flex items-center gap-2 bg-accent border border-border focus-within:border-primary focus-within:bg-card rounded-xl px-3 py-2 transition-all">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  placeholder="Add a comment..."
                  className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors flex-shrink-0"
                >
                  <PaperPlaneTilt size={15} weight="fill" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

/* ─── Dashboard Page ─── */

export default function DashboardPage() {
  const { user } = useSession()
  const { profile } = useUserProfile()
  const { currentStreak, totalCheckins, recordCheckin } = useUserStats()
  const { joinedPodIds, createdPods } = usePodState()

  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [myPods, setMyPods] = useState<any[]>([])
  const [trendingPods, setTrendingPods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey((k) => k + 1)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    const handleFocus = () => setRefreshKey((k) => k + 1)
    window.addEventListener("focus", handleFocus)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

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

        const { data: checkins } = await sb
          .from("checkins")
          .select(
            "*, pods(name, category, location), checkin_likes(user_id), checkin_comments(id, user_id, content, created_at)",
          )
          .order("created_at", { ascending: false })
          .limit(50)

        const allUserIds = new Set<string>()
        ;(checkins || []).forEach((c: any) => {
          allUserIds.add(c.user_id)
          ;(c.checkin_comments || []).forEach((cm: any) => allUserIds.add(cm.user_id))
        })

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

        const { data: memberships } = await sb
          .from("pod_members")
          .select("pod_id, pods(id, name, cadence, member_count, created_by)")
          .eq("user_id", user.id)

        const { data: allPods } = await sb
          .from("pods")
          .select("*")
          .order("member_count", { ascending: false })
          .limit(10)

        const myPodIdSet = new Set((memberships || []).map((m: any) => m.pod_id))
        const visibleCheckins = (checkins || []).filter((c: any) => {
          if (c.visibility === "public" || !c.visibility) return true
          if (c.visibility === "pod") return myPodIdSet.has(c.pod_id) || c.user_id === user.id
          if (c.visibility === "private") return c.user_id === user.id
          return true
        })

        const items: FeedItem[] = visibleCheckins.map((c: any) => {
          const authorProfile = profileMap[c.user_id] || { name: "Unknown User", location: "" }
          const displayName = authorProfile.name
          const initials = displayName
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
          const createdAt = new Date(c.created_at)
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
              const cmInitials = cmName
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
              return {
                id: cm.id,
                author: { name: cmName, initials: cmInitials, color: getAvatarColor(cmName) },
                text: cm.content,
                time: getRelativeTime(new Date(cm.created_at)),
              }
            }),
          }
        })

        const myPodsData = (memberships || []).map((m: any) => m.pods)
        setMyPods(myPodsData.filter(Boolean))

        const myPodIds = new Set(myPodsData.map((p: any) => p?.id))
        setTrendingPods((allPods || []).filter((p: any) => !myPodIds.has(p.id)).slice(0, 3))

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
  }, [user, refreshKey])

  const [composerError, setComposerError] = useState<string | null>(null)

  const handleQuickPost = async () => {
    if (!composerText.trim() || !composerPod || !user) return
    setComposerError(null)
    try {
      const { error } = await supabase.from("checkins").insert([
        {
          pod_id: composerPod,
          user_id: user.id,
          content: composerText.trim(),
          visibility: "pod",
          streak_count: currentStreak + 1,
        },
      ])
      if (error) throw error
      recordCheckin(composerPod)
      setComposerPosted(true)
      setTimeout(() => {
        setComposerPosted(false)
        setComposerOpen(false)
        setComposerText("")
        setRefreshKey((k) => k + 1)
      }, 2500)
    } catch (err: any) {
      console.error("Failed to post checkin:", err)
      setComposerError("Failed to post. Please try again.")
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {greeting}, {firstName}
          </h1>
        </div>
        <Button asChild size="default">
          <Link href="/checkin" className="gap-2">
            <PlusCircle size={16} weight="fill" />
            Check in
          </Link>
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBlock
          value={currentStreak}
          label="Streak"
          icon={<Flame size={18} weight="fill" className="text-blue-500" />}
        />
        <StatBlock
          value={totalCheckins}
          label="Check-ins"
          icon={<Trophy size={18} weight="fill" className="text-blue-700" />}
        />
        <StatBlock
          value={myPods.length}
          label="Pods"
          icon={<Lightning size={18} weight="fill" className="text-emerald-500" />}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
        <div className="min-w-0">
          {/* Pod strip */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {myPods.map((pod) => (
              <Link
                key={pod.id}
                href={`/pods/${pod.id}`}
                className="flex-shrink-0 flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 hover:border-zinc-300 hover:shadow-2 transition-all duration-150"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold">
                  {pod.name[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {pod.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS]}
                  </div>
                </div>
              </Link>
            ))}
            <Link
              href="/pods"
              className="flex-shrink-0 flex items-center gap-2 border border-dashed border-border rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-zinc-300 transition-all duration-150"
            >
              <PlusCircle size={14} />
              Find pods
            </Link>
          </div>

          {/* Composer */}
          <Card className="mb-4 overflow-hidden">
            <div className="p-4">
              {!composerOpen ? (
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setComposerOpen(true)}
                >
                  <UserAvatar name={profile?.displayName || "User"} size="sm" />
                  <span className="flex-1 text-sm text-muted-foreground">
                    What did you work on today?
                  </span>
                  <Button size="sm" variant="default">
                    <PencilSimple size={12} weight="fill" className="mr-1.5" />
                    Post
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <UserAvatar name={profile?.displayName || "User"} size="sm" />
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {myPods.map((pod) => (
                        <button
                          key={pod.id}
                          onClick={() => setComposerPod(pod.id)}
                          className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-lg border transition-all duration-150",
                            composerPod === pod.id
                              ? "bg-foreground text-background border-foreground"
                              : "bg-card text-muted-foreground border-border hover:border-zinc-300 hover:text-foreground",
                          )}
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
                    placeholder="What have you been up to?"
                    className="w-full text-sm text-foreground placeholder:text-muted-foreground bg-accent border border-border focus:border-primary focus:bg-card rounded-xl px-3 py-2.5 outline-none resize-none transition-all"
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {composerText.length}/300
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setComposerOpen(false)
                          setComposerText("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleQuickPost}
                        disabled={!composerText.trim() || !composerPod}
                      >
                        <PencilSimple size={12} weight="fill" className="mr-1.5" />
                        Post
                      </Button>
                    </div>
                  </div>

                  {composerPosted && (
                    <div className="mt-3 text-xs text-green-600 font-semibold text-center bg-green-50 rounded-xl py-2">
                      Posted! Nice work.
                    </div>
                  )}
                  {composerError && (
                    <div className="mt-3 text-xs text-red-600 font-semibold text-center bg-red-50 rounded-xl py-2">
                      {composerError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Feed */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading your feed...</p>
              </div>
            ) : feedItems.length === 0 ? (
              <EmptyState
                icon={<ChatCircle size={40} />}
                title="No check-ins yet"
                description="Browse activities, join a pod, and share what you're up to."
                action={
                  <Button asChild>
                    <Link href="/pods">Browse pods</Link>
                  </Button>
                }
              />
            ) : (
              feedItems.map((checkin) => (
                <CheckinCard
                  key={checkin.id}
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
                  onToggleComments={(id) =>
                    setOpenCommentId((prev) => (prev === id ? null : id))
                  }
                  userId={user?.id ?? null}
                  userDisplayName={profile?.displayName || "User"}
                />
              ))
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block space-y-4 sticky top-8">
          {/* Streak card */}
          <Card className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 border-0 overflow-hidden text-white shadow-[0_8px_30px_-8px_rgba(29,78,216,0.5)]">
            <div className="p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <Flame size={14} weight="fill" className="text-white/80" />
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">
                  Your streak
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold text-white tracking-tighter tabular-nums">
                  {currentStreak}
                </span>
                <span className="text-sm text-white/60 font-medium">days</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                {currentStreak === 0
                  ? "Start your streak today."
                  : currentStreak < 7
                    ? "Keep going — 7 days is your next milestone."
                    : currentStreak < 30
                      ? "You're building real momentum."
                      : "Legendary consistency."}
              </p>
              <Button asChild className="w-full bg-white hover:bg-white/90 text-blue-800 font-bold">
                <Link href="/checkin">Post a check-in</Link>
              </Button>
            </div>
          </Card>

          {/* My pods */}
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">My pods</h3>
              <div className="space-y-2.5">
                {myPods.map((pod) => (
                  <Link
                    key={pod.id}
                    href={`/pods/${pod.id}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {pod.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {pod.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {CADENCE_LABELS[pod.cadence as keyof typeof CADENCE_LABELS]}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          {/* Trending */}
          {trendingPods.length > 0 && (
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendUp size={14} weight="bold" className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Trending</h3>
                </div>
                <div className="space-y-2.5">
                  {trendingPods.map((pod) => (
                    <Link
                      key={pod.id}
                      href={`/pods/${pod.id}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {pod.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {pod.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {pod.member_count || 0} members
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
