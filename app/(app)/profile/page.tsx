"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Flame,
  CalendarCheck,
  Users,
  PencilSimple,
  Sneaker,
  ArrowUpRight,
  Camera,
  InstagramLogo,
  X,
  Check,
  Globe,
  Lock,
  MapPin,
  CalendarBlank,
  Article,
} from "@phosphor-icons/react"
import { CADENCE_LABELS, type Pod, type RsvpStatus } from "@/lib/data"
import { useUserStats } from "@/app/context/user-stats"
import { useUserProfile } from "@/app/context/user-profile"
import { useMedals, RARITY_STYLES, CATEGORY_LABELS, type MedalCategory } from "@/app/context/medals"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

type ProfileTab = "overview" | "posts" | "events" | "medals"

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useSession()
  const { totalCheckins, currentStreak, longestStreak, calendarData, podStreaks } = useUserStats()
  const { profile, updateProfile } = useUserProfile()
  const { medals, earnedCount, totalMedals, rank, nextRank, progressToNext } = useMedals()
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview")
  const [myPods, setMyPods] = useState<Pod[]>([])
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  // Fetch user's pods and check-ins
  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const supabase = createClient()
      const { data: podMemberships } = await supabase
        .from("pod_members")
        .select("pod_id, pods(*)")
        .eq("user_id", user.id)

      if (podMemberships) {
        const pods: Pod[] = podMemberships.map((m: any) => ({
          id: m.pods.id,
          name: m.pods.name,
          cadence: m.pods.cadence as any,
          members: m.pods.member_count,
          streak: m.pods.streak,
          visibility: m.pods.visibility,
          memberColors: ["bg-zinc-900"],
          type: m.pods.type,
          category: m.pods.category,
          description: m.pods.description || "",
          maxMembers: m.pods.max_members,
          createdAt: new Date(m.pods.created_at).toLocaleDateString(),
          location: m.pods.location || "",
          podMembers: [],
          recentCheckins: [],
          podId: m.pods.id,
          createdByYou: m.pods.created_by === user.id,
        }))
        setMyPods(pods)
      }

      const { data: checkins } = await supabase
        .from("checkins")
        .select("*, pods(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (checkins) {
        setMyPosts(checkins.map((c: any) => ({
          id: c.id,
          content: c.content,
          time: new Date(c.created_at).toLocaleString(),
          streakCount: c.streak_count,
          likes: 0,
          comments: 0,
          visibility: c.visibility,
          podName: c.pods?.name || "Unknown Pod",
        })))
      }
    }
    fetchData()
  }, [user])

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [igInput, setIgInput] = useState("")
  const [igEditing, setIgEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Avatar crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropScale, setCropScale] = useState(1)
  const [cropOffsetX, setCropOffsetX] = useState(0)
  const [cropOffsetY, setCropOffsetY] = useState(0)
  const cropCanvasRef = useRef<HTMLCanvasElement>(null)
  const cropImgRef = useRef<HTMLImageElement | null>(null)

  // Derived from profile context (persisted in Supabase)
  const isPublic = profile?.isPublic ?? true
  const bio = profile?.bio || ""
  const instagramHandle = profile?.instagramHandle || ""
  const avatarUrl = profile?.avatarUrl || null

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setCropSrc(reader.result as string)
        setCropScale(1)
        setCropOffsetX(0)
        setCropOffsetY(0)
      }
      reader.readAsDataURL(file)
    }
    // Reset input so re-selecting same file works
    e.target.value = ""
  }

  const handleCropSave = () => {
    if (!cropImgRef.current) return
    const canvas = document.createElement("canvas")
    const size = 256
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = cropImgRef.current
    const minDim = Math.min(img.naturalWidth, img.naturalHeight)
    const scaledDim = minDim / cropScale
    const cx = (img.naturalWidth / 2) + (cropOffsetX / 100) * img.naturalWidth - scaledDim / 2
    const cy = (img.naturalHeight / 2) + (cropOffsetY / 100) * img.naturalHeight - scaledDim / 2

    ctx.drawImage(img, cx, cy, scaledDim, scaledDim, 0, 0, size, size)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
    updateProfile({ avatarUrl: dataUrl })
    setCropSrc(null)
  }

  const handleSaveInstagram = () => {
    const handle = igInput.replace(/^@/, "").trim()
    if (handle) {
      updateProfile({ instagramHandle: handle })
      setIgEditing(false)
      setIgInput("")
    }
  }

  const handleRemoveInstagram = () => {
    updateProfile({ instagramHandle: "" })
    setIgEditing(false)
    setIgInput("")
  }

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("checkins").delete().eq("id", postId)
      if (!error) {
        setMyPosts((prev) => prev.filter((p) => p.id !== postId))
      }
    } catch (err) {
      console.error("Failed to delete post:", err)
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth")
  }

  // Managed pods
  const managedPods = myPods.filter((p) => p.createdByYou)

  // RSVP state for events tab
  const [eventRsvps, setEventRsvps] = useState<Record<string, RsvpStatus>>(() => {
    const init: Record<string, RsvpStatus> = {}
    allEvents.forEach((e) => { init[e.id] = "going" })
    return init
  })

  // 35-day rolling calendar: Feb 16 (Mon) – Mar 22 (Sun), 5 complete weeks
  // Today = March 21 (Saturday), March 22 = future
  const calendarWeeks: string[][] = [
    ["2026-02-16","2026-02-17","2026-02-18","2026-02-19","2026-02-20","2026-02-21","2026-02-22"],
    ["2026-02-23","2026-02-24","2026-02-25","2026-02-26","2026-02-27","2026-02-28","2026-03-01"],
    ["2026-03-02","2026-03-03","2026-03-04","2026-03-05","2026-03-06","2026-03-07","2026-03-08"],
    ["2026-03-09","2026-03-10","2026-03-11","2026-03-12","2026-03-13","2026-03-14","2026-03-15"],
    ["2026-03-16","2026-03-17","2026-03-18","2026-03-19","2026-03-20","2026-03-21","2026-03-22"],
  ]
  const todayKey = "2026-03-21"
  const futureKey = "2026-03-22"

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8 animate-fade-up">
        <h1 className="text-[28px] sm:text-[36px] font-bold text-zinc-900 tracking-tighter leading-none">Profile</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateProfile({ isPublic: !isPublic })}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              isPublic
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : "bg-zinc-100 border-zinc-200 text-zinc-500"
            }`}
          >
            {isPublic ? <Globe size={11} /> : <Lock size={11} />}
            {isPublic ? "Public" : "Private"}
          </button>
          <button
            onClick={() => { setEditName(profile?.displayName || ""); setEditBio(profile?.bio || ""); setIsEditingProfile(true) }}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Avatar crop modal */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-bold text-zinc-900 mb-4">Adjust your photo</h3>
            {/* Preview */}
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-zinc-100 mb-4 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => { cropImgRef.current = el }}
                src={cropSrc}
                alt="Crop preview"
                className="absolute"
                style={{
                  width: `${cropScale * 100}%`,
                  height: `${cropScale * 100}%`,
                  objectFit: "cover",
                  left: `${50 - (cropScale * 50) + cropOffsetX}%`,
                  top: `${50 - (cropScale * 50) + cropOffsetY}%`,
                }}
                draggable={false}
              />
            </div>
            {/* Zoom slider */}
            <div className="mb-3">
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropScale}
                onChange={(e) => setCropScale(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            {/* Position sliders */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Left / Right</label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={cropOffsetX}
                  onChange={(e) => setCropOffsetX(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Up / Down</label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={cropOffsetY}
                  onChange={(e) => setCropOffsetY(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setCropSrc(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-zinc-500 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Save photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6 shadow-softer">
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0 group">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              aria-label="Change profile photo"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white text-xl font-bold">
                  {(profile?.displayName || "U").split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1">
            {isEditingProfile ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 outline-none transition-all"
                />
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Short bio (optional)"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-zinc-700 outline-none transition-all"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const name = editName.trim() || profile?.displayName || "User"
                      updateProfile({ displayName: name, bio: editBio.trim() })
                      setIsEditingProfile(false)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl"
                  >
                    <Check size={11} weight="bold" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 bg-zinc-100 text-zinc-500 text-xs font-medium rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tighter">{profile?.displayName || "User"}</h2>
                {bio && <p className="text-sm text-zinc-500 mt-0.5 leading-snug">{bio}</p>}
              </>
            )}

            {/* Rank badge + join date */}
            {!isEditingProfile && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${rank.color} ${rank.textColor}`}>
                  <span>{rank.emoji}</span>
                  <span>{rank.name}</span>
                </span>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <CalendarCheck size={13} />
                  <span>Joined March 2025</span>
                </div>
              </div>
            )}

            {/* Instagram */}
            <div className="mt-2">
              {instagramHandle && instagramHandle.length > 0 && !igEditing ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://instagram.com/${instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-pink-600 transition-colors"
                  >
                    <InstagramLogo size={14} weight="duotone" />
                    <span>@{instagramHandle}</span>
                    <ArrowUpRight size={11} className="opacity-50" />
                  </a>
                  <button
                    onClick={() => { setIgInput(instagramHandle); setIgEditing(true) }}
                    className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleRemoveInstagram}
                    className="text-xs text-zinc-300 hover:text-rose-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : igEditing ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 focus-within:border-amber-400 transition-colors">
                    <InstagramLogo size={13} className="text-zinc-400 flex-shrink-0" />
                    <span className="text-zinc-400 text-sm">@</span>
                    <input
                      type="text"
                      value={igInput}
                      onChange={(e) => setIgInput(e.target.value.replace(/^@/, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveInstagram()}
                      placeholder="yourhandle"
                      autoFocus
                      className="text-sm bg-transparent outline-none text-zinc-900 w-32"
                    />
                  </div>
                  <button
                    onClick={handleSaveInstagram}
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Check size={12} weight="bold" />
                  </button>
                  <button
                    onClick={() => { setIgEditing(false); setIgInput("") }}
                    className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
                  >
                    <X size={12} weight="bold" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIgEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mt-0.5"
                >
                  <InstagramLogo size={13} weight="duotone" />
                  <span>Connect Instagram</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats bento */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {/* Streak — featured, amber */}
          <div className="bg-amber-500 rounded-3xl p-4 sm:p-5 flex flex-col justify-between min-h-[100px]">
            <Flame size={18} weight="fill" className="text-white/80" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tighter tabular-nums leading-none">
                {currentStreak}
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-white/70 uppercase tracking-widest mt-1">
                Streak
              </div>
            </div>
          </div>
          {/* Total check-ins */}
          <div className="bg-zinc-900 rounded-3xl px-3 sm:px-4 py-3 sm:py-4 flex flex-col justify-between">
            <div className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Posts</div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tighter">{totalCheckins}</div>
          </div>
          {/* People met */}
          <div className="bg-white border border-zinc-100 rounded-3xl px-3 sm:px-4 py-3 sm:py-4 flex flex-col justify-between shadow-softer">
            <Users size={16} className="text-zinc-400" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900 tabular-nums tracking-tighter">{profile?.peopleMet ?? 0}</div>
              <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">People met</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Pods joined */}
          <div className="bg-white border border-zinc-100 rounded-3xl px-3 sm:px-4 py-3 sm:py-4 flex flex-col justify-between shadow-softer">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pods</div>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 tabular-nums tracking-tighter">{myPods.length}</div>
          </div>
          {/* Best streak */}
          <div className="bg-white border border-zinc-100 rounded-3xl px-3 sm:px-4 py-3 sm:py-4 flex flex-col justify-between shadow-softer">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Best streak</div>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 tabular-nums tracking-tighter">{longestStreak}</div>
          </div>
        </div>

        {/* Rank progress */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rank.color} ${rank.textColor}`}>
                {rank.emoji} {rank.name}
              </span>
              <span className="text-xs text-zinc-400">{earnedCount} medals</span>
            </div>
            {nextRank && (
              <span className="text-xs text-zinc-400">{nextRank.name} in {nextRank.minMedals - earnedCount} more</span>
            )}
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-zinc-100 rounded-2xl p-1 mb-6 overflow-x-auto scrollbar-hide">
        {([
          { id: "overview", label: "Overview" },
          { id: "posts", label: "Posts" },
          { id: "events", label: "Events" },
          { id: "medals", label: `Medals${earnedCount > 0 ? ` · ${earnedCount}/${totalMedals}` : ""}` },
        ] as { id: ProfileTab; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[70px] py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Overview tab ─── */}
      {activeTab === "overview" && <>

      {/* Activity */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-6">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-zinc-800">Activity — last 35 days</h3>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["M","T","W","T","F","S","S"].map((d,i) => (
            <div key={i} className="text-center text-[10px] text-zinc-300 font-medium">{d}</div>
          ))}
        </div>

        {/* 35-day rolling calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarWeeks.flat().map((dateKey, i) => {
            const podIds = calendarData[dateKey] ?? []
            const isToday = dateKey === todayKey
            const isFuture = dateKey === futureKey
            const dayNum = parseInt(dateKey.split("-")[2], 10)
            return (
              <div
                key={i}
                className={`relative h-9 rounded-lg flex flex-col items-center justify-center gap-0.5 ${
                  isToday ? "ring-2 ring-amber-400 bg-amber-50" : "hover:bg-zinc-50"
                } transition-colors`}
              >
                <span
                  className={`text-[11px] font-medium leading-none ${
                    isToday
                      ? "text-amber-600 font-bold"
                      : isFuture
                      ? "text-zinc-200"
                      : podIds.length > 0
                      ? "text-zinc-700"
                      : "text-zinc-300"
                  }`}
                >
                  {dayNum}
                </span>
                {!isFuture && podIds.length > 0 && (
                  <div className="flex gap-0.5">
                    {podIds.map((pid, j) => {
                      const pod = myPods.find(p => p.id === pid)
                      return (
                        <div
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${pod?.memberColors[0] ?? "bg-zinc-400"}`}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend below calendar */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          {myPods.map(pod => (
            <div key={pod.id} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${pod.memberColors[0]}`} />
              <span className="text-xs text-zinc-400">{pod.name}</span>
            </div>
          ))}
        </div>
      </div>

      {!isPublic && (
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 mb-6 text-center">
          <Lock size={14} className="text-zinc-400 mx-auto mb-1" />
          <p className="text-xs text-zinc-400">Your profile is private. Only you can see your pods and check-ins.</p>
        </div>
      )}

      {/* My pods */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-800">My pods</h3>
          <Link
            href="/pods"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-0.5"
          >
            Browse
            <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="space-y-3">
          {myPods.map((pod) => {
            const streak = podStreaks[pod.id] ?? pod.streak
            const Icon = pod.category === "running" ? Sneaker : PencilSimple
            return (
              <Link
                key={pod.id}
                href={`/pods/${pod.id}`}
                className="flex items-center gap-4 bg-white border border-zinc-100 rounded-2xl p-4 hover:border-zinc-200 hover:shadow-softer transition-all duration-200 group"
              >
                <div
                  className={`w-10 h-10 rounded-2xl ${pod.memberColors[0]} flex items-center justify-center text-white flex-shrink-0`}
                >
                  <Icon size={18} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-zinc-900 truncate">{pod.name}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
                        pod.type === "Habit"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {pod.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Users size={11} />
                      <span>{pod.members} members</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Flame size={11} weight="fill" />
                      <span>{streak} · {CADENCE_LABELS[pod.cadence]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Pods you manage */}
      {managedPods.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-800">Pods you manage</h3>
          </div>
          <div className="space-y-3">
            {managedPods.map((pod) => {
              const pendingCount = (pod.pendingApplications ?? []).length
              return (
                <Link
                  key={pod.id}
                  href={`/pods/${pod.id}`}
                  className="flex items-center gap-4 bg-white border border-zinc-100 rounded-2xl p-4 hover:border-zinc-200 hover:shadow-softer transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-2xl ${pod.memberColors[0]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {pod.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-zinc-900 truncate block">{pod.name}</span>
                    <span className="text-xs text-zinc-400">View applications</span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full flex-shrink-0">
                      {pendingCount} pending
                    </span>
                  )}
                  <ArrowUpRight size={14} className="text-zinc-300 flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Sign out */}
      <div className="mt-10 pt-6 border-t border-zinc-100 text-center">
        <button
          onClick={handleSignOut}
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Sign out
        </button>
      </div>

      </> /* end Overview tab */}

      {/* ─── Posts tab ─── */}
      {activeTab === "posts" && (
        <div>
          {myPosts.length > 0 ? (
            <div className="space-y-4">
              {myPosts.map((post) => {
                const initials = (profile?.displayName || "U").split(" ").map((w: string) => w[0]).join("").slice(0, 2)
                return (
                  <div key={post.id} className="bg-white border border-zinc-100 rounded-3xl p-5 hover:border-zinc-200 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">{profile?.displayName || "User"}</p>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <span>{post.podName}</span>
                          <span>·</span>
                          <span>{post.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 rounded-full px-2 py-0.5">
                          <Flame size={9} weight="fill" />
                          <span>{post.streakCount}</span>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPostId === post.id}
                          className="text-zinc-300 hover:text-rose-500 transition-colors p-1"
                          title="Delete post"
                        >
                          {deletingPostId === post.id ? (
                            <div className="w-3 h-3 border border-zinc-300 border-t-rose-500 rounded-full animate-spin" />
                          ) : (
                            <X size={14} weight="bold" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-[15px] text-zinc-700 leading-relaxed">{post.content}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-zinc-100 rounded-3xl p-10 text-center">
              <Article size={32} className="text-zinc-200 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">No posts yet.</p>
              <p className="text-xs text-zinc-300 mt-1">Check into a pod to share your progress.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Events tab ─── */}
      {activeTab === "events" && (
        <div>
          {allEvents.length > 0 ? (
            <div className="space-y-4">
              {allEvents.map((event) => {
                const myRsvp = eventRsvps[event.id]
                return (
                  <div key={event.id} className="bg-white border border-zinc-100 rounded-3xl p-5 hover:border-zinc-200 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-amber-600 mb-0.5">{event.dateLabel} · {event.time}</p>
                        <p className="text-sm font-semibold text-zinc-900 leading-tight">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <MapPin size={11} />
                            <span>{event.location}</span>
                          </div>
                          <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                            {event.podName}
                          </span>
                        </div>
                      </div>
                      <CalendarBlank size={18} className="text-zinc-300 flex-shrink-0 mt-0.5" />
                    </div>
                    {/* RSVP buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      {(["going", "maybe", "no"] as RsvpStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => setEventRsvps((prev) => ({ ...prev, [event.id]: status }))}
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
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-zinc-100 rounded-3xl p-10 text-center">
              <CalendarBlank size={32} className="text-zinc-200 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">No upcoming events.</p>
              <p className="text-xs text-zinc-300 mt-1">Events from your pods will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Medals tab ─── */}
      {activeTab === "medals" && (
        <div>
          {/* Rank summary */}
          <div className={`rounded-3xl p-5 mb-6 flex items-center gap-4 ${rank.color}`}>
            <div className="text-5xl">{rank.emoji}</div>
            <div className="flex-1">
              <div className={`text-lg font-bold tracking-tight ${rank.textColor}`}>{rank.name}</div>
              <div className={`text-sm ${rank.textColor} opacity-70`}>{earnedCount} of {totalMedals} medals earned</div>
              {nextRank && (
                <div className="mt-2">
                  <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-black/30 rounded-full transition-all duration-700" style={{ width: `${progressToNext}%` }} />
                  </div>
                  <div className={`text-[11px] mt-1 ${rank.textColor} opacity-60`}>
                    {nextRank.minMedals - earnedCount} more medals to reach {nextRank.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Earned medals showcase */}
          {medals.filter(m => !m.locked).length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Earned</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {medals.filter(m => !m.locked).map((medal) => {
                  const s = RARITY_STYLES[medal.rarity]
                  return (
                    <div
                      key={medal.id}
                      className={`flex items-center gap-1.5 ${s.bg} ${s.border} border rounded-full px-3 py-1.5 ${s.glow}`}
                      title={medal.description}
                    >
                      <span className="text-lg">{medal.emoji}</span>
                      <span className={`text-xs font-bold ${s.text}`}>{medal.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Medal categories */}
          {(["founding", "streak", "milestone", "challenge", "meetup", "social", "exploration", "consistency"] as MedalCategory[]).map((cat) => {
            const catMedals = medals.filter((m) => m.category === cat)
            if (!catMedals.length) return null
            const catInfo = CATEGORY_LABELS[cat]
            const earnedInCat = catMedals.filter(m => !m.locked).length
            return (
              <div key={cat} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>{catInfo.emoji}</span>
                    <span>{catInfo.label}</span>
                  </h4>
                  <span className="text-[10px] text-zinc-300 font-medium">{earnedInCat}/{catMedals.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {catMedals.map((medal) => {
                    const s = RARITY_STYLES[medal.rarity]
                    return (
                      <div
                        key={medal.id}
                        className={`relative rounded-2xl border p-4 transition-all ${
                          !medal.locked
                            ? `${s.bg} ${s.border} ${s.glow}`
                            : "bg-zinc-50 border-zinc-100 opacity-40 grayscale"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-3xl">{medal.emoji}</div>
                          <div className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            !medal.locked ? `${s.bg} ${s.text} border ${s.border}` : "bg-zinc-100 text-zinc-300"
                          }`}>
                            {s.label}
                          </div>
                        </div>
                        <div className={`text-xs font-bold mb-0.5 ${!medal.locked ? s.text : "text-zinc-400"}`}>
                          {medal.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 leading-snug">{medal.description}</div>
                        {!medal.locked && medal.earnedAt && (
                          <div className="text-[10px] text-zinc-300 mt-1.5">
                            Earned {new Date(medal.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
