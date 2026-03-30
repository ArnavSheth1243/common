"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Camera, Flame, CheckCircle, Globe, Users, Lock } from "@phosphor-icons/react"
import { CADENCE_LABELS, CADENCE_VERB, type Pod } from "@/lib/data"
import { useUserStats } from "@/app/context/user-stats"
import { usePodState } from "@/app/context/pod-state"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

function CheckinForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { recordCheckin, currentStreak } = useUserStats()
  const { postCheckin } = usePodState()
  const { user } = useSession()
  const preselected = searchParams.get("pod")
  const [allMyPods, setAllMyPods] = useState<Pod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchPods = async () => {
      const supabase = createClient()
      const { data: memberPods, error } = await supabase
        .from("pod_members")
        .select("pod_id, pods(id, name, cadence, member_count, streak, visibility)")
        .eq("user_id", user.id)

      if (!error && memberPods) {
        const pods: Pod[] = memberPods
          .filter((m: any) => m.pods)
          .map((m: any) => ({
            id: m.pods.id,
            name: m.pods.name,
            cadence: m.pods.cadence as any,
            members: m.pods.member_count,
            streak: m.pods.streak,
            visibility: m.pods.visibility,
            memberColors: ["bg-zinc-900"],
            type: "Habit" as const,
            category: "other" as const,
            description: "",
            maxMembers: null,
            createdAt: "",
            location: "",
            podMembers: [],
            recentCheckins: [],
            podId: m.pods.id,
          }))
        setAllMyPods(pods)
      }
      setLoading(false)
    }
    fetchPods()
  }, [user])

  const [selectedPod, setSelectedPod] = useState<string>(preselected || "")

  // Once pods load, auto-select first pod if nothing selected
  useEffect(() => {
    if (!selectedPod && allMyPods.length > 0) {
      setSelectedPod(preselected && allMyPods.find((p) => p.id === preselected) ? preselected : allMyPods[0].id)
    }
  }, [allMyPods, preselected, selectedPod])
  const [text, setText] = useState("")
  const [visibility, setVisibility] = useState<"public" | "pod" | "private">("pod")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const selectedPodData = allMyPods.find((p) => p.id === selectedPod)
  const maxLength = 300
  const remaining = maxLength - text.length
  const cadenceLabel = selectedPodData ? CADENCE_LABELS[selectedPodData.cadence] : ""
  const cadenceVerb = selectedPodData ? CADENCE_VERB[selectedPodData.cadence] : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      if (selectedPod && selectedPod !== "solo") {
        await postCheckin({
          podId: selectedPod,
          content: text.trim(),
          visibility,
          streakCount: currentStreak + 1,
          ...(photoPreview ? { photo: photoPreview } : {}),
        })
      }
      setSubmitted(true)
    } catch (error) {
      console.error("Failed to post check-in:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    const newStreak = currentStreak + 1
    return (
      <div className="min-h-screen pb-32 lg:pb-0 flex flex-col items-center justify-center px-5 text-center">
        {/* Streak celebration */}
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-[scale-in_0.5s_ease-out]">
            <div className="text-center">
              <Flame size={24} weight="fill" className="text-white mx-auto mb-1" />
              <span className="text-3xl font-bold text-white tracking-tight tabular-nums">{newStreak}</span>
            </div>
          </div>
          {/* Decorative ring */}
          <div className="absolute inset-0 w-28 h-28 rounded-full border-2 border-amber-300/30 animate-ping" style={{ animationDuration: "1.5s", animationIterationCount: "2" }} />
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
          Day {newStreak}. Your pod can see this.
        </h1>
        <p className="text-zinc-500 text-[15px] leading-relaxed max-w-[34ch] mb-2">
          {selectedPodData
            ? <>Checked in to{" "}<span className="font-semibold text-zinc-700">{selectedPodData.name}</span>.</>
            : "Your update is live."}
        </p>
        {newStreak >= 7 && (
          <p className="text-sm font-semibold text-amber-600 mb-6">
            {newStreak >= 30 ? "Legendary consistency. Don't stop now." : newStreak >= 14 ? "You're building real momentum." : "One week strong. Keep going."}
          </p>
        )}
        {newStreak < 7 && <div className="mb-6" />}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-6 py-3 rounded-2xl transition-all duration-200"
          >
            Back to dashboard
          </button>
          <button
            onClick={() => {
              setSubmitted(false)
              setText("")
            }}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 px-5 py-3 transition-colors"
          >
            Check in to another pod
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-1">New check-in</h1>
        <p className="text-sm text-zinc-500">
          What did you do today? Even a one-word check-in counts. The point is showing up.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pod selector */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">Which pod?</label>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {allMyPods.map((pod) => (
              <button
                key={pod.id}
                type="button"
                onClick={() => setSelectedPod(pod.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                  selectedPod === pod.id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg ${pod.memberColors[0]} flex items-center justify-center text-white text-[9px] font-bold`}
                >
                  {pod.name[0]}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold leading-none truncate max-w-[120px]">
                    {pod.name}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      selectedPod === pod.id ? "text-zinc-300" : "text-zinc-400"
                    }`}
                  >
                    {CADENCE_LABELS[pod.cadence]}
                  </div>
                </div>
              </button>
            ))}
            {/* Solo / no pod option */}
            <button
              type="button"
              onClick={() => setSelectedPod("solo")}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                selectedPod === "solo"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              <div className="w-5 h-5 rounded-lg bg-zinc-400 flex items-center justify-center text-white text-[9px] font-bold">
                ✦
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold leading-none">Just me</div>
                <div className={`text-[10px] mt-0.5 ${selectedPod === "solo" ? "text-zinc-300" : "text-zinc-400"}`}>
                  No pod
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Text input */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">
            How&apos;s progress going?
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxLength))}
              placeholder={selectedPod === "solo" ? "What did you work on today?" : `Share something with your ${cadenceLabel.toLowerCase()} pod — keep it real.`}
              rows={5}
              className="w-full bg-white border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-all resize-none leading-relaxed"
            />
            <span
              className={`absolute bottom-3 right-4 text-xs font-medium tabular-nums ${
                remaining < 30
                  ? remaining < 10
                    ? "text-rose-400"
                    : "text-amber-400"
                  : "text-zinc-300"
              }`}
            >
              {remaining}
            </span>
          </div>
        </div>

        {/* Photo */}
        <div>
          <input
            type="file"
            accept="image/*"
            ref={photoRef}
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Preview" className="w-full max-h-56 object-cover" />
              <button
                type="button"
                onClick={() => { setPhotoPreview(null); if (photoRef.current) photoRef.current.value = "" }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <span className="text-xs font-bold leading-none">✕</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="flex items-center gap-2.5 w-full bg-zinc-50 border-2 border-dashed border-zinc-200 hover:border-amber-300 hover:bg-amber-50/30 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-400 hover:text-amber-600 transition-all duration-200 group"
            >
              <Camera
                size={18}
                className="text-zinc-300 group-hover:text-amber-500 transition-colors"
              />
              Add a photo (optional)
            </button>
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Who can see this?</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "public", label: "Public feed", sub: "Everyone", icon: Globe },
              { value: "pod", label: "Pod only", sub: "Your members", icon: Users },
              { value: "private", label: "Private", sub: "Only you", icon: Lock },
            ] as const).map(({ value, label, sub, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border-2 text-center transition-all duration-200 ${
                  visibility === value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <Icon
                  size={18}
                  weight={visibility === value ? "fill" : "regular"}
                />
                <span className="text-xs font-semibold leading-none">{label}</span>
                <span className={`text-[10px] leading-none ${visibility === value ? "text-zinc-400" : "text-zinc-400"}`}>
                  {sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[15px] py-4 rounded-2xl transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)] active:scale-[0.98]"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} weight="fill" />
                Post check-in
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CheckinForm />
    </Suspense>
  )
}
