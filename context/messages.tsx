"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/app/context/session"

export interface Conversation {
  id: string
  otherUser: {
    id: string
    displayName: string
    avatarUrl?: string
  }
  lastMessage?: string
  lastMessageAt?: string
  unread: boolean
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

interface MessagesContextValue {
  conversations: Conversation[]
  loading: boolean
  sendMessage: (conversationId: string, content: string) => Promise<void>
  getMessages: (conversationId: string) => Promise<Message[]>
  startConversation: (otherUserId: string) => Promise<string>
  findExistingConversation: (otherUserId: string) => string | undefined
  refreshConversations: () => Promise<void>
}

const MessagesContext = createContext<MessagesContextValue | null>(null)

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: sessionLoading } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }

    try {
      // Get all conversation IDs for this user
      const { data: memberships } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id)

      if (!memberships || memberships.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const convIds = memberships.map((m: any) => m.conversation_id)

      // Get the other members of each conversation
      const { data: allMembers } = await supabase
        .from("conversation_members")
        .select("conversation_id, user_id, profiles(id, display_name, avatar_url)")
        .in("conversation_id", convIds)
        .neq("user_id", user.id)

      // Get conversations with updated_at
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, updated_at")
        .in("id", convIds)
        .order("updated_at", { ascending: false })

      // Get latest message per conversation
      const { data: latestMessages } = await supabase
        .from("messages")
        .select("conversation_id, content, created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false })

      // Build a map of latest message per conversation
      const lastMsgMap: Record<string, { content: string; created_at: string }> = {}
      for (const msg of latestMessages || []) {
        if (!lastMsgMap[msg.conversation_id]) {
          lastMsgMap[msg.conversation_id] = msg
        }
      }

      // Build a map of other user per conversation
      const otherUserMap: Record<string, any> = {}
      for (const m of allMembers || []) {
        otherUserMap[m.conversation_id] = m.profiles
      }

      const mapped: Conversation[] = (convos || [])
        .filter((c: any) => otherUserMap[c.id])
        .map((c: any) => {
          const other = otherUserMap[c.id] as any
          const lastMsg = lastMsgMap[c.id]
          return {
            id: c.id,
            otherUser: {
              id: other.id,
              displayName: other.display_name || "User",
              avatarUrl: other.avatar_url || undefined,
            },
            lastMessage: lastMsg?.content,
            lastMessageAt: lastMsg?.created_at || c.updated_at,
            unread: false,
          }
        })

      setConversations(mapped)
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (sessionLoading) return
    fetchConversations()
  }, [sessionLoading, fetchConversations])

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user) throw new Error("No user logged in")

    const { error } = await supabase
      .from("messages")
      .insert([{ conversation_id: conversationId, sender_id: user.id, content }])

    if (error) throw error

    // Update local state
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
          : c
      ).sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
    )
  }, [user, supabase])

  const getMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return (data || []).map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      content: m.content,
      createdAt: m.created_at,
    }))
  }, [supabase])

  const findExistingConversation = useCallback((otherUserId: string): string | undefined => {
    return conversations.find((c) => c.otherUser.id === otherUserId)?.id
  }, [conversations])

  const startConversation = useCallback(async (otherUserId: string): Promise<string> => {
    if (!user) throw new Error("No user logged in")

    // Check if conversation already exists
    const existing = findExistingConversation(otherUserId)
    if (existing) return existing

    // Create new conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert([{}])
      .select()
      .single()

    if (convError) throw convError

    // Add both members
    const { error: memberError } = await supabase
      .from("conversation_members")
      .insert([
        { conversation_id: conv.id, user_id: user.id },
        { conversation_id: conv.id, user_id: otherUserId },
      ])

    if (memberError) throw memberError

    // Refresh conversations
    await fetchConversations()

    return conv.id
  }, [user, supabase, findExistingConversation, fetchConversations])

  return (
    <MessagesContext.Provider value={{
      conversations,
      loading,
      sendMessage,
      getMessages,
      startConversation,
      findExistingConversation,
      refreshConversations: fetchConversations,
    }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error("useMessages must be inside MessagesProvider")
  return ctx
}
