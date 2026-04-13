"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Globe, Lock, MapPin, ImageSquare, UploadSimple, X } from "@phosphor-icons/react"
import type { PodCadence, PodCategory, PodType } from "@/lib/data"
import { usePodState } from "@/app/context/pod-state"
import { useUserProfile } from "@/app/context/user-profile"

const CATEGORIES: { value: PodCategory; label: string }[] = [
  { value: "running",     label: "Running" },
  { value: "cycling",     label: "Cycling" },
  { value: "swimming",    label: "Swimming" },
  { value: "yoga",        label: "Yoga" },
  { value: "strength",    label: "Strength" },
  { value: "hiking",      label: "Hiking" },
  { value: "reading",     label: "Reading" },
  { value: "writing",     label: "Writing" },
  { value: "journaling",  label: "Journaling" },
  { value: "meditation",  label: "Meditation" },
  { value: "cooking",     label: "Cooking" },
  { value: "learning",    label: "Learning" },
  { value: "music",       label: "Music" },
  { value: "art",         label: "Art" },
  { value: "photography", label: "Photography" },
  { value: "finance",     label: "Finance" },
  { value: "other",       label: "Other" },
]

const CADENCES: { value: PodCadence; label: string }[] = [
  { value: "daily",    label: "Daily" },
  { value: "3x_week", label: "3× a week" },
  { value: "weekly",   label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "other",    label: "Custom" },
]

const MEMBER_COLORS = [
  "bg-rose-500","bg-blue-500","bg-emerald-500","bg-sky-500",
  "bg-blue-500","bg-blue-500","bg-teal-500","bg-teal-500",
  "bg-blue-600","bg-indigo-500","bg-zinc-900",
]

export default function NewPodPage() {
  const router = useRouter()
  const { createPod } = usePodState()
  const { profile } = useUserProfile()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<PodCategory>("running")
  const [cadence, setCadence] = useState<PodCadence>("daily")
  const [customCadence, setCustomCadence] = useState("")
  const [type, setType] = useState<PodType>("Habit")
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [location, setLocation] = useState("")
  const [maxMembers, setMaxMembers] = useState<string>("8")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return // 5MB limit
    const reader = new FileReader()
    reader.onload = () => setImageUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setSubmitting(true)

    const color = MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)]
    const displayName = profile?.displayName || "User"
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)

    try {
      await createPod({
        id: "",
        podId: "",
        name: name.trim(),
        description: description.trim() || "A new pod.",
        category,
        cadence,
        type,
        visibility,
        location: location.trim() || "",
        members: 1,
        maxMembers: maxMembers === "unlimited" ? null : parseInt(maxMembers) || 8,
        streak: 0,
        memberColors: [color],
        createdAt: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        createdByYou: true,
        imageUrl: imageUrl || undefined,
        podMembers: [
          { name: displayName, initials, color: `${color} text-white`, streak: 0, isYou: true },
        ],
        recentCheckins: [],
      })
      router.push("/pods")
    } catch (err) {
      console.error("Failed to create pod:", err)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8">
      <Link
        href="/pods"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        All pods
      </Link>

      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-zinc-900 tracking-tighter leading-none mb-2">Create a pod</h1>
        <p className="text-sm text-zinc-500">Start something with a small group of people.</p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Pod name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning Run Club"
            maxLength={60}
            className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 300))}
            placeholder="What's this pod about? What do members commit to?"
            rows={3}
            className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all resize-none"
          />
          <div className="text-right text-xs text-zinc-300 mt-1">{description.length}/300</div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                  category === c.value
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
            <ImageSquare size={14} />
            Cover image (optional)
          </label>
          <p className="text-xs text-zinc-400 mb-3">Upload a cover image for your pod. Max 5MB.</p>
          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[3/1] border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Pod cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={14} weight="bold" className="text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 w-full aspect-[3/1] border-2 border-dashed border-zinc-200 hover:border-blue-500 rounded-2xl cursor-pointer transition-all hover:bg-blue-50/30">
              <UploadSimple size={24} className="text-zinc-400" />
              <span className="text-sm font-medium text-zinc-400">Click to upload</span>
              <span className="text-[11px] text-zinc-300">JPG, PNG, or WebP</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">Pod type</label>
          <div className="grid grid-cols-2 gap-3">
            {(["Habit", "Explore"] as PodType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
                  type === t ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <span className="text-sm font-bold text-zinc-900 mb-0.5">{t}</span>
                <span className="text-xs text-zinc-400 leading-snug">
                  {t === "Habit" ? "Regular check-ins, consistent habit building" : "Explore interests, share discoveries"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cadence */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">Check-in frequency</label>
          <div className="flex flex-wrap gap-2">
            {CADENCES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCadence(c.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  cadence === c.value
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {cadence === "other" && (
            <input
              type="text"
              value={customCadence}
              onChange={(e) => setCustomCadence(e.target.value)}
              placeholder="e.g. Every Monday and Thursday"
              className="w-full mt-3 bg-white border border-zinc-200 focus:border-primary focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
            />
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
            <MapPin size={13} />Location (optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Prospect Park, Brooklyn or Remote"
            className="w-full bg-white border border-zinc-200 focus:border-primary focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
          />
        </div>

        {/* Max members */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">Max members</label>
          <div className="flex gap-2 flex-wrap">
            {["4","6","8","10","15","20","unlimited"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMaxMembers(v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  maxMembers === v
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                {v === "unlimited" ? "No limit" : v}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">Who can join?</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "public",  Icon: Globe, label: "Public",  sub: "Anyone can join directly" },
              { value: "private", Icon: Lock,  label: "Private", sub: "Members must apply — you approve" },
            ] as const).map(({ value, Icon, label, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all ${
                  visibility === value ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <Icon size={16} weight={visibility === value ? "fill" : "regular"} className="text-zinc-700" />
                <div>
                  <div className="text-sm font-bold text-zinc-900">{label}</div>
                  <div className="text-xs text-zinc-400 mt-0.5 leading-snug">{sub}</div>
                </div>
              </button>
            ))}
          </div>
          {visibility === "private" && (
            <p className="text-xs text-zinc-400 mt-2 bg-zinc-50 rounded-xl px-3 py-2">
              🔒 Non-members will see this pod&apos;s name but members and posts will be hidden until approved.
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[15px] py-4 rounded-2xl transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)] active:scale-[0.98]"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} weight="fill" />
                Create pod
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
