"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Flame,
  Users,
  Lock,
  Globe,
  ChatCircle,
  Heart,
  CalendarCheck,
} from "@phosphor-icons/react"
import { MEMBER_MAP, PODS, CADENCE_LABELS } from "@/lib/data"

export default function MemberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string
  const member = MEMBER_MAP[slug]

  if (!member) {
    return (
      <div className="max-w-xl mx-auto px-5 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="text-center py-16">
          <h2 className="text-lg font-semibold text-zinc-700 mb-2">Member not found</h2>
          <p className="text-sm text-zinc-400">This profile doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Find shared pods
  const sharedPods = PODS.filter((pod) =>
    pod.podMembers.some(
      (m) =>
        !m.isYou &&
        m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "") === slug
    )
  )

  // Get all their check-ins across shared pods, sorted by newest first
  const allCheckins = sharedPods
    .flatMap((pod) =>
      pod.recentCheckins
        .filter((c) => c.author.name === member.name && c.visibility !== "private")
        .map((c) => ({ ...c, podName: pod.name, podId: pod.id, podColor: pod.memberColors[0] }))
    )

  // For mock: assume profile is public (we could add a state toggle)
  const isPublic = true // mock — would come from user settings

  return (
    <div className="max-w-xl mx-auto px-5 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Profile header */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 mb-5">
        <div className="flex items-start gap-4 mb-5">
          {/* Avatar */}
          <div
            className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center text-2xl font-bold flex-shrink-0`}
          >
            {member.initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{member.name}</h1>
              <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isPublic ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                {isPublic ? <Globe size={9} /> : <Lock size={9} />}
                {isPublic ? "Public" : "Private"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-amber-600 font-semibold mb-2">
              <Flame size={13} weight="fill" />
              <span>{member.streak} check-in streak</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <CalendarCheck size={11} />
              <span>Joined Common 2025</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-zinc-100 rounded-2xl overflow-hidden">
          <div className="bg-white px-3 py-3 text-center">
            <div className="text-lg font-bold text-zinc-900">{allCheckins.length}</div>
            <div className="text-[10px] text-zinc-400 font-medium">Posts</div>
          </div>
          <div className="bg-white px-3 py-3 text-center">
            <div className="text-lg font-bold text-zinc-900">{sharedPods.length}</div>
            <div className="text-[10px] text-zinc-400 font-medium">Pods</div>
          </div>
          <div className="bg-white px-3 py-3 text-center">
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              <Flame size={13} weight="fill" className="text-amber-500" />
              <span className="text-lg font-bold text-zinc-900">{member.streak}</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-medium">Streak</div>
          </div>
        </div>
      </div>

      {isPublic ? (
        <>
          {/* Pods section */}
          {sharedPods.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                Pods · {sharedPods.length}
              </h3>
              <div className="space-y-2">
                {sharedPods.map((pod) => (
                  <Link
                    key={pod.id}
                    href={`/pods/${pod.id}`}
                    className="flex items-center gap-3 bg-white border border-zinc-100 rounded-2xl p-3.5 hover:border-zinc-200 transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl ${pod.memberColors[0]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {pod.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-800 truncate">{pod.name}</div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span>{CADENCE_LABELS[pod.cadence]}</span>
                        <span>·</span>
                        <div className="flex items-center gap-0.5">
                          <Users size={10} />
                          <span>{pod.members}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold flex-shrink-0">
                      <Flame size={10} weight="fill" />
                      <span>{pod.streak}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Check-ins gallery */}
          {allCheckins.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                Check-ins · {allCheckins.length}
              </h3>
              <div className="space-y-3">
                {allCheckins.map((checkin) => (
                  <div
                    key={`${checkin.podId}-${checkin.id}`}
                    className="bg-white border border-zinc-100 rounded-2xl p-4"
                  >
                    {/* Pod badge + time */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Link
                        href={`/pods/${checkin.podId}`}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${checkin.podColor} text-white hover:opacity-80 transition-opacity`}
                      >
                        {checkin.podName}
                      </Link>
                      <span className="text-zinc-200">·</span>
                      <span className="text-xs text-zinc-400">{checkin.time}</span>
                    </div>
                    <p className="text-sm text-zinc-700 leading-relaxed mb-3">{checkin.content}</p>
                    <div className="flex items-center gap-4 pt-2 border-t border-zinc-50">
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Heart size={12} />
                        <span>{checkin.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <ChatCircle size={12} />
                        <span>{checkin.comments}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold ml-auto">
                        <Flame size={10} weight="fill" />
                        <span>{checkin.streakCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-400">
              <p className="text-sm">No check-ins yet</p>
            </div>
          )}
        </>
      ) : (
        /* Private profile */
        <div className="bg-white border border-zinc-100 rounded-3xl p-10 text-center">
          <Lock size={28} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 mb-1">This profile is private</p>
          <p className="text-xs text-zinc-400">Join one of the same pods to see their activity.</p>
        </div>
      )}
    </div>
  )
}
