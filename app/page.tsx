"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { useScreenSize } from "@/components/hooks/use-screen-size"

export default function WelcomePage() {
  const [visible, setVisible] = useState(false)
  const screenSize = useScreenSize()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

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

        {/* Headline */}
        <div
          className="transition-all duration-700 delay-100"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
        >
<h1 className="text-[42px] md:text-[64px] font-bold text-zinc-900 tracking-tight leading-[1.05] mb-5 max-w-[16ch] mx-auto">
            Whatever you&apos;re looking for, we&apos;ve got a pod for you.
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
