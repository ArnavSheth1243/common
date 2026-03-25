"use client"

import { createContext, useContext, useState, useEffect } from "react"
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
}

interface UserProfileContextValue {
  profile: UserProfile
  updateProfile: (partial: Partial<UserProfile>) => void
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null)

const DEFAULT_PROFILE: UserProfile = {
  displayName: "Arnav S.",
  age: undefined,
  location: "",
  goals: [],
  interests: ["running", "reading"],
  commitment: "daily",
  timePreference: "morning",
  onboardingComplete: false,
}

const STORAGE_KEY = "common_user_profile"

function load(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_PROFILE
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(load)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)) } catch {}
  }, [profile])

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }))
  }

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext)
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider")
  return ctx
}
