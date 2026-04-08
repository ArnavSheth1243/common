"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

// ─── Data ────────────────────────────────────────────────────────────────────

const ACTIVITIES = [
  "run",
  "read",
  "cook",
  "meditate",
  "journal",
  "lift weights",
  "swim",
  "study",
  "draw",
  "write",
  "stretch",
  "walk",
  "code",
  "practice guitar",
  "do yoga",
  "meal prep",
  "learn a language",
  "paint",
  "rock climb",
  "cycle",
  "hike",
  "practice piano",
  "cold plunge",
  "wake up early",
  "go screen-free",
  "dance",
  "do breathwork",
  "garden",
  "volunteer",
  "practice mindfulness",
  "play pickleball",
  "play tennis",
  "shoot hoops",
  "play soccer",
  "play golf",
  "play volleyball",
  "do martial arts",
  "go climbing",
  "go surfing",
  "go skating",
  "dance",
]

const CADENCES = [
  "every morning",
  "3\u00d7 a week",
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
  "4\u00d7 a week",
  "every night",
  "on Saturdays",
  "twice a month",
  "every lunchtime",
  "before bed",
  "on rest days",
  "every Friday",
]

// ─── Rotator ─────────────────────────────────────────────────────────────────

function TextRotator({
  items,
  intervalMs,
  initialDelay = 0,
  className,
}: {
  items: string[]
  intervalMs: number
  initialDelay?: number
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const tick = () => {
      setIsTransitioning(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length)
        setIsTransitioning(false)
      }, 300)
    }

    const delayId = setTimeout(() => {
      tick()
      intervalRef.current = setInterval(tick, intervalMs)
    }, initialDelay)

    return () => {
      clearTimeout(delayId)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [items.length, intervalMs, initialDelay, prefersReducedMotion])

  return (
    <span
      ref={containerRef}
      className={`inline-block transition-all duration-500 ease-in-out ${
        isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      } ${className ?? ""}`}
      aria-hidden="true"
    >
      {items[index]}
    </span>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

  const srText = "Find people to run with every morning"

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Subtle drifting color orbs — soft, slow, screenshot-friendly */}
      <div className="orb orb-1 absolute top-[-15%] left-[-10%] w-[640px] h-[640px] bg-blue-300/35 rounded-full blur-3xl pointer-events-none" />
      <div className="orb orb-2 absolute top-[-10%] right-[-15%] w-[560px] h-[560px] bg-indigo-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="orb orb-3 absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="orb orb-4 absolute bottom-[-15%] right-[-5%] w-[580px] h-[580px] bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)" }}
        >
          <img src="/logo.svg" alt="Common" className="w-8 h-8" />
          <span className="text-xl font-bold text-foreground tracking-tight">Common</span>
        </div>

        {/* Headline */}
        <div
          className="transition-all duration-700 delay-100"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          <p className="sr-only">{srText}</p>

          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] font-bold text-foreground tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
            Find people to
          </h1>
          <div className="flex items-baseline justify-center gap-[0.35em] text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] font-bold tracking-tight leading-[1.1] mb-5">
            <TextRotator
              items={ACTIVITIES}
              intervalMs={2800}
              className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent"
            />
            <span className="text-foreground">with</span>
            <TextRotator
              items={CADENCES}
              intervalMs={2800}
              initialDelay={1400}
              className="text-foreground"
            />
          </div>

          <p className="text-lg text-zinc-500 leading-relaxed max-w-[38ch] mx-auto mb-12">
            Thousands of recurring activities. Pick one, join a pod, show up with real people.
          </p>
        </div>

        {/* CTA */}
        <div
          className="transition-all duration-700 delay-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          <Link
            href="/auth?tab=signup"
            className="inline-flex items-center gap-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(29,78,216,0.4)] hover:shadow-[0_8px_30px_-4px_rgba(29,78,216,0.5)] active:scale-[0.97]"
          >
            Get Started
            <ArrowRight size={17} weight="bold" />
          </Link>
          <p className="text-sm text-zinc-400 mt-5">
            Already have an account?{" "}
            <Link href="/auth" className="text-foreground font-semibold hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
