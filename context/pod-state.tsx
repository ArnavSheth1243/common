"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/app/context/session"
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
  createdPods: CreatedPod[]
  rsvps: Record<string, Record<string, RsvpStatus>>
  checkins: StoredCheckin[]
}

interface PodStateContext extends PodStateData {
  loading: boolean
  isMember: (podId: string) => boolean
  joinPod: (podId: string) => Promise<void>
  postCheckin: (checkin: Omit<StoredCheckin, "id" | "postedAt">) => Promise<void>
  createPod: (pod: Omit<CreatedPod, "createdByYou">) => Promise<void>
  findPod: (podId: string) => CreatedPod | undefined
  sendApplication: (podId: string, message?: string) => Promise<void>
  hasApplied: (podId: string) => boolean
  setRsvp: (podId: string, eventId: string, status: RsvpStatus) => Promise<void>
  getRsvp: (podId: string, eventId: string) => RsvpStatus | undefined
  acceptApp: (appId: string) => Promise<void>
  declineApp: (appId: string) => Promise<void>
  reviewApp: (appId: string) => void
  isAppReviewed: (appId: string) => boolean
}

const Ctx = createContext<PodStateContext | null>(null)

const EMPTY_STATE: PodStateData = {
  joinedPodIds: [],
  createdPods: [],
  rsvps: {},
  checkins: [],
}

