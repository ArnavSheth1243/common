"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/app/context/session"
import type { PodCategory } from "@/lib/data"

export interface UserProfile {
  displayName: string
  age?: number
  location?: string
  goals: string[]
  interests: PodCategory[]
  commitment: "daily" | "few_times" | "weekly" | "whenever"
  timePreference: "morning" | "afternoon" | "evening"
  onboardingComplete: boolean
  bio?: string
  instagramHandle?: string
  isPublic: boolean
  referralSource?: string
  peopleMet: number
  avatarUrl?: string
}

interface UserProfileContextValue {
  profile: UserProfile | null
  loading: boolean
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null)

const DEFAULT_PROFILE: UserProfile = {
  displayName: "User",
  age: undefined,
  location: "",
  goals: [],
  interests: [],
  commitment: "daily",
  timePreference: "morning",
  onboardingComplete: false,
  bio: "",
  instagramHandle: "",
  isPublic: true,
  referralSource: "",
  peopleMet: 0,
  avatarUrl: undefined,
}

function mapSupabaseToProfile(data: any): UserProfile {
  return {
    displayName: data.display_name || "User",
    age: data.age || undefined,
    location: data.location || "",
    goals: data.goals || [],
    interests: (data.interests || []) as PodCategory[],
    commitment: data.commitment || "daily",
    timePreference: data.time_preference || "morning",
    onboardingComplete: data.onboarding_complete || false,
    bio: data.bio || "",
    instagramHandle: data.instagram_handle || "",
    isPublic: data.is_public ?? true,
    referralSource: data.referral_source || "",
    peopleMet: data.people_met || 0,
    avatarUrl: data.avatar_url || undefined,
  }
}

function mapProfileToSupabase(profile: UserProfile) {
  return {
    display_name: profile.displayName,
    age: profile.age || null,
    location: profile.location || "",
    goals: profile.goals,
    interests: profile.interests,
    commitment: profile.commitment,
    time_preference: profile.timePreference,
    onboarding_complete: profile.onboardingComplete,
    bio: profile.bio || "",
    instagram_handle: profile.instagramHandle || "",
    is_public: profile.isPublic,
    referral_source: profile.referralSource || "",
    avatar_url: profile.avatarUrl || null,
  }
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: sessionLoading } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (sessionLoading) return

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) throw error

        setProfile(mapSupabaseToProfile(data))
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        setProfile(DEFAULT_PROFILE)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, sessionLoading, supabase])

  const updateProfile = async (partial: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in")

    const updated = { ...profile, ...partial } as UserProfile
    setProfile(updated)

    try {
      const { error } = await supabase
        .from("profiles")
        .update(mapProfileToSupabase(updated))
        .eq("id", user.id)

      if (error) throw error
    } catch (err) {
      console.error("Failed to update profile:", err)
      // Revert on error
      setProfile(profile)
      throw err
    }
  }

  return (
    <UserProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext)
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider")
  return ctx
}
