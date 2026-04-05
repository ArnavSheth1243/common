"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

// ─── Data ────────────────────────────────────────────────────────────────────
// Extend these arrays to 200+ items — they're designed to be CMS-replaceable.

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

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Rotate through items with optional initial delay for staggering
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

  // Static fallback text for screen readers
  const srText = "Find people to run with every morning"

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)" }}
        >
          <img src="/logo.svg" alt="Common" className="w-8 h-8" />
          <span className="text-xl font-bold text-foreground tracking-tight">Common</span>
        </div>

        {/* ── New Headline ── */}
        <div
          className="transition-all duration-700 delay-100"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
          {/* Screen-reader-only static sentence */}
          <p className="sr-only">{srText}</p>

          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] font-bold text-foreground tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
            Find people to
          </h1>
          <div className="flex items-baseline justify-center gap-[0.35em] text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] font-bold tracking-tight leading-[1.1] mb-5">
            <TextRotator
              items={ACTIVITIES}
              intervalMs={2800}
              className="text-primary"
            />
            <span className="text-foreground">with</span>
            <TextRotator
              items={CADENCES}
              intervalMs={2800}
              initialDelay={1400}
              className="text-success"
            />
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-[38ch] mx-auto mb-12">
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
            className="inline-flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-150 shadow-2 active:scale-[0.98]"
          >
            Get Started
            <ArrowRight size={17} weight="bold" />
          </Link>
          <p className="text-sm text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link href="/auth" className="text-foreground font-semibold hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
