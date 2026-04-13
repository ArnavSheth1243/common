export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
  | "pickleball"
  | "tennis"
  | "basketball"
  | "soccer"
  | "golf"
  | "volleyball"
  | "martial_arts"
  | "climbing"
  | "surfing"
  | "skating"
  | "dance"
  | "other"
export type PodCadence = "daily" | "3x_weekly" | "weekly" | "bi_weekly" | "monthly"
export type Visibility = "public" | "private"
export type RsvpStatus = "going" | "maybe" | "no"

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  age: number | null
  location: string | null
  goals: string[]
  interests: string[]
  commitment: "daily" | "few_times" | "weekly" | "whenever"
  time_preference: "morning" | "afternoon" | "evening"
  onboarding_complete: boolean
  is_public: boolean
  created_at: string
}

export interface Pod {
  id: string
  name: string
  description: string | null
  type: PodType
  category: PodCategory
  cadence: PodCadence
  visibility: Visibility
  location: string
  max_members: number | null
  streak: number
  member_count: number
  created_by: string | null
  created_at: string
}

export interface PodMember {
  pod_id: string
  user_id: string
  joined_at: string
  current_streak: number
  longest_streak: number
  is_admin: boolean
}

export interface PodApplication {
  id: string
  pod_id: string
  user_id: string
  message: string | null
  status: "pending" | "accepted" | "declined"
  created_at: string
}

export interface Checkin {
  id: string
  pod_id: string
  user_id: string
  content: string
  image_url: string | null
  visibility: Visibility
  streak_count: number
  created_at: string
}

export interface CheckinLike {
  checkin_id: string
  user_id: string
  created_at: string
}

export interface CheckinComment {
  id: string
  checkin_id: string
  user_id: string
  content: string
  created_at: string
}

export interface PodEvent {
  id: string
  pod_id: string | null
  title: string
  date: string
  time: string | null
  end_time: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
  created_by: string | null
  is_public: boolean
  image_url: string | null
  category: string | null
  created_at: string
}

export interface EventRsvp {
  event_id: string
  user_id: string
  status: RsvpStatus
  updated_at: string
}

export interface UserMedal {
  user_id: string
  medal_id: string
  earned_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  date: string
  time: string | null
  end_time: string | null
  type: "personal" | "pod" | "reminder"
  pod_id: string | null
  location: string | null
  description: string | null
  created_at: string
}

// Supabase generated types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at">
        Update: Partial<Omit<Profile, "id" | "created_at">>
      }
      pods: {
        Row: Pod
        Insert: Omit<Pod, "id" | "created_at">
        Update: Partial<Omit<Pod, "id" | "created_at">>
      }
      pod_members: {
        Row: PodMember
        Insert: Omit<PodMember, "joined_at">
        Update: Partial<Omit<PodMember, "pod_id" | "user_id">>
      }
      pod_applications: {
        Row: PodApplication
        Insert: Omit<PodApplication, "id" | "created_at" | "status">
        Update: Partial<Pick<PodApplication, "status">>
      }
      checkins: {
        Row: Checkin
        Insert: Omit<Checkin, "id" | "created_at">
        Update: Partial<Pick<Checkin, "content" | "image_url">>
      }
      checkin_likes: {
        Row: CheckinLike
        Insert: Omit<CheckinLike, "created_at">
        Update: never
      }
      checkin_comments: {
        Row: CheckinComment
        Insert: Omit<CheckinComment, "id" | "created_at">
        Update: Partial<Pick<CheckinComment, "content">>
      }
      pod_events: {
        Row: PodEvent
        Insert: Omit<PodEvent, "id" | "created_at">
        Update: Partial<Omit<PodEvent, "id" | "pod_id" | "created_at">>
      }
      event_rsvps: {
        Row: EventRsvp
        Insert: Omit<EventRsvp, "updated_at">
        Update: Partial<Pick<EventRsvp, "status">>
      }
      user_medals: {
        Row: UserMedal
        Insert: Omit<UserMedal, "earned_at">
        Update: never
      }
      calendar_events: {
        Row: CalendarEvent
        Insert: Omit<CalendarEvent, "id" | "created_at">
        Update: Partial<Omit<CalendarEvent, "id" | "user_id" | "created_at">>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
