"use client"

import { useState } from "react"
import {
  Lightning,
  Megaphone,
  CalendarCheck,
  ArrowRight,
  Sparkle,
  Star,
  Clock,
  SealCheck,
  Users,
  X,
  Sneaker,
  BookOpen,
  Trophy,
  CheckCircle,
} from "@phosphor-icons/react"
import { MY_PODS } from "@/lib/data"

// ─── Types ────────────────────────────────────────────────────────────────────

type PostTag = "announcement" | "challenge" | "spotlight" | "event" | "tip"

interface MediaPost {
  id: string
  tag: PostTag
  title: string
  body: string
  date: string
  image?: string
  pinned?: boolean
  cta?: { label: string }
  meta?: string
}

interface Challenge {
  id: string
  title: string
  tagline: string
  description: string
  rules?: string[]
  deadlineLabel: string
  daysLeft: number
  totalDays: number
  participants: number
  category: string
  reward: string
  image: string
  gradientFrom: string
  gradientVia: string
  accentText: string
  accentBg: string
  buttonBg: string
  difficulty: "Easy" | "Medium" | "Hard"
  featured: boolean
  defaultJoined: boolean
  status: "active" | "ending_soon" | "new"
  isPodChallenge?: boolean      // true = pod enters as a team
  metric?: string               // e.g. "miles", "books"
  metricUnit?: string           // e.g. "mi", "books"
  podTarget?: number            // collective pod goal
  leaderboard?: { name: string; value: number; initials: string; color: string }[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TAG_STYLES: Record<PostTag, { bg: string; text: string; label: string }> = {
  announcement: { bg: "bg-violet-100",  text: "text-violet-700",  label: "Announcement" },
  challenge:    { bg: "bg-violet-100", text: "text-violet-700", label: "Challenge" },
  spotlight:    { bg: "bg-emerald-100",text: "text-emerald-700",label: "Spotlight" },
  event:        { bg: "bg-sky-100",    text: "text-sky-700",    label: "Event" },
  tip:          { bg: "bg-zinc-100",   text: "text-zinc-600",   label: "Tip" },
}

const TAG_ICONS: Record<PostTag, React.ReactNode> = {
  announcement: <Megaphone size={12} weight="fill" />,
  challenge:    <Lightning size={12} weight="fill" />,
  spotlight:    <Star size={12} weight="fill" />,
  event:        <CalendarCheck size={12} weight="fill" />,
  tip:          <Sparkle size={12} weight="fill" />,
}

const POSTS: MediaPost[] = [
  {
    id: "p1", tag: "announcement", pinned: true,
    title: "Common is growing — thank you 🎉",
    body: "We just crossed 500 active pods. From morning runners to home cooks to finance nerds — you've made Common what it is. New features dropping this month: group events, pod leaderboards, and media sharing inside pods.",
    date: "Mar 20",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop&q=80",
    cta: { label: "See what's coming" },
  },
  {
    id: "p2", tag: "challenge",
    title: "April Consistency Challenge",
    body: "Check in every single day in April. It doesn't have to be perfect — it just has to happen. 30 days, any pod, any habit. Everyone who completes it gets a badge.",
    date: "Mar 18", meta: "Starts April 1st",
    cta: { label: "Join the challenge" },
  },
  {
    id: "p3", tag: "spotlight",
    title: "Pod of the Week: Morning Run Club",
    body: "14 members. 47-day group streak. They meet every Saturday at Riverside Park at 6am — in rain, cold, and fog. We sat down with Marcus, the pod creator, to talk about what keeps them going.",
    date: "Mar 17",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=300&fit=crop&q=80",
    cta: { label: "Read the story" },
  },
  {
    id: "p4", tag: "tip",
    title: "The 2-minute check-in rule",
    body: "Struggling to check in consistently? Set a rule: if you did anything toward your habit today — even 2 minutes — that counts. Log it. A short honest check-in beats a skipped perfect one every time.",
    date: "Mar 15",
  },
  {
    id: "p5", tag: "event",
    title: "Common IRL: NYC Meetup",
    body: "If you're in New York, come hang. We're doing an informal meetup on April 12th — coffee, conversations, and maybe a group run. All pod members welcome.",
    date: "Mar 14", meta: "April 12 · NYC",
    cta: { label: "RSVP (free)" },
  },
  {
    id: "p6", tag: "spotlight",
    title: "How Priya hit a 16-week reading streak",
    body: "She started with 10 pages a day. Then 20. Now she's on her 7th book of the year and hasn't missed a check-in since November. Here's exactly what her routine looks like.",
    date: "Mar 10",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=300&fit=crop&q=80",
  },
  {
    id: "p7", tag: "announcement",
    title: "Private pods now live",
    body: "You can now set any pod to private — meaning people have to apply to join and you approve them. Great for close-knit groups or accountability pods with a vibe to protect.",
    date: "Mar 8",
  },
  {
    id: "p8", tag: "tip",
    title: "Why small pods outperform large ones",
    body: "The data is clear: pods with 4–8 members have 3× higher check-in consistency than pods with 15+. When someone can tell you're missing, you show up. Keep your pods tight.",
    date: "Mar 5",
  },
]

const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "30-Day Consistency",
    tagline: "Show up. Every. Single. Day.",
    description: "Check in every day in April across any pod. Doesn't matter what — just keep the streak alive for 30 days straight.",
    rules: [
      "Check in to any pod at least once per day",
      "No minimum length — even a 2-sentence check-in counts",
      "Missing a single day resets your progress",
      "Complete all 30 days to earn the medal",
    ],
    deadlineLabel: "Apr 30",
    daysLeft: 18,
    totalDays: 30,
    participants: 1247,
    category: "All pods",
    reward: "Consistency Badge",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&h=600&fit=crop&q=80",
    gradientFrom: "from-violet-950",
    gradientVia: "via-violet-900/80",
    accentText: "text-violet-400",
    accentBg: "bg-violet-500/20",
    buttonBg: "bg-violet-500 hover:bg-violet-400",
    difficulty: "Medium",
    featured: true,
    defaultJoined: false,
    status: "active",
  },
  {
    id: "c2",
    title: "Read 2 Books in March",
    tagline: "Pages over scrolling.",
    description: "Finish at least 2 books before March ends. Log your progress with a check-in and share what you thought.",
    deadlineLabel: "Mar 31",
    daysLeft: 7,
    totalDays: 31,
    participants: 312,
    category: "Reading",
    reward: "Bookworm Badge",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&h=600&fit=crop&q=80",
    gradientFrom: "from-indigo-950",
    gradientVia: "via-indigo-900/80",
    accentText: "text-indigo-300",
    accentBg: "bg-indigo-500/20",
    buttonBg: "bg-indigo-500 hover:bg-indigo-400",
    difficulty: "Easy",
    featured: false,
    defaultJoined: true,
    status: "ending_soon",
  },
  {
    id: "c3",
    title: "Spring 5K Challenge",
    tagline: "Run it, walk it — just finish.",
    description: "Complete a 5K any time in April. Run it solo, with your pod, or at a local race. All paces welcome.",
    deadlineLabel: "Apr 30",
    daysLeft: 25,
    totalDays: 30,
    participants: 892,
    category: "Running",
    reward: "5K Finisher Badge",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&h=600&fit=crop&q=80",
    gradientFrom: "from-emerald-950",
    gradientVia: "via-emerald-900/80",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/20",
    buttonBg: "bg-emerald-500 hover:bg-emerald-400",
    difficulty: "Easy",
    featured: false,
    defaultJoined: false,
    status: "new",
  },
  {
    id: "c4",
    title: "Pod Streak Week",
    tagline: "Nobody gets left behind.",
    description: "Get every single member of your pod to check in every day for 7 consecutive days. All or nothing.",
    deadlineLabel: "Ongoing",
    daysLeft: 99,
    totalDays: 7,
    participants: 2041,
    category: "All pods",
    reward: "Team Player Badge",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=600&fit=crop&q=80",
    gradientFrom: "from-rose-950",
    gradientVia: "via-rose-900/80",
    accentText: "text-rose-300",
    accentBg: "bg-rose-500/20",
    buttonBg: "bg-rose-500 hover:bg-rose-400",
    difficulty: "Hard",
    featured: false,
    defaultJoined: false,
    status: "active",
  },
  {
    id: "c5",
    title: "Pod Miles Race",
    tagline: "Your whole pod runs. Combined.",
    description: "Enter your pod as a team. Each member logs their miles via check-ins. First pod to collectively hit 100 miles wins. Solo miles, group runs, walks — all count.",
    rules: [
      "Enter as a pod team — all members participate",
      "Log miles in your check-in (e.g. '3.2 mi this morning')",
      "Combined team miles count toward your pod total",
      "First pod to 100 miles earns the team medal",
      "Pod must have at least 2 active members",
    ],
    deadlineLabel: "Apr 30",
    daysLeft: 22,
    totalDays: 30,
    participants: 587,
    category: "Running",
    reward: "Pod Racer Badge",
    image: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=900&h=600&fit=crop&q=80",
    gradientFrom: "from-sky-950",
    gradientVia: "via-sky-900/80",
    accentText: "text-sky-300",
    accentBg: "bg-sky-500/20",
    buttonBg: "bg-sky-500 hover:bg-sky-400",
    difficulty: "Medium",
    featured: false,
    defaultJoined: false,
    status: "active",
    isPodChallenge: true,
    metric: "miles",
    metricUnit: "mi",
    podTarget: 100,
    leaderboard: [
      { name: "Morning Run Club", value: 78, initials: "MR", color: "bg-rose-500" },
      { name: "Coastal Runners", value: 63, initials: "CR", color: "bg-sky-500" },
      { name: "Sunrise Squad", value: 51, initials: "SS", color: "bg-violet-500" },
      { name: "Weekend Warriors", value: 44, initials: "WW", color: "bg-emerald-500" },
    ],
  },
  {
    id: "c6",
    title: "Pod Book Club Sprint",
    tagline: "Read together. Hit the target.",
    description: "Enter your pod and collectively read 10 books before the end of the month. Log each book as a check-in. Works best with reading pods but any pod can enter.",
    rules: [
      "Enter your pod — any pod can participate",
      "Each member logs completed books in their check-in",
      "One book per member per check-in counts",
      "Hit 10 books combined before April 30th",
      "Re-reads and audiobooks count",
    ],
    deadlineLabel: "Apr 30",
    daysLeft: 22,
    totalDays: 30,
    participants: 234,
    category: "Reading",
    reward: "Pod Readers Badge",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&h=600&fit=crop&q=80",
    gradientFrom: "from-violet-950",
    gradientVia: "via-violet-900/80",
    accentText: "text-violet-300",
    accentBg: "bg-violet-500/20",
    buttonBg: "bg-violet-500 hover:bg-violet-400",
    difficulty: "Easy",
    featured: false,
    defaultJoined: false,
    status: "new",
    isPodChallenge: true,
    metric: "books",
    metricUnit: "books",
    podTarget: 10,
    leaderboard: [
      { name: "The Reader's Pod", value: 6, initials: "RP", color: "bg-violet-500" },
      { name: "Sunday Book Club", value: 5, initials: "SB", color: "bg-violet-500" },
      { name: "Late Night Readers", value: 3, initials: "LN", color: "bg-sky-500" },
    ],
  },
]

