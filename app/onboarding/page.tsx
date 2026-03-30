"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Sneaker,
  BookOpen,
  PencilSimple,
  Leaf,
  ForkKnife,
  GraduationCap,
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
  CheckCircle,
  Users,
} from "@phosphor-icons/react"
import { useUserProfile } from "@/app/context/user-profile"
import type { PodCategory } from "@/lib/data"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

const CATEGORY_OPTIONS: { value: PodCategory; label: string; icon: React.ElementType }[] = [
  { value: "running",     label: "Running",     icon: Sneaker },
  { value: "cycling",     label: "Cycling",     icon: Bicycle },
  { value: "swimming",    label: "Swimming",    icon: Drop },
  { value: "yoga",        label: "Yoga",        icon: Leaf },
  { value: "strength",    label: "Strength",    icon: Barbell },
  { value: "hiking",      label: "Hiking",      icon: Mountains },
  { value: "reading",     label: "Reading",     icon: BookOpen },
  { value: "writing",     label: "Writing",     icon: PencilSimple },
  { value: "journaling",  label: "Journaling",  icon: NotePencil },
  { value: "meditation",  label: "Meditation",  icon: Leaf },
  { value: "cooking",     label: "Cooking",     icon: ForkKnife },
  { value: "learning",    label: "Learning",    icon: GraduationCap },
  { value: "music",       label: "Music",       icon: MusicNote },
  { value: "art",         label: "Art",         icon: PaintBrush },
  { value: "photography", label: "Photography", icon: Camera },
  { value: "finance",     label: "Finance",     icon: CurrencyDollar },
  { value: "other",       label: "Other",       icon: Tag },
]

const TOTAL_STEPS = 2

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useSession()
  const { profile, loading: profileLoading, updateProfile } = useUserProfile()

  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [interests, setInterests] = useState<PodCategory[]>([])
  const [suggestedPods, setSuggestedPods] = useState<any[]>([])
  const [joinedPodIds, setJoinedPodIds] = useState<Set<string>>(new Set())
  const [joiningId, setJoiningId] = useState<string | null>(null)

  // Sync name from profile
  useEffect(() => {
    if (profile) {
      setName((prev) => prev || (profile.displayName === "User" ? "" : profile.displayName))
    }
  }, [profile])

  // Fetch suggested pods when interests change
  useEffect(() => {
    if (!interests.length || !user) return
    const fetchPods = async () => {
      const supabase = createClient()
      const { data: pods } = await supabase
        .from("pods")
        .select("id, name, description, category, cadence, member_count, visibility")
        .in("category", interests)
        .eq("visibility", "public")
        .order("member_count", { ascending: false })
        .limit(6)
      if (pods) setSuggestedPods(pods)
    }
    fetchPods()
  }, [interests, user])

  const toggleInterest = (cat: PodCategory) =>
    setInterests((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])

  const handleStep1Next = async () => {
    await updateProfile({
      displayName: name.trim() || "Friend",
      interests,
    })
    setStep(2)
  }

  const handleJoinPod = async (podId: string) => {
    if (!user) return
    setJoiningId(podId)
    try {
      const supabase = createClient()
      await supabase.from("pod_members").insert({ pod_id: podId, user_id: user.id })
      setJoinedPodIds((prev) => new Set([...prev, podId]))
    } catch (err) {
      console.error("Failed to join pod:", err)
    } finally {
      setJoiningId(null)
    }
  }

  const handleFinish = async () => {
    await updateProfile({
      interests,
      onboardingComplete: true,
    })
    router.push("/dashboard")
  }

  if (profileLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#ede9df] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#ede9df] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.svg" alt="Common" className="w-6 h-6" />
          <span className="text-[15px] font-bold text-zinc-900 tracking-tight">Common</span>
        </div>

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
            {step === 1 ? "About you" : "Join a pod"}
          </span>
          <span className="text-[11px] font-semibold text-zinc-300">{step} / {TOTAL_STEPS}</span>
        </div>
        <div className="flex gap-1 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i < step ? "bg-zinc-900" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Name + Interests */}
        {step === 1 && (
          <div>
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              What are you<br />working on?
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              Tell us your name and pick the activities you want to stay accountable for.
            </p>

            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-zinc-600 mb-2">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                autoFocus
                className="w-full bg-white border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-2xl px-5 py-4 text-lg text-zinc-900 placeholder:text-zinc-300 outline-none transition-all font-semibold"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-3">Pick your activities</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const selected = interests.includes(value)
                  return (
                    <button
                      key={value}
                      onClick={() => toggleInterest(value)}
                      className={`flex flex-col items-center gap-2 px-2 py-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97] ${
                        selected
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <Icon size={20} weight={selected ? "fill" : "regular"} />
                      <span className="text-xs leading-none text-center">{label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-zinc-300 mt-3 text-center">Pick at least one to continue</p>
            </div>

            {/* Next button */}
            <button
              onClick={handleStep1Next}
              disabled={!name.trim() || interests.length === 0}
              className="w-full mt-8 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[15px] py-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
            >
              Continue
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        )}

        {/* Step 2 — Pod Suggestions */}
        {step === 2 && (
          <div>
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              Join a pod
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              Here are pods that match your interests. Join one to start checking in.
            </p>

            {suggestedPods.length > 0 ? (
              <div className="space-y-3 mb-8">
                {suggestedPods.map((pod) => {
                  const isJoined = joinedPodIds.has(pod.id)
                  const isJoining = joiningId === pod.id
                  return (
                    <div
                      key={pod.id}
                      className={`bg-white border rounded-2xl p-4 transition-all duration-200 ${
                        isJoined ? "border-emerald-200 bg-emerald-50/50" : "border-zinc-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {pod.name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-zinc-900 truncate">{pod.name}</div>
                            <div className="text-xs text-zinc-400">
                              {pod.member_count || 0} members · {pod.category}
                            </div>
                          </div>
                        </div>
                        {isJoined ? (
                          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 rounded-full px-3 py-1.5">
                            <CheckCircle size={13} weight="fill" />
                            Joined
                          </div>
                        ) : (
                          <button
                            onClick={() => handleJoinPod(pod.id)}
                            disabled={isJoining}
                            className="flex items-center gap-1 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            {isJoining ? (
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Users size={12} weight="fill" />
                                Join
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {pod.description && (
                        <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">{pod.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white border border-zinc-100 rounded-2xl p-8 text-center mb-8">
                <p className="text-sm text-zinc-400">No pods found for your interests yet. You can explore and create one after setup.</p>
              </div>
            )}

            {/* Finish button */}
            <button
              onClick={handleFinish}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-[15px] py-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
            >
              {joinedPodIds.size > 0 ? "Let's go" : "Skip for now"}
              <ArrowRight size={16} weight="bold" />
            </button>
            <p className="text-xs text-zinc-400 text-center mt-3">
              You can always join more pods later
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