export function PodStateProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: sessionLoading } = useSession()
  const [state, setState] = useState<PodStateData>(EMPTY_STATE)
  const [loading, setLoading] = useState(true)
  const [reviewedApps, setReviewedApps] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Fetch user's pod memberships and created pods
  useEffect(() => {
    if (sessionLoading) return

    if (!user) {
      setState(EMPTY_STATE)
      setLoading(false)
      return
    }

    const fetchPodData = async () => {
      try {
        // Fetch pod memberships
        const { data: memberships } = await supabase
          .from("pod_members")
          .select("pod_id")
          .eq("user_id", user.id)

        const joinedIds = (memberships || []).map((m: any) => m.pod_id)

        // Fetch created pods
        const { data: created } = await supabase
          .from("pods")
          .select("*")
          .eq("created_by", user.id)

        // Fetch user's checkins
        const { data: checkins } = await supabase
          .from("checkins")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        setState({
          joinedPodIds: joinedIds,
          createdPods: (created || []).map((p: any) => ({
            ...p,
            createdByYou: true,
            podMembers: [],
            recentCheckins: [],
          })),
          rsvps: {},
          checkins: (checkins || []).map((c: any) => ({
            id: c.id,
            podId: c.pod_id,
            content: c.content,
            visibility: c.visibility,
            streakCount: c.streak_count,
            postedAt: c.created_at,
            photo: c.image_url,
          })),
        })
      } catch (err) {
        console.error("Failed to fetch pod data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPodData()
  }, [user, sessionLoading, supabase])

  const isMember = useCallback((podId: string) =>
    state.joinedPodIds.includes(podId) ||
    state.createdPods.some((p) => p.id === podId),
    [state.joinedPodIds, state.createdPods]
  )

  const joinPod = useCallback(async (podId: string) => {
    if (!user) throw new Error("No user logged in")

    try {
      const { error } = await supabase
        .from("pod_members")
        .insert([{ pod_id: podId, user_id: user.id }])

      if (error) throw error

      setState((prev) => ({
        ...prev,
        joinedPodIds: [...new Set([...prev.joinedPodIds, podId])],
      }))
    } catch (err) {
      console.error("Failed to join pod:", err)
      throw err
    }
  }, [user, supabase])

  const postCheckin = useCallback(async (checkin: Omit<StoredCheckin, "id" | "postedAt">) => {
    if (!user) throw new Error("No user logged in")

    try {
      const { data, error } = await supabase
        .from("checkins")
        .insert([{
          pod_id: checkin.podId,
          user_id: user.id,
          content: checkin.content,
          visibility: checkin.visibility,
          streak_count: checkin.streakCount,
          image_url: checkin.photo || null,
        }])
        .select()
        .single()

      if (error) throw error

      const newCheckin: StoredCheckin = {
        id: data.id,
        podId: data.pod_id,
        content: data.content,
        visibility: data.visibility,
        streakCount: data.streak_count,
        postedAt: data.created_at,
        photo: data.image_url,
      }

      setState((prev) => ({
        ...prev,
        checkins: [newCheckin, ...prev.checkins],
      }))
    } catch (err) {
      console.error("Failed to post checkin:", err)
      throw err
    }
  }, [user, supabase])

  const createPod = useCallback(async (pod: Omit<CreatedPod, "createdByYou">) => {
    if (!user) throw new Error("No user logged in")

    try {
      const { data: created, error: podError } = await supabase
        .from("pods")
        .insert([{
          name: pod.name,
          description: pod.description,
          type: pod.type,
          category: pod.category,
          cadence: pod.cadence,
          visibility: pod.visibility,
          location: pod.location,
          max_members: pod.maxMembers || null,
          image_url: (pod as any).imageUrl || null,
          created_by: user.id,
        }])
        .select()
        .single()

      if (podError) throw podError

      // Add creator as admin member
      await supabase
        .from("pod_members")
        .insert([{
          pod_id: created.id,
          user_id: user.id,
          is_admin: true,
        }])

      const newPod: CreatedPod = {
        ...pod,
        id: created.id,
        createdByYou: true,
        podMembers: [],
        recentCheckins: [],
      }

      setState((prev) => ({
        ...prev,
        createdPods: [newPod, ...prev.createdPods],
        joinedPodIds: [...new Set([...prev.joinedPodIds, created.id])],
      }))
    } catch (err) {
      console.error("Failed to create pod:", err)
      throw err
    }
  }, [user, supabase])

  const findPod = useCallback((podId: string): CreatedPod | undefined => {
    return state.createdPods.find((p) => p.id === podId)
  }, [state.createdPods])

  const [appliedPodIds, setAppliedPodIds] = useState<Set<string>>(new Set())

  // Fetch applied pods on mount
  useEffect(() => {
    if (!user) return
    const fetchApplied = async () => {
      const { data } = await supabase
        .from("pod_applications")
        .select("pod_id")
        .eq("user_id", user.id)
      if (data) {
        setAppliedPodIds(new Set(data.map((a: any) => a.pod_id)))
      }
    }
    fetchApplied()
  }, [user, supabase])

  const sendApplication = useCallback(async (podId: string, message?: string) => {
    if (!user) throw new Error("No user logged in")

    try {
      const { error } = await supabase
        .from("pod_applications")
        .insert([{ pod_id: podId, user_id: user.id, message: message || null }])

      if (error) throw error

      setAppliedPodIds((prev) => new Set([...Array.from(prev), podId]))
    } catch (err) {
      console.error("Failed to send application:", err)
      throw err
    }
  }, [user, supabase])

  const hasApplied = useCallback((podId: string) => {
    return appliedPodIds.has(podId)
  }, [appliedPodIds])

  const setRsvp = useCallback(async (podId: string, eventId: string, status: RsvpStatus) => {
    if (!user) throw new Error("No user logged in")

    try {
      await supabase
        .from("event_rsvps")
        .upsert([{ event_id: eventId, user_id: user.id, status }])

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
    } catch (err) {
      console.error("Failed to set RSVP:", err)
      throw err
    }
  }, [user, supabase])

  const getRsvp = useCallback((podId: string, eventId: string): RsvpStatus | undefined => {
    return state.rsvps[podId]?.[eventId]
  }, [state.rsvps])

  const acceptApp = useCallback(async (appId: string) => {
    try {
      // Get the application details first
      const { data: app } = await supabase
        .from("pod_applications")
        .select("pod_id, user_id")
        .eq("id", appId)
        .single()

      if (!app) throw new Error("Application not found")

      // Update application status
      await supabase
        .from("pod_applications")
        .update({ status: "accepted" })
        .eq("id", appId)

      // Add user to pod_members (trigger will update member_count)
      await supabase
        .from("pod_members")
        .insert([{ pod_id: app.pod_id, user_id: app.user_id }])
    } catch (err) {
      console.error("Failed to accept application:", err)
      throw err
    }
  }, [supabase])

  const declineApp = useCallback(async (appId: string) => {
    try {
      await supabase
        .from("pod_applications")
        .update({ status: "declined" })
        .eq("id", appId)
    } catch (err) {
      console.error("Failed to decline application:", err)
      throw err
    }
  }, [supabase])

  const reviewApp = useCallback((appId: string) => {
    setReviewedApps((prev) => new Set([...prev, appId]))
  }, [])

  const isAppReviewed = useCallback((appId: string) => {
    return reviewedApps.has(appId)
  }, [reviewedApps])

  return (
    <Ctx.Provider value={{
      ...state,
      loading,
      isMember,
      joinPod,
      postCheckin,
      createPod,
      findPod,
      sendApplication,
      hasApplied,
      setRsvp,
      getRsvp,
      acceptApp,
      declineApp,
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
