# Supabase Integration Setup

## ✅ Completed

- [x] Environment variables configured in `.env.local`
- [x] Types updated in `lib/types.ts`
- [x] Session provider created in `app/context/session.tsx`
- [x] Root layout updated to wrap `SessionProvider`
- [x] `context/user-profile.tsx` updated to use Supabase
- [x] `context/pod-state.tsx` updated to use Supabase
- [x] `context/user-stats.tsx` updated to use Supabase
- [x] `context/medals.tsx` updated to use Supabase
- [x] `lib/data.ts` simplified (removed hardcoded data)
- [x] SQL schema created

## 📋 IMMEDIATE NEXT STEP

### 1. Run the SQL Setup

1. Go to [your Supabase dashboard](https://app.supabase.com/project/maoekyujyeibqqkbrtsj)
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy the entire contents of `/Users/arnavsheth/Common/SUPABASE_SETUP.sql`
5. Paste it into the SQL Editor
6. Click **"Run"**

This creates all tables, triggers, RLS policies, and indexes.

---

## 🎯 What's Next (Not Yet Done)

The backend infrastructure is ready. Now we need to update the page components to:

1. **Dashboard** (`app/(app)/dashboard/page.tsx`)
   - Replace hardcoded `feedCheckins` with Supabase query
   - Fetch real feed from `checkins` table joined with `profiles` and `pods`
   - Update `MY_PODS` to use fetched pod memberships
   - Replace hardcoded avatar with real user initials

2. **Pods Page** (`app/(app)/pods/page.tsx`)
   - Fetch all pods from Supabase instead of static `PODS` array
   - Filter by user memberships

3. **Pod Detail** (`app/(app)/pods/[id]/page.tsx`)
   - Fetch specific pod from Supabase
   - Fetch members, recent check-ins, events, applications

4. **Checkin Page** (`app/(app)/checkin/page.tsx`)
   - Fetch user's pod memberships

5. **Profile Pages** (`app/(app)/profile/page.tsx` and `[id]/page.tsx`)
   - Fetch real profile data
   - Show real check-in history and pod memberships

6. **Calendar** (`app/(app)/calendar/page.tsx`)
   - Fetch from `calendar_events` table instead of localStorage

7. **Onboarding** (`app/onboarding/page.tsx`)
   - Ensure final step saves profile to Supabase

8. **Middleware** (`middleware.ts`)
   - Uncomment/enable auth guard to protect routes

---

## 📝 Testing Checklist

After setup, test this flow:

1. **Sign up** as a new user
   - ✓ Profil e created in Supabase
   - ✓ Redirects to `/onboarding`

2. **Complete onboarding**
   - ✓ Profile saved with interests, commitment, time preference
   - ✓ Redirects to dashboard

3. **Create a pod**
   - ✓ Pod appears in pods table
   - ✓ User added to pod_members as admin

4. **Post a check-in**
   - ✓ Check-in saved to checkins table
   - ✓ Appears in dashboard feed
   - ✓ Stats update (totalCheckins, streak)

5. **Like and comment**
   - ✓ Like persists across page refresh
   - ✓ Comments persist

6. **Multiple users**
   - ✓ Second user can sign up
   - ✓ Can see first user's public check-ins
   - ✓ Can join pods

---

## 🚀 How to Proceed

I can now update the page components to fetch real data from Supabase. Would you like me to:

1. **Update all pages at once** (comprehensive, one batch of changes)
2. **Update pages incrementally** (dashboard → pods → profiles → etc.)
3. **Just do the essential flows first** (auth → dashboard → pod creation → check-in)

Let me know when you've run the SQL and are ready for the next phase!
