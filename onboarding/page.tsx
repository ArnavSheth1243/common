"use client"

import { useState } from "react"
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
} from "@phosphor-icons/react"
import { useUserProfile } from "@/app/context/user-profile"
import { PODS } from "@/lib/data"
import type { PodCategory } from "@/lib/data"
import Link from "next/link"

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
    color: "bg-amber-500",
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
              ${i === 7 ? "bg-amber-400 text-zinc-900" :
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

const TOTAL_STEPS = 8

export default function OnboardingPage() {
  const router = useRouter()
  const { profile, updateProfile } = useUserProfile()

  const [step, setStep] = useState(1)
  const [name, setName] = useState(profile.displayName === "Arnav S." ? "" : profile.displayName)
  const [age, setAge] = useState<string>(profile.age ? String(profile.age) : "")
  const [location, setLocation] = useState(profile.location ?? "")
  const [goals, setGoals] = useState<string[]>(profile.goals)
  const [interests, setInterests] = useState<PodCategory[]>(profile.interests)
  const [commitment, setCommitment] = useState(profile.commitment)
  const [timePreference, setTimePreference] = useState(profile.timePreference)
  const [activeTourCard, setActiveTourCard] = useState(0)

  const toggleGoal = (v: string) =>
    setGoals((prev) => prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v])

  const toggleInterest = (cat: PodCategory) =>
    setInterests((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])

  const handleNext = () => {
    if (step === 1) updateProfile({ displayName: name.trim() || "Friend" })
    if (step === 2) updateProfile({ age: age ? parseInt(age) : undefined, location: location.trim() })
    if (step === 3) updateProfile({ goals })
    if (step === 4) updateProfile({ interests })
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const handleFinish = () => {
    updateProfile({ interests, commitment, timePreference, goals, onboardingComplete: true })
    router.push("/dashboard")
  }

  const suggestedPods = PODS.filter((p) =>
    interests.some((i) => p.category === i)
  ).slice(0, 3)

  const canNext =
    step === 1 ? name.trim().length > 0 :
    step === 3 ? goals.length > 0 :
    step === 4 ? interests.length > 0 :
    true

  const stepLabel = ["", "Who are you?", "A bit about you", "Goals", "Interests", "How you show up", "The app", "Pod suggestions", "You're all set"][step] ?? ""

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
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{stepLabel}</span>
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

        {/* ── Step 1 — Name ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h1 className="text-[36px] font-bold text-zinc-900 tracking-tighter leading-tight mb-2">
              What should<br />we call you?
            </h1>
            <p className="text-zinc-400 mb-8 text-[15px]">
              This is how your pod members will know you.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="w-full bg-white border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-2xl px-5 py-4 text-xl text-zinc-900 placeholder:text-zinc-300 outline-none transition-all font-semibold"
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
                  className="w-full bg-white border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-2xl px-5 py-4 text-lg text-zinc-900 placeholder:text-zinc-300 outline-none transition-all font-semibold"
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
                  className="w-full bg-white border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-2xl px-5 py-4 text-base text-zinc-900 placeholder:text-zinc-300 outline-none transition-all"
                />
                <p className="text-xs text-zinc-300 mt-1.5 ml-1">Optional — helps with in-person pods.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3 — Welcome callout (transition slide) ────────────────────── */}
        {step === 3 && (
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full">
              <Star size={14} weight="fill" className="text-amber-500" />
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
                    <Icon size={18} weight={selected ? "fill" : "regular"} className={selected ? "text-amber-400" : "text-zinc-400"} />
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
                      ? "border-amber-400 bg-amber-50 text-amber-700"
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
            <div className="mb-2 inline-flex items-center gap-2 bg-zinc-900 text-[#f5f0e6] text-xs font-bold px-3 py-1.5 rounded-full">
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
        {step === 7 && (
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

        {/* ── Step 8 — Done ─────────────────────────────────────────────────── */}
        {step === 8 && (
          <div className="animate-fade-up text-center">
            <div className="w-20 h-20 bg-amber-50 border-2 border-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} weight="fill" className="text-amber-500" />
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
                  <div className="w-7 h-7 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={14} weight="fill" className="text-amber-500" />
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
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_4px_20px_-4px_rgba(245,158,11,0.5)]"
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
              {[2, 6, 7].includes(step) && (
                <button
                  onClick={step === 7 ? () => setStep(8) : handleNext}
                  className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canNext}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 active:scale-[0.98]"
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
