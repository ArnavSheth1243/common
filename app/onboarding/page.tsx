"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowLeft,
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
  Sun,
  Clock,
  Moon,
  Flame,
  Users,
  Trophy,
  CalendarBlank,
  Compass,
  MapPin,
  Target,
  HandHeart,
  Sparkle,
  PersonSimpleRun,
  Brain,
  Star,
  Bell,
  BellRinging,
  ChatCircle,
} from "@phosphor-icons/react"
import { useUserProfile } from "@/app/context/user-profile"
import type { PodCategory } from "@/lib/data"
import Link from "next/link"
import { useSession } from "@/app/context/session"
import { createClient } from "@/lib/supabase/client"

// ─── Data ─────────────────────────────────────────────────────────────────────

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

const GOAL_OPTIONS = [
  { value: "consistency",  label: "Build consistency",    icon: Flame },
  { value: "accountability", label: "Stay accountable",   icon: HandHeart },
  { value: "new_things",   label: "Try new things",       icon: Sparkle },
  { value: "fitness",      label: "Hit a fitness goal",   icon: PersonSimpleRun },
  { value: "learn",        label: "Learn something new",  icon: Brain },
  { value: "community",    label: "Find my people",       icon: Users },
  { value: "track",        label: "Track my progress",    icon: Target },
  { value: "compete",      label: "Friendly competition", icon: Trophy },
]

const COMMITMENT_OPTIONS = [
  { value: "daily",      label: "Every day",          sub: "Full send" },
  { value: "few_times",  label: "A few times a week", sub: "Steady pace" },
  { value: "weekly",     label: "Once a week",        sub: "Consistent rhythm" },
  { value: "whenever",   label: "When I can",         sub: "No pressure" },
] as const

const TIME_OPTIONS = [
  { value: "morning",   label: "Morning",   icon: Sun },
  { value: "afternoon", label: "Afternoon", icon: Clock },
  { value: "evening",   label: "Evening",   icon: Moon },
] as const

// ─── Feature tour cards ───────────────────────────────────────────────────────

