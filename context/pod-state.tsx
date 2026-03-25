"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { MY_POD_IDS } from "@/lib/data"
import type { RsvpStatus, Pod } from "@/lib/data"

export type CreatedPod = Omit<Pod, "podMembers" | "recentCheckins" | "events" | "pendingApplications"> & {
  createdByYou: true
  podMembers: Pod["podMembers"]
  recentCheckins: Pod["recentCheckins"]
}

export interface StoredCheckin {
  id: string
  podId: string
  content: string
  visibility: "public" | "pod" | "private"
  streakCount: number
  postedAt: string   // ISO date string
  photo?: string     // base64 data URL
}

interface PodStateData {
  joinedPodIds: string[]
  acceptedApps: Record<string, string[]>   // podId → acceptedAppIds[]
  declinedApps: Record<string, string[]>   // podId → declinedAppIds[]
  rsvps: Record<string, Record<string, RsvpStatus>>  // podId → eventId → status
  checkins: StoredCheckin[]
  createdPods: CreatedPod[]
  sentApplications: string[]               // podIds user has applied to
  reviewedApps: Record<string, string[]>   // podId → dismissed appIds (accepted or declined)
}

interface PodStateContext extends PodStateData {
  isMember: (podId: string) => boolean
  joinPod: (podId: string) => void
  acceptApp: (podId: string, appId: string) => void
  declineApp: (podId: string, appId: string) => void
  setRsvp: (podId: string, eventId: string, status: RsvpStatus) => void
  getRsvp: (podId: string, eventId: string) => RsvpStatus | undefined
  isAppAccepted: (podId: string, appId: string) => boolean
  isAppDeclined: (podId: string, appId: string) => boolean
  postCheckin: (checkin: Omit<StoredCheckin, "id" | "postedAt">) => void
  createPod: (pod: CreatedPod) => void
  findPod: (podId: string) => CreatedPod | undefined
  sendApplication: (podId: string) => void
  hasApplied: (podId: string) => boolean
  reviewApp: (podId: string, appId: string) => void
  isAppReviewed: (podId: string, appId: string) => boolean
}

const Ctx = createContext<PodStateContext | null>(null)

const STORAGE_KEY = "common_pod_state"

function load(): PodStateData {
  const empty: PodStateData = { joinedPodIds: [], acceptedApps: {}, declinedApps: {}, rsvps: {}, checkins: [], createdPods: [], sentApplications: [], reviewedApps: {} }
  if (typeof window === "undefined") return empty
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...empty, ...JSON.parse(raw) }
  } catch {}
  return empty
}

function save(data: PodStateData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function PodStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PodStateData>(load)

  // Persist any change to localStorage
  useEffect(() => { save(state) }, [state])

  const isMember = useCallback((podId: string) =>
    MY_POD_IDS.includes(podId) ||
    state.joinedPodIds.includes(podId) ||
    state.createdPods.some((p) => p.id === podId),
    [state.joinedPodIds, state.createdPods]
  )

  const joinPod = useCallback((podId: string) => {
    setState((prev) => {
      if (prev.joinedPodIds.includes(podId)) return prev
      return { ...prev, joinedPodIds: [...prev.joinedPodIds, podId] }
    })
  }, [])

  const acceptApp = useCallback((podId: string, appId: string) => {
    setState((prev) => ({
      ...prev,
      acceptedApps: {
        ...prev.acceptedApps,
        [podId]: [...(prev.acceptedApps[podId] ?? []), appId],
      },
      // Remove from declined if re-reviewed
      declinedApps: {
        ...prev.declinedApps,
        [podId]: (prev.declinedApps[podId] ?? []).filter((id) => id !== appId),
      },
    }))
  }, [])

  const declineApp = useCallback((podId: string, appId: string) => {
    setState((prev) => ({
      ...prev,
      declinedApps: {
        ...prev.declinedApps,
        [podId]: [...(prev.declinedApps[podId] ?? []), appId],
      },
      acceptedApps: {
        ...prev.acceptedApps,
        [podId]: (prev.acceptedApps[podId] ?? []).filter((id) => id !== appId),
      },
    }))
  }, [])

  const setRsvp = useCallback((podId: string, eventId: string, status: RsvpStatus) => {
    setState((prev) => ({
      ...prev,
      rsvps: {
        ...prev.rsvps,
        [podId]: {
          ...(prev.rsvps[podId] ?? {}),
          [eventId]: status,
        },
      },
    }))
  }, [])

  const getRsvp = useCallback((podId: string, eventId: string): RsvpStatus | undefined => {
    return state.rsvps[podId]?.[eventId]
  }, [state.rsvps])

  const isAppAccepted = useCallback((podId: string, appId: string) =>
    (state.acceptedApps[podId] ?? []).includes(appId), [state.acceptedApps])

  const isAppDeclined = useCallback((podId: string, appId: string) =>
    (state.declinedApps[podId] ?? []).includes(appId), [state.declinedApps])

  const postCheckin = useCallback((checkin: Omit<StoredCheckin, "id" | "postedAt">) => {
    setState((prev) => ({
      ...prev,
      checkins: [
        { ...checkin, id: `ci_${Date.now()}`, postedAt: new Date().toISOString() },
        ...prev.checkins,
      ],
    }))
  }, [])

  const createPod = useCallback((pod: CreatedPod) => {
    setState((prev) => ({
      ...prev,
      createdPods: [pod, ...prev.createdPods],
    }))
  }, [])

  const findPod = useCallback((podId: string): CreatedPod | undefined => {
    return state.createdPods.find((p) => p.id === podId)
  }, [state.createdPods])

  const sendApplication = useCallback((podId: string) => {
    setState((prev) => {
      if (prev.sentApplications.includes(podId)) return prev
      return { ...prev, sentApplications: [...prev.sentApplications, podId] }
    })
  }, [])

  const hasApplied = useCallback((podId: string) =>
    state.sentApplications.includes(podId), [state.sentApplications])

  const reviewApp = useCallback((podId: string, appId: string) => {
    setState((prev) => ({
      ...prev,
      reviewedApps: {
        ...prev.reviewedApps,
        [podId]: [...(prev.reviewedApps[podId] ?? []), appId],
      },
    }))
  }, [])

  const isAppReviewed = useCallback((podId: string, appId: string) =>
    (state.reviewedApps[podId] ?? []).includes(appId), [state.reviewedApps])

  return (
    <Ctx.Provider value={{
      ...state,
      isMember,
      joinPod,
      acceptApp,
      declineApp,
      setRsvp,
      getRsvp,
      isAppAccepted,
      isAppDeclined,
      postCheckin,
      createPod,
      findPod,
      sendApplication,
      hasApplied,
      reviewApp,
      isAppReviewed,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function usePodState() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("usePodState must be inside PodStateProvider")
  return ctx
}
