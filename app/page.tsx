"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { useScreenSize } from "@/components/hooks/use-screen-size"

// ─── Data ────────────────────────────────────────────────────────────────────

const ACTIVITIES = [
  "run with",
  "read with",
  "cook with",
  "meditate with",
  "journal with",
  "lift weights with",
  "swim with",
  "study with",
  "draw with",
  "write with",
  "stretch with",
  "walk with",
  "code with",
  "practice guitar with",
  "do yoga with",
  "meal prep with",
  "learn a language with",
  "paint with",
  "rock climb with",
  "cycle with",
  "hike with",
  "practice piano with",
  "cold plunge with",
  "wake up early with",
  "go screen-free with",
  "dance with",
  "do breathwork with",
  "garden with",
  "volunteer with",
  "practice mindfulness with",
]

const CADENCES = [
  "every morning",
  "3× a week",
  "daily",
  "every evening",
  "on weekends",
  "twice a week",
  "every other day",
  "once a week",
  "every weekday",
  "5 days a week",
  "before work",
  "after work",
  "on Sundays",
  "once a month",
  "every Monday",
  "at sunrise",
  "4× a week",
  "every night",
  "on Saturdays",
  "twice a month",
  "every lunchtime",
  "before bed",
  "on rest days",
  "every Friday",
]

// ─── Orchestrator ────────────────────────────────────────────────────────────
// Single timer. Every 2s one slot changes: activity → cadence → activity → …
// Simple fade: out 300ms → swap text → in 300ms. One layer, no overlays.

const TICK_MS = 2000
const FADE_OUT_MS = 300

function useAlternatingRotator() {
  const [activityIdx, setActivityIdx] = useState(0)
  const [cadenceIdx, setCadenceIdx] = useState(0)
  const [fading, setFading] = useState<"none" | "activity" | "cadence">("none")
  const tickRef = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) return

    const id = setInterval(() => {
      const slot = tickRef.current % 2 === 0 ? "activity" : "cadence"
      tickRef.current++

      // Phase 1: fade out
      setFading(slot)

      // Phase 2: swap text + fade in (after fade-out completes)
      setTimeout(() => {
        if (slot === "activity") {
          setActivityIdx((i) => (i + 1) % ACTIVITIES.length)
        } else {
          setCadenceIdx((i) => (i + 1) % CADENCES.length)
        }
        setFading("none")
      }, FADE_OUT_MS)
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])

  return {
    activityText: ACTIVITIES[activityIdx],
    cadenceText: CADENCES[cadenceIdx],
    activityFading: fading === "activity",
    cadenceFading: fading === "cadence",
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  const [visible, setVisible] = useState(false)
  const screenSize = useScreenSize()
  const { activityText, cadenceText, activityFading, cadenceFading } = useAlternatingRotator()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#ede9df] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <PixelTrail
        pixelSize={screenSize.lessThan("md") ? 40 : 64}
        fadeDuration={0}
        delay={900}
        pixelClassName="rounded-full bg-amber-400/60"
      />

      <div className="relative z-10 pointer-events-none flex flex-col items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)" }}
        >
          <img src="/logo.svg" alt="Common" className="w-8 h-8" />
          <span className="text-xl font-bold text-zinc-900 tracking-tight">Common</span>
        </div>

        {/* Headline */}
        <div
          className="transition-all duration-700 delay-100"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          <p className="sr-only">I&apos;m looking for people to run with every morning</p>

          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] font-bold text-zinc-900 tracking-tight leading-[1.1] mb-5 max-w-4xl mx-auto">
            <span className="block">Your solution to</span>
            <span className="block text-amber-500">Accountability</span>
          </h1>

          <p className="text-lg text-zinc-500 leading-relaxed max-w-[34ch] mx-auto mb-12">
            Join a pod, pursue your passions together.
          </p>
        </div>

        {/* CTA */}
        <div
          className="pointer-events-auto transition-all duration-700 delay-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          <Link
            href="/auth?tab=signup"
            className="inline-flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.2)] active:scale-[0.98]"
          >
            Get Started
            <ArrowRight size={17} weight="bold" />
          </Link>
          <p className="text-sm text-zinc-400 mt-5">
            Already have an account?{" "}
            <Link href="/auth" className="text-zinc-600 font-semibold hover:text-amber-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
