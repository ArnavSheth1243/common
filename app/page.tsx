"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Users, CheckCircle, Fire } from "@phosphor-icons/react"

export default function WelcomePage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#ede9df] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        {/* Logo */}
        <div
          className="flex items-center gap-2 mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)" }}
        >
          <img src="/logo.svg" alt="Common" className="w-8 h-8" />
          <span className="text-xl font-bold text-zinc-900 tracking-tight">Common</span>
        </div>

        {/* Hero */}
        <div
          className="transition-all duration-700 delay-100"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] font-bold text-zinc-900 tracking-tight leading-[1.1] mb-5">
            <span className="block">Your solution to</span>
            <span className="block text-amber-500">Accountability</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-500 leading-relaxed max-w-[38ch] mx-auto mb-12">
            Join a pod of 3-7 people. Check in daily. The group keeps you going.
          </p>
        </div>

        {/* CTA */}
        <div
          className="transition-all duration-700 delay-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          <Link
            href="/auth?tab=signup"
            className="inline-flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.2)] active:scale-[0.98]"
          >
            Get Started — it&apos;s free
            <ArrowRight size={17} weight="bold" />
          </Link>
          <p className="text-sm text-zinc-400 mt-5">
            Already have an account?{" "}
            <Link href="/auth" className="text-zinc-600 font-semibold hover:text-amber-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* How it works */}
        <div
          className="mt-20 w-full transition-all duration-700 delay-500"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-8">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Users size={22} weight="duotone" className="text-zinc-900" />
              </div>
              <p className="text-sm font-semibold text-zinc-800">Join a pod</p>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-[24ch]">
                Small groups pursuing the same goal. Running, reading, coding — anything.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <CheckCircle size={22} weight="duotone" className="text-zinc-900" />
              </div>
              <p className="text-sm font-semibold text-zinc-800">Check in daily</p>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-[24ch]">
                10 seconds. Say what you did. Your pod sees it — and when you don&apos;t.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Fire size={22} weight="duotone" className="text-amber-500" />
              </div>
              <p className="text-sm font-semibold text-zinc-800">Build streaks</p>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-[24ch]">
                Stay consistent. Your streak is public. Quitting means letting people down.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
