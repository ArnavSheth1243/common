"use client"

import { UserProfileProvider } from "@/app/context/user-profile"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <UserProfileProvider>{children}</UserProfileProvider>
}
