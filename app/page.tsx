"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { useScreenSize } from "@/components/hooks/use-screen-size"

// ─── Data ────────────────────────────────────────────────────────────────────
// Extend these arrays to 200+ items — they're designed to be CMS-replaceable.

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

// ─── Rotator ─────────────────────────────────────────────────────────────────
// Single orchestrator: one tick every 2s, alternates activity ↔ cadence.

const TICK_MS = 2000

function useAlternatingRotator() {
  const [activityIdx, setActivityIdx] = useState(0)
  const [cadenceIdx, setCadenceIdx] = useState(0)
  const [fadingSlot, setFadingSlot] = useState<"none" | "activity" | "cadence">("none")
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const tickRef = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const id = setInterval(() => {
      const isActivity = tickRef.current % 2 === 0
      tickRef.current++

      // Fade out
      setFadingSlot(isActivity ? "activity" : "cadence")

      // Swap text mid-fade, then fade back in
      setTimeout(() => {
        if (isActivity) {
          setActivityIdx((i) => (i + 1) % ACTIVITIES.length)
        } else {
          setCadenceIdx((i) => (i + 1) % CADENCES.length)
        }
        setFadingSlot("none")
      }, 200)
    }, TICK_MS)

    return () => clearInterval(id)
  }, [prefersReducedMotion])

  return {
    activityText: ACTIVITIES[activityIdx],
    cadenceText: CADENCES[cadenceIdx],
    activityFading: fadingSlot === "activity",
    cadenceFading: fadingSlot === "cadence",
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

  // Static fallback text for screen readers
  const srText = "I'm looking for people to run with every morning"

  return (
    <div className="min-h-[100dvh] bg-[#ede9df] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Pixel trail — full screen interactive layer */}
      <PixelTrail
        pixelSize={screenSize.lessThan("md") ? 40 : 64}
        fadeDuration={0}
        delay={900}
        pixelClassName="rounded-full bg-amber-400/60"
      />

      {/* Content — above the trail */}
      <div className="relative z-10 pointer-events-none flex flex-col items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)" }}
        >
          <img src="/logo.svg" alt="Common" className="w-8 h-8" />
          <span className="text-xl font-bold text-zinc-900 tracking-tight">Common</span>
        </div>

        {/* ── New Headline ── */}
        <div
          className="transition-all duration-700 delay-100"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          {/* Screen-reader-only static sentence */}
          <p className="sr-only">{srText}</p>

          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] font-bold text-zinc-900 tracking-tight leading-[1.1] mb-5 max-w-4xl mx-auto">
            <span className="block">I&apos;m looking for people to</span>
            <span className="flex items-baseline whitespace-nowrap">
              <span className="flex-1 text-right">
                <span
                  className={`inline-block text-amber-500 transition-all duration-[400ms] ease-spring ${
                    activityFading ? "opacity-0 translate-y-1.5" : "opacity-100 translate-y-0"
                  }`}
                  aria-hidden="true"
                >
                  {activityText}
                </span>
              </span>
              <span className="shrink-0">&nbsp;</span>
              <span className="flex-1 text-left">
                <span
                  className={`inline-block text-forest-500 transition-all duration-[400ms] ease-spring ${
                    cadenceFading ? "opacity-0 translate-y-1.5" : "opacity-100 translate-y-0"
                  }`}
                  aria-hidden="true"
                >
                  {cadenceText}
                </span>
              </span>
            </span>
          </h1>


          <p className="text-lg text-zinc-500 leading-relaxed max-w-[34ch] mx-auto mb-12">
            Join a pod, pursue your passions together.
          </p>
        </div>

        {/* CTA — needs pointer-events back */}
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
