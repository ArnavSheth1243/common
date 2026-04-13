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
      } else {
        // Solo check-in: save directly to DB with no pod
        const supabase = createClient()
        await supabase
          .from("checkins")
          .insert([{
            user_id: user!.id,
            pod_id: null,
            content: text.trim(),
            visibility,
            streak_count: currentStreak + 1,
            image_url: photoPreview || null,
          }])
      }
      recordCheckin(selectedPod || "solo")
      setSubmitted(true)
    } catch (error) {
      console.error("Failed to post check-in:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen pb-32 lg:pb-0 flex flex-col items-center justify-center px-5 text-center">
        <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={36} weight="fill" className="text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Checked in</h1>
        <p className="text-zinc-500 text-[15px] leading-relaxed max-w-[34ch] mb-2">
          {selectedPodData
            ? <>Your update is live in{" "}<span className="font-semibold text-foreground">{selectedPodData.name}</span>.</>
            : "Your update is live on the feed."}
        </p>
        <p className="text-xs text-zinc-400 mb-8">
          {visibility === "public" && "Visible to everyone on the public feed"}
          {visibility === "pod" && "Visible to your pod members only"}
          {visibility === "private" && "Only visible to you"}
        </p>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-3 mb-8">
          <Flame size={18} weight="fill" className="text-blue-500" />
          <span className="text-sm font-bold text-blue-800">
            {currentStreak} check-ins
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 bg-foreground hover:opacity-90 text-white text-sm font-semibold px-5 py-3 rounded-full transition-all duration-200"
          >
            See the feed
          </button>
          <button
            onClick={() => {
              setSubmitted(false)
              setText("")
            }}
            className="text-sm font-medium text-zinc-500 hover:text-foreground px-5 py-3 rounded-full transition-colors"
          >
            Check into another pod
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
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1">New check-in</h1>
        <p className="text-sm text-zinc-500">
          Share what you did{cadenceVerb ? ` ${cadenceVerb}` : ""}. Your pod wants to hear about it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pod selector */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Which pod?</label>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {allMyPods.map((pod) => (
              <button
                key={pod.id}
                type="button"
                onClick={() => setSelectedPod(pod.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                  selectedPod === pod.id
                    ? "border-foreground bg-foreground text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-white text-[9px] font-bold"
                >
                  {pod.name[0]}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold leading-none truncate max-w-[120px]">
                    {pod.name}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      selectedPod === pod.id ? "text-zinc-400" : "text-zinc-400"
                    }`}
                  >
                    {CADENCE_LABELS[pod.cadence]}
                  </div>
                </div>
              </button>
            ))}
            {/* Solo */}
            <button
              type="button"
              onClick={() => setSelectedPod("solo")}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                selectedPod === "solo"
                  ? "border-foreground bg-foreground text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-zinc-300 flex items-center justify-center text-white text-[9px] font-bold">
                ✦
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold leading-none">Just me</div>
                <div className={`text-[10px] mt-0.5 ${selectedPod === "solo" ? "text-zinc-400" : "text-zinc-400"}`}>
                  No pod
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Text input */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            What have you been up to?
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxLength))}
              placeholder={selectedPod === "solo" ? "What did you work on today?" : `Share something with your ${cadenceLabel.toLowerCase()} pod.`}
              rows={5}
              className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-zinc-400 outline-none transition-all resize-none leading-relaxed"
            />
            <span
              className={`absolute bottom-3 right-4 text-xs font-medium tabular-nums ${
                remaining < 30
                  ? remaining < 10
                    ? "text-rose-400"
                    : "text-rose-400"
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
              className="flex items-center gap-2.5 w-full bg-zinc-50 border-2 border-dashed border-zinc-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-400 hover:text-blue-700 transition-all duration-200 group"
            >
              <Camera
                size={18}
                className="text-zinc-300 group-hover:text-blue-500 transition-colors"
              />
              Add a photo (optional)
            </button>
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Who can see this?</label>
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
                    ? "border-foreground bg-foreground text-white"
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
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[15px] py-4 rounded-full transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(29,78,216,0.4)] active:scale-[0.97]"
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
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CheckinForm />
    </Suspense>
  )
}