const TOUR_FEATURES = [
  {
    key: "checkin",
    icon: Flame,
    color: "bg-violet-500",
    label: "Daily check-ins",
    sub: "Post what you did. Build a streak. Keep the momentum going.",
    preview: (
      <div className="mt-3 bg-white/10 rounded-xl p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold text-white">AS</div>
          <div className="flex-1 h-2 bg-white/20 rounded-full" />
          <div className="text-[10px] text-white/60 font-bold flex items-center gap-0.5"><Flame size={9} weight="fill" /> 12</div>
        </div>
        <div className="h-2 bg-white/15 rounded-full w-4/5" />
        <div className="h-2 bg-white/10 rounded-full w-3/5" />
      </div>
    ),
  },
  {
    key: "pods",
    icon: Users,
    color: "bg-violet-500",
    label: "Pods",
    sub: "Small groups working toward the same goal. Join one or start your own.",
    preview: (
      <div className="mt-3 bg-white/10 rounded-xl p-3 space-y-1.5">
        {[
          { color: "bg-rose-400", name: "Morning Run Club", members: "6 members" },
          { color: "bg-emerald-400", name: "Home Cooking Club", members: "4 members" },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-lg ${p.color} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-white truncate">{p.name}</div>
              <div className="text-[9px] text-white/50">{p.members}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "challenges",
    icon: Trophy,
    color: "bg-sky-500",
    label: "Challenges",
    sub: "Compete as a pod. Miles run, books read, reps logged. See who shows up.",
    preview: (
      <div className="mt-3 bg-white/10 rounded-xl p-3">
        <div className="text-[10px] text-white/60 mb-2 font-semibold uppercase tracking-wide">Pod Miles Race</div>
        <div className="space-y-1.5">
          {[
            { name: "Priya K.", pct: 78 },
            { name: "Marcus R.", pct: 54 },
            { name: "You", pct: 41 },
          ].map((r) => (
            <div key={r.name} className="flex items-center gap-2">
              <div className="text-[10px] text-white/70 w-14 truncate">{r.name}</div>
              <div className="flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 rounded-full" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "calendar",
    icon: CalendarBlank,
    color: "bg-teal-500",
    label: "Calendar",
    sub: "All your pod events in one place. Export to iPhone with one tap.",
    preview: (
      <div className="mt-3 bg-white/10 rounded-xl p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
            <div key={d} className="text-[8px] text-white/40 text-center font-bold">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => (
            <div key={i} className={`h-4 rounded-sm text-center text-[8px] leading-4 font-semibold
              ${i === 7 ? "bg-violet-400 text-white" :
                [3,11,18,22].includes(i) ? "bg-white/25 text-white" :
                "text-white/30"}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

const REFERRAL_OPTIONS = [
  { value: "friend", label: "A friend told me" },
  { value: "social_media", label: "Social media" },
  { value: "search", label: "Google / search" },
  { value: "app_store", label: "App store" },
  { value: "school", label: "School / university" },
  { value: "other", label: "Other" },
]

const REMINDER_TIMING_OPTIONS = [
  { value: "day_before",   label: "Day before" },
  { value: "morning_of",   label: "Morning of" },
  { value: "1_hour_before", label: "1 hour before" },
] as const

const TOTAL_STEPS = 10

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useSession()
  const { profile, loading: profileLoading, updateProfile } = useUserProfile()

  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [age, setAge] = useState<string>("")
  const [location, setLocation] = useState("")
  const [referralSource, setReferralSource] = useState("")

  // Sync form state once profile loads
  useEffect(() => {
    if (profile) {
      setName(prev => prev || (profile.displayName === "User" ? "" : profile.displayName))
      setAge(prev => prev || (profile.age ? String(profile.age) : ""))
      setLocation(prev => prev || (profile.location ?? ""))
    }
  }, [profile])
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? [])
  const [interests, setInterests] = useState<PodCategory[]>(profile?.interests ?? [])
  const [commitment, setCommitment] = useState(profile?.commitment ?? "daily")
  const [timePreference, setTimePreference] = useState(profile?.timePreference ?? "morning")
  const [activeTourCard, setActiveTourCard] = useState(0)
  const [suggestedPods, setSuggestedPods] = useState<any[]>([])
  const [igHandle, setIgHandle] = useState("")
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifPodReminders, setNotifPodReminders] = useState(true)
  const [reminderTiming, setReminderTiming] = useState("day_before")

  // Fetch suggested pods based on interests
  useEffect(() => {
    if (!interests.length || !user) return
    const fetchSuggestedPods = async () => {
      const supabase = createClient()
      const { data: pods } = await supabase
        .from("pods")
        .select("*")
        .in("category", interests)
        .limit(3)
      if (pods) {
        setSuggestedPods(pods.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          visibility: p.visibility,
          memberColors: ["bg-zinc-900"],
        })))
      }
    }
    fetchSuggestedPods()
  }, [interests, user])

  const toggleGoal = (v: string) =>
    setGoals((prev) => prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v])

  const toggleInterest = (cat: PodCategory) =>
    setInterests((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])

  const handleNext = () => {
    if (step === 1) updateProfile({ displayName: name.trim() || "Friend" })
    if (step === 2) updateProfile({ age: age ? parseInt(age) : undefined, location: location.trim(), referralSource })
    if (step === 3) updateProfile({ goals })
    if (step === 4) updateProfile({ interests })
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const handleFinish = async () => {
    await updateProfile({
      interests,
      commitment,
      timePreference,
      goals,
      onboardingComplete: true,
      ...(igHandle ? { instagramHandle: igHandle } : {}),
    })
    router.push("/dashboard")
  }

  const handleSkip = async () => {
    await updateProfile({ onboardingComplete: true })
    router.push("/dashboard")
  }

  const canNext =
    step === 1 ? name.trim().length > 0 :
    step === 3 ? goals.length > 0 :
    step === 4 ? interests.length > 0 :
    true

  const stepLabel = ["", "Who are you?", "A bit about you", "Goals", "Interests", "How you show up", "The app", "Pod suggestions", "Almost done", "Notifications", "You're all set"][step] ?? ""

  if (profileLoading) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg">

        {/* Logo + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Common" className="w-6 h-6" />
            <span className="text-[15px] font-bold text-zinc-900 tracking-tight">Common</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{stepLabel}</span>
          <span className="text-[11px] font-semibold text-zinc-300">{step} / {TOTAL_STEPS}</span>
        </div>
        <div className="flex gap-1 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i < step ? "bg-gradient-to-r from-violet-500 to-pink-500" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>

        {/* ── Step 1 — Name ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              What should<br />we call you?
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              This is how people in your pods will know you.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="w-full bg-white border border-zinc-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl px-5 py-4 text-xl text-zinc-900 placeholder:text-zinc-300 outline-none transition-all font-semibold"
            />
          </div>
        )}

        {/* ── Step 2 — Age + Location ───────────────────────────────────────── */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              A little bit<br />about you
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              Helps us match you with the right pods and people.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-2">How old are you?</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 26"
                  min={13}
                  max={100}
                  className="w-full bg-white border border-zinc-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl px-5 py-4 text-lg text-zinc-900 placeholder:text-zinc-300 outline-none transition-all font-semibold"
                />
                <p className="text-xs text-zinc-300 mt-1.5 ml-1">Optional — we keep this private.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-2 flex items-center gap-1.5">
                  <MapPin size={13} weight="fill" className="text-zinc-400" />
                  Where are you based?
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Brooklyn, NY or Remote"
                  className="w-full bg-white border border-zinc-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl px-5 py-4 text-base text-zinc-900 placeholder:text-zinc-300 outline-none transition-all"
                />
                <p className="text-xs text-zinc-300 mt-1.5 ml-1">Optional — helps with in-person pods.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-2">How did you hear about Common?</label>
                <div className="flex flex-wrap gap-2">
                  {REFERRAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setReferralSource(opt.value)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all duration-150 ${
                        referralSource === opt.value
                          ? "bg-zinc-900 border-zinc-900 text-white"
                          : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-300 mt-1.5 ml-1">Optional — helps us grow.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3 — Welcome callout (transition slide) ────────────────────── */}
        {step === 3 && (
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-sm font-semibold px-4 py-2 rounded-full">
              <Star size={14} weight="fill" className="text-violet-500" />
              Hey, {name.split(" ")[0] || "friend"} 👋
            </div>
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-4">
              What are you<br />here for?
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              Pick as many as you want. We&apos;ll shape Common around your goals.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {GOAL_OPTIONS.map(({ value, label, icon: Icon }) => {
                const selected = goals.includes(value)
                return (
                  <button
                    key={value}
                    onClick={() => toggleGoal(value)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97] text-left ${
                      selected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    <Icon size={18} weight={selected ? "fill" : "regular"} className={selected ? "text-white/80" : "text-zinc-400"} />
                    <span className="leading-snug">{label}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-zinc-300 mt-4 text-center">Pick at least one to continue</p>
          </div>
        )}

        {/* ── Step 4 — Interests ────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="animate-fade-up">
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              What are<br />you into?
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              We&apos;ll find pods that match. Pick everything that fits.
            </p>
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
          </div>
        )}

        {/* ── Step 5 — Commitment ───────────────────────────────────────────── */}
        {step === 5 && (
          <div className="animate-fade-up">
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              How often<br />can you show up?
            </h1>
            <p className="text-zinc-400 mb-6 text-[15px]">
              Be honest — consistency beats intensity.
            </p>
            <div className="space-y-2.5 mb-8">
              {COMMITMENT_OPTIONS.map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() => setCommitment(value)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 active:scale-[0.98] ${
                    commitment === value
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <span className="font-semibold">{label}</span>
                  <span className={`text-sm ${commitment === value ? "text-zinc-400" : "text-zinc-400"}`}>{sub}</span>
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold text-zinc-500 mb-3">Preferred time of day</p>
            <div className="grid grid-cols-3 gap-2">
              {TIME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTimePreference(value)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-150 ${
                    timePreference === value
                      ? "border-violet-400 bg-violet-50 text-violet-700"
                      : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  <Icon size={20} weight="duotone" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 6 — App tour ─────────────────────────────────────────────── */}
        {step === 6 && (
          <div className="animate-fade-up">
            <div className="mb-2 inline-flex items-center gap-2 bg-foreground text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <Compass size={12} weight="fill" /> Quick tour
            </div>
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2 mt-3">
              Here&apos;s how<br />Common works
            </h1>
            <p className="text-zinc-400 mb-6 text-[15px]">
              Four things. That&apos;s it. Tap each to see more.
            </p>

            {/* Tour cards — big tappable tiles */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {TOUR_FEATURES.map((f, i) => {
                const Icon = f.icon
                const isActive = activeTourCard === i
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveTourCard(i)}
                    className={`rounded-3xl p-4 text-left transition-all duration-200 active:scale-[0.97] ${
                      isActive
                        ? `${f.color} shadow-lg scale-[1.02]`
                        : "bg-white border border-zinc-100 hover:border-zinc-200 shadow-softer"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                      isActive ? "bg-white/20" : `${f.color}`
                    }`}>
                      <Icon size={16} weight="fill" className={isActive ? "text-white" : "text-white"} />
                    </div>
                    <p className={`text-sm font-bold leading-tight ${isActive ? "text-white" : "text-zinc-900"}`}>
                      {f.label}
                    </p>
                    {isActive && (
                      <>
                        <p className="text-xs text-white/70 mt-1 leading-snug">{f.sub}</p>
                        {f.preview}
                      </>
                    )}
                    {!isActive && (
                      <p className="text-xs text-zinc-400 mt-0.5 leading-snug line-clamp-2">{f.sub}</p>
                    )}
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-zinc-400 text-center">
              Tap a card to explore · You can always dig in after setup
            </p>
          </div>
        )}

        {/* ── Step 7 — Pod suggestions ──────────────────────────────────────── */}
        {step === 7 && profile && (
          <div className="animate-fade-up">
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              Pods made<br />for you
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              Based on your interests. Join one now or explore after setup.
            </p>
            {suggestedPods.length > 0 ? (
              <div className="space-y-3 mb-6">
                {suggestedPods.map((pod) => (
                  <div
                    key={pod.id}
                    className="bg-white border border-zinc-100 rounded-3xl p-4 flex items-center gap-4 shadow-softer"
                  >
                    <div className={`w-10 h-10 rounded-2xl ${pod.memberColors[0]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {pod.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-zinc-900">{pod.name}</span>
                        {pod.visibility === "private" && (
                          <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">Private</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1">{pod.description}</p>
                    </div>
                    <Link
                      href={`/pods/${pod.id}`}
                      className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                        pod.visibility === "public"
                          ? "bg-zinc-900 text-white hover:bg-zinc-800"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {pod.visibility === "public" ? "Join" : "Apply"}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-zinc-100 rounded-3xl p-8 text-center mb-6 shadow-softer">
                <p className="text-sm text-zinc-400">No pods match your interests yet.</p>
                <p className="text-xs text-zinc-300 mt-1">You can browse all pods after setup.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 8 — Almost done (instagram) ─────────────────────────────── */}
        {step === 8 && (
          <div className="animate-fade-up">
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              One more<br />thing
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              Connect your Instagram so pod members can find you outside the app. (Optional)
            </p>
            <div className="bg-white border border-zinc-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Instagram</p>
                  <p className="text-xs text-zinc-400">Your handle will appear on your profile</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">@</span>
                <input
                  type="text"
                  value={referralSource === "__ig__" ? "" : (igHandle || "")}
                  onChange={(e) => setIgHandle(e.target.value.replace(/^@/, "").trim())}
                  placeholder="yourhandle"
                  className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-300 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 9 — Notifications ──────────────────────────────────────── */}
        {step === 9 && (
          <div className="animate-fade-up">
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              Stay in<br />the loop
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              Get notified when it matters. You can always change this later.
            </p>

            {/* Enable notifications CTA */}
            {!notifEnabled ? (
              <button
                onClick={async () => {
                  if ("Notification" in window) {
                    const perm = await Notification.requestPermission()
                    if (perm === "granted") {
                      setNotifEnabled(true)
                      localStorage.setItem("notif_enabled", "true")
                      localStorage.setItem("notif_messages", "true")
                      localStorage.setItem("notif_pod_reminders", "true")
                      localStorage.setItem("notif_reminder_timing", "day_before")
                    }
                  }
                }}
                className="w-full flex items-center gap-4 bg-zinc-900 text-white rounded-3xl p-5 mb-4 transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BellRinging size={24} weight="fill" className="text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-bold">Enable notifications</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Messages, pod reminders, and more</div>
                </div>
                <ArrowRight size={16} className="text-zinc-500" />
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mb-2">
                  <CheckCircle size={20} weight="fill" className="text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">Notifications enabled</span>
                </div>

                {/* Message notifications */}
                <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                      <ChatCircle size={18} weight="fill" className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">Messages</div>
                      <div className="text-[11px] text-zinc-400">When someone sends you a DM</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNotifMessages(!notifMessages)
                      localStorage.setItem("notif_messages", String(!notifMessages))
                    }}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${notifMessages ? "bg-violet-500" : "bg-zinc-200"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${notifMessages ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Pod reminders */}
                <div className="bg-white border border-zinc-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                        <Bell size={18} weight="fill" className="text-violet-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">Pod reminders</div>
                        <div className="text-[11px] text-zinc-400">Before pod events and check-in deadlines</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setNotifPodReminders(!notifPodReminders)
                        localStorage.setItem("notif_pod_reminders", String(!notifPodReminders))
                      }}
                      className={`w-11 h-6 rounded-full transition-all duration-200 relative ${notifPodReminders ? "bg-violet-500" : "bg-zinc-200"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${notifPodReminders ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                  {notifPodReminders && (
                    <div className="mt-3 pt-3 border-t border-zinc-100">
                      <p className="text-[11px] font-semibold text-zinc-500 mb-2">When should we remind you?</p>
                      <div className="flex gap-2">
                        {REMINDER_TIMING_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setReminderTiming(opt.value)
                              localStorage.setItem("notif_reminder_timing", opt.value)
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              reminderTiming === opt.value
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-zinc-300 mt-4 text-center">
              You can change notification settings anytime in your profile.
            </p>
          </div>
        )}

        {/* ── Step 10 — Done ────────────────────────────────────────────────── */}
        {step === 10 && (
          <div className="animate-fade-up text-center">
            <div className="w-20 h-20 bg-violet-50 border-2 border-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} weight="fill" className="text-violet-500" />
            </div>
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-3">
              You&apos;re in,<br />{name.split(" ")[0] || "friend"}.
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px] max-w-[30ch] mx-auto">
              Your profile is set up. Go find your people and start building something real.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8 text-left">
              {[
                { icon: Flame,         text: "Check in daily",       sub: "Keep the streak going" },
                { icon: Users,         text: "Join a pod",           sub: "Find your group" },
                { icon: Trophy,        text: "Enter a challenge",    sub: "Compete with your pod" },
                { icon: CalendarBlank, text: "Add to calendar",      sub: "Never miss an event" },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="bg-white border border-zinc-100 rounded-2xl p-3 flex items-start gap-2.5 shadow-softer">
                  <div className="w-7 h-7 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={14} weight="fill" className="text-violet-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">{text}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-bold text-base py-4 rounded-full transition-all duration-200 active:scale-[0.97] shadow-[0_4px_20px_-4px_rgba(124,58,237,0.4)]"
            >
              <Flame size={18} weight="fill" />
              Let&apos;s go
            </button>
          </div>
        )}

        {/* ── Bottom navigation ─────────────────────────────────────────────── */}
        {step < TOTAL_STEPS && (
          <div className="flex items-center justify-between mt-10">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <ArrowLeft size={15} />
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {/* Skip on optional steps */}
              {[2, 6, 7, 8, 9].includes(step) && (
                <button
                  onClick={step === 7 ? () => setStep(8) : step === 8 ? () => setStep(9) : step === 9 ? () => setStep(10) : handleNext}
                  className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canNext}
                className="flex items-center gap-2 bg-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 active:scale-[0.97]"
              >
                Continue
                <ArrowRight size={15} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
