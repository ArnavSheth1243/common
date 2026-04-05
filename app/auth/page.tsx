"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeSlash, ArrowRight, ArrowLeft } from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"

type Tab = "signin" | "signup"

function AuthForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (tab === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name.trim() || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          },
        })
        if (signUpError) throw signUpError
        if (data.session) {
          window.location.href = "/onboarding"
        } else {
          setConfirmationSent(true)
          setLoading(false)
          return
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        window.location.href = "/dashboard"
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg)
      setLoading(false)
    }
  }

  const handleGoogleSSO = async () => {
    setError(null)
    const { error: ssoError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (ssoError) setError(ssoError.message)
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email above first, then click Forgot password.")
      return
    }
    setForgotLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setForgotLoading(false)
    if (resetError) setError(resetError.message)
    else setForgotSent(true)
  }

  if (confirmationSent) {
    return (
      <div className="w-full max-w-sm text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <div className="bg-white border border-zinc-100 rounded-3xl p-8">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ArrowRight size={28} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">Check your email</h2>
          <p className="text-sm text-zinc-500 mb-4">
            We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>.
            Click the link in the email to activate your account.
          </p>
          <p className="text-xs text-zinc-400">
            Didn&apos;t get it? Check your spam folder or{" "}
            <button
              onClick={() => { setConfirmationSent(false); setTab("signup") }}
              className="text-violet-600 font-semibold hover:text-violet-700"
            >
              try again
            </button>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      {/* Tab switcher */}
      <div className="flex bg-zinc-100 rounded-full p-1 mb-8">
        <button
          onClick={() => { setTab("signin"); setError(null) }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
            tab === "signin"
              ? "bg-white text-foreground shadow-sm"
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => { setTab("signup"); setError(null) }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
            tab === "signup"
              ? "bg-white text-foreground shadow-sm"
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Create account
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
          {tab === "signin" ? "Welcome back." : "Get started."}
        </h1>
        <p className="text-sm text-zinc-500">
          {tab === "signin"
            ? "Sign in to your account to continue."
            : "Create your account and join a pod."}
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600 font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleSSO}
        className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium text-sm px-4 py-3 rounded-full transition-all duration-200 mb-6 active:scale-[0.97]"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-zinc-100" />
        <span className="text-xs text-zinc-400">or</span>
        <div className="flex-1 h-px bg-zinc-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === "signup" && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white border border-zinc-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-all"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-white border border-zinc-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-all"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-zinc-700">Password</label>
            {tab === "signin" && (
              forgotSent ? (
                <span className="text-xs text-emerald-600 font-medium">Reset email sent</span>
              ) : (
                <button
                  type="button"
                  disabled={forgotLoading}
                  onClick={handleForgotPassword}
                  className="text-xs text-zinc-400 hover:text-violet-600 transition-colors disabled:opacity-50"
                >
                  {forgotLoading ? "Sending..." : "Forgot password?"}
                </button>
              )
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === "signup" ? "At least 6 characters" : "Your password"}
              className="w-full bg-white border border-zinc-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl px-4 py-3 pr-11 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-foreground hover:opacity-90 disabled:opacity-60 text-white font-semibold text-sm px-4 py-3.5 rounded-full transition-all duration-200 active:scale-[0.97] mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {tab === "signin" ? "Sign in" : "Create account"}
              <ArrowRight size={15} weight="bold" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-400 mt-6">
        {tab === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => { setTab("signup"); setError(null) }}
              className="text-foreground font-semibold hover:text-violet-600 transition-colors"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => { setTab("signin"); setError(null) }}
              className="text-foreground font-semibold hover:text-violet-600 transition-colors"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-[100dvh] bg-white flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col w-[420px] flex-shrink-0 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-12 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full opacity-[0.06] blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-48 h-48 bg-pink-300 rounded-full opacity-[0.1] blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5 relative z-10">
          <img src="/logo.svg" alt="Common" className="w-7 h-7 brightness-0 invert" />
          <span className="text-xl font-bold text-white tracking-tight">Common</span>
        </div>

        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-4xl font-bold text-white tracking-tight leading-[1.05] mb-5">
            Find your<br />people.
          </p>
          <p className="text-white/60 leading-relaxed text-[15px] max-w-[28ch]">
            Thousands of recurring activities. Pick one, join a pod, show up together.
          </p>

          <div className="mt-10 space-y-2.5">
            {[
              { name: "Marcus R.", pod: "Morning Run Club",  streak: "12w", bg: "bg-white",      fg: "text-violet-600" },
              { name: "Priya K.",  pod: "The Reader\u2019s Pod", streak: "16w", bg: "bg-pink-400",   fg: "text-white" },
              { name: "Jordan L.", pod: "Morning Run Club",  streak: "10w", bg: "bg-violet-300", fg: "text-white" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.08] border border-white/[0.12] rounded-2xl px-4 py-3">
                <div className={`w-8 h-8 rounded-full ${item.bg} ${item.fg} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {item.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                  <div className="text-xs text-white/40 truncate">{item.pod}</div>
                </div>
                <div className="text-xs font-bold text-white/70">{item.streak}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} Common.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-white">
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <img src="/logo.svg" alt="Common" className="w-6 h-6" />
          <span className="text-lg font-bold text-foreground tracking-tight">Common</span>
        </div>

        <Suspense fallback={
          <div className="w-full max-w-sm flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-zinc-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        }>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  )
}
