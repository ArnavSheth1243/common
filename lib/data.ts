// ─── Types and constants ─────────────────────────────────────────────────────

export type PodCadence = "daily" | "3x_weekly" | "weekly" | "bi_weekly" | "monthly"
export type PodType = "Habit" | "Explore"
export type PodCategory =
  | "running"
  | "cycling"
  | "swimming"
  | "yoga"
  | "strength"
  | "hiking"
  | "reading"
  | "writing"
  | "journaling"
  | "meditation"
  | "cooking"
  | "learning"
  | "music"
  | "art"
  | "photography"
  | "finance"
  | "other"

export const CADENCE_LABELS: Record<PodCadence, string> = {
  daily: "Daily",
  "3x_weekly": "3× a week",
  weekly: "Weekly",
  bi_weekly: "Every 2 weeks",
  monthly: "Monthly",
}

export const CADENCE_VERB: Record<PodCadence, string> = {
  daily: "today",
  "3x_weekly": "this week",
  weekly: "this week",
  bi_weekly: "this period",
  monthly: "this month",
}

export type RsvpStatus = "going" | "maybe" | "no"

export interface PodApplication {
  id: string
  applicantName: string
  applicantInitials: string
  applicantColor: string
  text: string
  submittedAt: string
}

export interface PodEvent {
  id: string
  title: string
  date: string
  dateLabel: string
  time: string
  location: string
  description?: string
  rsvps: Record<string, RsvpStatus>
}

export interface PodMember {
  name: string
  initials: string
  color: string
  streak: number
  isYou?: boolean
}

export interface Comment {
  id: string
  author: { name: string; initials: string; color: string }
  text: string
  time: string
}

export interface Checkin {
  id: string
  author: { name: string; initials: string; color: string }
  time: string
  content: string
  likes: number
  comments: number
  streakCount: number
  commentThread?: Comment[]
  visibility?: "public" | "pod" | "private"
}

export interface Pod {
  id: string
  name: string
  type: PodType
  category: PodCategory
  cadence: PodCadence
  description: string
  members: number
  maxMembers: number | null
  streak: number
  memberColors: string[]
  createdAt: string
  location: string
  podMembers: PodMember[]
  recentCheckins: Checkin[]
  events?: PodEvent[]
  podId: string
  visibility: "public" | "private"
  createdByYou?: boolean
  pendingApplications?: PodApplication[]
}

// ─── Data (now empty, will be populated from Supabase) ──────────────────────

export const PODS: Pod[] = []
export const MY_POD_IDS: string[] = []
export const MY_PODS: Pod[] = []
export const POD_MAP: Record<string, Pod> = {}
export const MEMBER_MAP: Record<string, PodMember> = {}
