import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
              )
            } catch {
              // Server Component context
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if the user has a profile, if not create one
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single()

        if (!profile) {
          const displayName = user.user_metadata?.display_name
            || user.user_metadata?.full_name
            || user.email?.split("@")[0]
            || "User"

          // Use upsert to handle race with on_auth_user_created trigger
          await supabase.from("profiles").upsert({
            id: user.id,
            display_name: displayName,
            onboarding_complete: false,
          }, { onConflict: 'id', ignoreDuplicates: true })

          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      // Check if profile has completed onboarding
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", currentUser.id)
          .single()

        if (existingProfile && !existingProfile.onboarding_complete) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error — redirect to auth page with error
  return NextResponse.redirect(`${origin}/auth?error=callback_failed`)
}
