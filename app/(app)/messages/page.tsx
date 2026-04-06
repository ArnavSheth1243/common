"use client"

import Link from "next/link"
import { ChatCircle } from "@phosphor-icons/react"
import { useMessages } from "@/app/context/messages"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

export default function MessagesPage() {
  const { conversations, loading } = useMessages()

  return (
    <div className="max-w-xl mx-auto px-5 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-zinc-900 tracking-tight mb-6">Messages</h1>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-20">
          <ChatCircle size={40} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 mb-1">No messages yet</p>
          <p className="text-xs text-zinc-400">
            Visit a member&apos;s profile and tap &quot;Message&quot; to start a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-3 bg-white border border-zinc-100 rounded-2xl p-4 hover:border-zinc-200 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {getInitials(conv.otherUser.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-900 truncate">
                    {conv.otherUser.displayName}
                  </span>
                  {conv.lastMessageAt && (
                    <span className="text-[11px] text-zinc-400 flex-shrink-0">
                      {timeAgo(conv.lastMessageAt)}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{conv.lastMessage}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
