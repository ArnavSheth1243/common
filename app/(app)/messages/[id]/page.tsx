"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { ArrowLeft, PaperPlaneRight } from "@phosphor-icons/react"
import { useSession } from "@/app/context/session"
import { useMessages, type Message } from "@/app/context/messages"

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  if (isToday) return time
  if (isYesterday) return `Yesterday ${time}`
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const { user } = useSession()
  const { conversations, getMessages, sendMessage, markConversationRead } = useMessages()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const conv = conversations.find((c) => c.id === conversationId)
  const otherName = conv?.otherUser.displayName || "User"

  // Fetch messages
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const msgs = await getMessages(conversationId)
        if (!cancelled) setMessages(msgs)
      } catch (err) {
        console.error("Failed to load messages:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    markConversationRead(conversationId)

    // Poll for new messages every 5s
    const interval = setInterval(async () => {
      try {
        const msgs = await getMessages(conversationId)
        if (!cancelled) setMessages(msgs)
      } catch {}
    }, 5000)

    return () => { cancelled = true; clearInterval(interval) }
  }, [conversationId, getMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending || !user) return

    setSending(true)
    try {
      await sendMessage(conversationId, trimmed)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversationId,
          senderId: user.id,
          content: trimmed,
          createdAt: new Date().toISOString(),
        },
      ])
      setText("")
      inputRef.current?.focus()
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setSending(false)
    }
  }

  const initials = otherName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <button
          onClick={() => router.push("/messages")}
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="text-sm font-semibold text-zinc-900">{otherName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-zinc-400">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMe ? "order-2" : ""}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-zinc-900 text-white rounded-br-md"
                        : "bg-white border border-zinc-100 text-zinc-800 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className={`text-[10px] text-zinc-400 mt-1 ${isMe ? "text-right" : "text-left"} px-1`}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-100 border border-zinc-200 rounded-full px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <PaperPlaneRight size={16} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