const AVATAR_COLORS = [
  "bg-rose-500","bg-violet-500","bg-emerald-500",
  "bg-sky-500","bg-violet-500","bg-pink-500","bg-violet-500","bg-teal-500",
]

const DIFFICULTY_STYLES = {
  Easy:   { bg: "bg-emerald-500/20", text: "text-emerald-300" },
  Medium: { bg: "bg-violet-500/20",   text: "text-violet-300" },
  Hard:   { bg: "bg-rose-500/20",    text: "text-rose-300" },
}

const STATUS_BADGE: Record<Challenge["status"], { label: string; style: string }> = {
  active:       { label: "Active",       style: "bg-white/10 text-white/70" },
  ending_soon:  { label: "Ending soon",  style: "bg-rose-500/30 text-rose-200" },
  new:          { label: "Just launched",style: "bg-emerald-500/30 text-emerald-200" },
}

// ─── Components ───────────────────────────────────────────────────────────────

function AvatarStack({ count, colors }: { count: number; colors: string[] }) {
  const shown = Math.min(6, colors.length)
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {colors.slice(0, shown).map((c, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full ${c} ring-2 ring-black/30 flex items-center justify-center text-[9px] font-bold text-white`}
            style={{ zIndex: shown - i }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <span className="text-xs font-semibold text-white/70">
        {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toLocaleString()} joined
      </span>
    </div>
  )
}

function ProgressBar({ pct, accentBg }: { pct: number; accentBg: string }) {
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${accentBg} transition-all duration-700`}
        style={{ width: `${Math.min(100, pct)}%`, backgroundColor: undefined }}
      />
    </div>
  )
}

function FeaturedChallenge({ challenge }: { challenge: Challenge }) {
  const [joined, setJoined] = useState(challenge.defaultJoined)
  const pct = joined ? Math.round(((challenge.totalDays - challenge.daysLeft) / challenge.totalDays) * 100) : 0
  const diff = DIFFICULTY_STYLES[challenge.difficulty]
  const status = STATUS_BADGE[challenge.status]

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-soft mb-4" style={{ minHeight: 380 }}>
      {/* Background image */}
      <img
        src={challenge.image}
        alt={challenge.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${challenge.gradientFrom} ${challenge.gradientVia} to-transparent`} />
      {/* Dark vignette at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-7" style={{ minHeight: 380 }}>
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${status.style}`}>
              {status.label}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${diff.bg} ${diff.text}`}>
              {challenge.difficulty}
            </span>
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${challenge.accentBg} ${challenge.accentText}`}>
            <Clock size={11} />
            {challenge.daysLeft}d left
          </div>
        </div>

        {/* Bottom content */}
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.15em] mb-2 ${challenge.accentText}`}>
            Featured Challenge
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight tracking-tight mb-1">
            {challenge.title}
          </h2>
          <p className="text-sm text-white/70 mb-5 leading-relaxed max-w-[42ch]">
            {challenge.tagline}
          </p>

          {/* Reward */}
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 ${challenge.accentBg} ${challenge.accentText}`}>
            <SealCheck size={13} weight="fill" />
            Earn: {challenge.reward}
          </div>

          {/* Participants */}
          <div className="mb-4">
            <AvatarStack count={challenge.participants} colors={AVATAR_COLORS} />
          </div>

          {/* Progress (if joined) */}
          {joined && (
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-white/60 mb-1.5">
                <span>Your progress</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => setJoined(!joined)}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.98]
              ${joined
                ? "bg-white/15 border border-white/20 hover:bg-white/20"
                : `${challenge.buttonBg} shadow-lg`
              }`}
          >
            {joined ? "✓ Joined — keep going!" : "Join Challenge"}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChallengeCard({ challenge, onOpen }: { challenge: Challenge; onOpen: () => void }) {
  const [joined, setJoined] = useState(challenge.defaultJoined)
  const pct = Math.round(((challenge.totalDays - challenge.daysLeft) / challenge.totalDays) * 100)
  const diff = DIFFICULTY_STYLES[challenge.difficulty]
  const status = STATUS_BADGE[challenge.status]

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-card cursor-pointer" style={{ minHeight: 220 }} onClick={onOpen}>
      {/* Background */}
      <img src={challenge.image} alt={challenge.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className={`absolute inset-0 bg-gradient-to-br ${challenge.gradientFrom} ${challenge.gradientVia} to-black/40`} />
      <div className="absolute inset-0 bg-black/30" />

      {/* Pod challenge badge */}
      {challenge.isPodChallenge && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1">
          <Users size={10} className="text-white" />
          <span className="text-[10px] font-bold text-white">Pod challenge</span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-5 flex flex-col justify-between h-full" style={{ minHeight: 220 }}>
        {/* Top */}
        <div className="flex items-start justify-between mb-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${status.style}`}>
              {status.label}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${diff.bg} ${diff.text}`}>
              {challenge.difficulty}
            </span>
          </div>
          {!challenge.isPodChallenge && (
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${challenge.accentBg} ${challenge.accentText}`}>
              <Clock size={10} />
              {challenge.daysLeft === 99 ? "Ongoing" : `${challenge.daysLeft}d left`}
            </div>
          )}
        </div>

        {/* Middle */}
        <div className="py-3">
          <h3 className="text-xl font-bold text-white leading-tight tracking-tight">{challenge.title}</h3>
          <p className={`text-xs font-semibold mt-0.5 ${challenge.accentText}`}>{challenge.tagline}</p>
          {challenge.isPodChallenge && challenge.podTarget && (
            <p className={`text-[11px] mt-1.5 font-medium text-white/60`}>
              Pod goal: {challenge.podTarget} {challenge.metricUnit}
            </p>
          )}
        </div>

        {/* Bottom */}
        <div>
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-white/50 mb-1">
              <span>{challenge.participants.toLocaleString()} {challenge.isPodChallenge ? "pods" : "participants"}</span>
              {challenge.daysLeft !== 99 && <span>{pct}% of time elapsed</span>}
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-white/50" style={{ width: `${challenge.daysLeft === 99 ? 60 : pct}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex-1 flex items-center gap-1.5 text-[11px] font-semibold ${challenge.accentText}`}>
              <SealCheck size={12} weight="fill" />
              {challenge.reward}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setJoined(!joined) }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97]
                ${joined
                  ? "bg-white/15 text-white border border-white/20 hover:bg-white/20"
                  : `${challenge.buttonBg} text-white shadow-lg`
                }`}
            >
              {joined ? "✓ Joined" : challenge.isPodChallenge ? "Enter pod" : "Join"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Challenge Detail Modal ────────────────────────────────────────────────────

function ChallengeModal({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  const [joined, setJoined] = useState(challenge.defaultJoined)
  const [selectedPod, setSelectedPod] = useState<string | null>(null)
  const [step, setStep] = useState<"detail" | "pod_select" | "success">("detail")
  const pct = Math.round(((challenge.totalDays - challenge.daysLeft) / challenge.totalDays) * 100)
  const diff = DIFFICULTY_STYLES[challenge.difficulty]

  const handleJoin = () => {
    if (challenge.isPodChallenge && !joined) {
      setStep("pod_select")
    } else {
      setJoined((j) => !j)
    }
  }

  const handlePodEnter = () => {
    if (selectedPod) { setJoined(true); setStep("success") }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-48 overflow-hidden">
          <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t ${challenge.gradientFrom} ${challenge.gradientVia} to-transparent opacity-80`} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {challenge.isPodChallenge && (
                <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Users size={9} />Pod challenge
                </span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff.bg} ${diff.text}`}>{challenge.difficulty}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{challenge.title}</h2>
            <p className={`text-xs font-semibold mt-0.5 ${challenge.accentText}`}>{challenge.tagline}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === "detail" && <>
            {/* Description */}
            <p className="text-sm text-zinc-600 leading-relaxed mb-5">{challenge.description}</p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: challenge.isPodChallenge ? "Pod entries" : "Participants", value: challenge.participants.toLocaleString() },
                { label: "Time left", value: challenge.daysLeft === 99 ? "Ongoing" : `${challenge.daysLeft}d` },
                { label: "Total days", value: `${challenge.totalDays}d` },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-50 rounded-2xl p-3 text-center">
                  <div className="text-base font-bold text-zinc-900 leading-none">{s.value}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Rules */}
            {challenge.rules && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Rules</h4>
                <div className="space-y-2">
                  {challenge.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={14} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-600 leading-snug">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pod metric / target */}
            {challenge.isPodChallenge && challenge.podTarget && (
              <div className={`rounded-2xl p-4 mb-5 ${challenge.accentBg}`}>
                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${challenge.accentText}`}>Pod goal</div>
                <div className={`text-2xl font-bold ${challenge.accentText}`}>
                  {challenge.podTarget} {challenge.metricUnit}
                </div>
                <div className="text-xs text-white/50 mt-0.5">Combined across all pod members</div>
              </div>
            )}

            {/* Leaderboard */}
            {challenge.leaderboard && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  {challenge.isPodChallenge ? "Pod leaderboard" : "Top participants"}
                </h4>
                <div className="space-y-2">
                  {challenge.leaderboard.map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <span className="text-xs font-bold text-zinc-300 w-4">{i + 1}</span>
                      <div className={`w-7 h-7 rounded-full ${entry.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                        {entry.initials}
                      </div>
                      <span className="text-sm font-semibold text-zinc-800 flex-1 truncate">{entry.name}</span>
                      <span className={`text-sm font-bold ${challenge.accentText.replace("text-", "text-").replace("-300", "-600").replace("-400", "-600")}`}>
                        {entry.value} {challenge.metricUnit ?? "pts"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reward */}
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-6">
              <Trophy size={22} weight="fill" className="text-violet-500 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-violet-700 uppercase tracking-wide">Reward</div>
                <div className="text-sm font-semibold text-zinc-900">{challenge.reward}</div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleJoin}
              className={`w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]
                ${joined
                  ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  : `${challenge.buttonBg} text-white shadow-lg`
                }`}
            >
              {joined ? "✓ Already joined" : challenge.isPodChallenge ? "Enter your pod" : "Join Challenge"}
            </button>
          </>}

          {step === "pod_select" && <>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Choose your pod</h3>
            <p className="text-sm text-zinc-500 mb-5">Select which pod to enter as a team. All members will contribute.</p>
            <div className="space-y-3 mb-6">
              {MY_PODS.map((pod) => (
                <button
                  key={pod.id}
                  onClick={() => setSelectedPod(pod.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedPod === pod.id
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${pod.memberColors[0]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {pod.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 truncate">{pod.name}</div>
                    <div className="text-xs text-zinc-400">{pod.members} members</div>
                  </div>
                  {selectedPod === pod.id && <CheckCircle size={18} weight="fill" className="text-zinc-900 flex-shrink-0" />}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("detail")}
                className="flex-1 py-3.5 rounded-2xl bg-zinc-100 text-zinc-600 text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePodEnter}
                disabled={!selectedPod}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-40 ${challenge.buttonBg}`}
              >
                Enter pod
              </button>
            </div>
          </>}

          {step === "success" && <>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} weight="fill" className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Pod entered!</h3>
              <p className="text-sm text-zinc-500 mb-2">
                <span className="font-semibold text-zinc-900">{MY_PODS.find((p) => p.id === selectedPod)?.name ?? "Your pod"}</span> is now in the challenge.
              </p>
              <p className="text-xs text-zinc-400 mb-6">Each member&apos;s check-ins will count toward your team total.</p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-zinc-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: MediaPost }) {
  const tag = TAG_STYLES[post.tag]
  const icon = TAG_ICONS[post.tag]
  return (
    <div className={`bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-softer hover:shadow-card transition-all duration-300 ${post.pinned ? "ring-1 ring-violet-300/50" : ""}`}>
      {post.image && (
        <img src={post.image} alt={post.title} className="w-full h-44 object-cover" />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${tag.bg} ${tag.text}`}>
            {icon}{tag.label}
          </span>
          {post.pinned && <span className="text-[11px] font-semibold text-violet-600">Pinned</span>}
          <span className="ml-auto text-[11px] text-zinc-400">{post.date}</span>
        </div>
        <h3 className="text-base font-bold text-zinc-900 mb-2 leading-snug">{post.title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{post.body}</p>
        {post.meta && <p className="text-xs font-semibold text-zinc-400 mt-2">{post.meta}</p>}
        {post.cta && (
          <button className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-violet-600 transition-colors">
            {post.cta.label}<ArrowRight size={14} weight="bold" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "updates" | "challenges"

export default function MediaPage() {
  const [tab, setTab] = useState<Tab>("updates")
  const [filter, setFilter] = useState<PostTag | "all">("all")
  const [openChallenge, setOpenChallenge] = useState<Challenge | null>(null)

  const featured = CHALLENGES.find((c) => c.featured)!
  const rest = CHALLENGES.filter((c) => !c.featured)

  const filtered = filter === "all" ? POSTS : POSTS.filter((p) => p.tag === filter)
  const pinned = filtered.find((p) => p.pinned)
  const restPosts = filtered.filter((p) => !p.pinned)

  const totalJoined = CHALLENGES.filter((c) => c.defaultJoined).length

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-8">
      {openChallenge && <ChallengeModal challenge={openChallenge} onClose={() => setOpenChallenge(null)} />}
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-up">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2">From Common</p>
        <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-zinc-900 tracking-tighter leading-none">Media</h1>
        <p className="text-sm sm:text-base text-zinc-500 mt-2">Updates, challenges, and community stories</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-2xl p-1 mb-6 animate-fade-up" style={{ animationDelay: "40ms" }}>
        <button
          onClick={() => setTab("updates")}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all
            ${tab === "updates" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700"}`}
        >
          Updates & Stories
        </button>
        <button
          onClick={() => setTab("challenges")}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2
            ${tab === "challenges" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700"}`}
        >
          Challenges
          <span className="bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {CHALLENGES.length}
          </span>
        </button>
      </div>

      {/* ── Updates tab ─────────────────────────────────────────────────── */}
      {tab === "updates" && (
        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {(["all","announcement","challenge","spotlight","event","tip"] as (PostTag|"all")[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all
                  ${filter === f ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
              >
                {f === "all" ? "All" : TAG_STYLES[f].label}
              </button>
            ))}
          </div>
          {pinned && <div className="mb-4"><PostCard post={pinned} /></div>}
          <div className="space-y-4">{restPosts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        </div>
      )}

      {/* ── Challenges tab ───────────────────────────────────────────────── */}
      {tab === "challenges" && (
        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Lightning size={15} weight="fill" className="text-violet-500" />, value: CHALLENGES.length, label: "Active" },
              { icon: <Users size={15} weight="fill" className="text-sky-500" />, value: "4.4k+", label: "Participants" },
              { icon: <SealCheck size={15} weight="fill" className="text-emerald-500" />, value: totalJoined, label: "Joined" },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-zinc-100 rounded-2xl px-4 py-3 text-center shadow-softer">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-lg font-bold text-zinc-900 leading-none">{s.value}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Featured challenge */}
          <div onClick={() => setOpenChallenge(featured)} className="cursor-pointer">
            <FeaturedChallenge challenge={featured} />
          </div>

          {/* Section headers */}
          <div className="mt-6 mb-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Individual Challenges</h3>
          </div>
          <div className="space-y-4">
            {rest.filter((c) => !c.isPodChallenge).map((c) => (
              <ChallengeCard key={c.id} challenge={c} onOpen={() => setOpenChallenge(c)} />
            ))}
          </div>

          <div className="mt-6 mb-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={12} className="text-zinc-400" />
              Pod Team Challenges
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Enter your whole pod. Combine progress toward a shared goal.</p>
          </div>
          <div className="space-y-4">
            {rest.filter((c) => c.isPodChallenge).map((c) => (
              <ChallengeCard key={c.id} challenge={c} onOpen={() => setOpenChallenge(c)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
