# Common app

This is the Common app, a social accountability app built around Pods.

## Core product
- Users can create and join Pods
- Users have profiles
- Users can check in and build streaks
- Users can view feeds, posts, likes, and comments
- Users can browse pods and open pod pages
- Users can navigate between member profiles

## Non-negotiables
- Every button must work
- No fake UI
- Navigation must always work correctly
- Back buttons must work
- State must update accurately
- Check-in counts, streaks, and best streak must be correct
- Likes, comments, and profile links must function
- All data must be real (no mock or placeholder data)
- Do not break existing working features

## Supabase + Data Requirements (CRITICAL)
- All data must come from Supabase (no local-only or hardcoded state)
- All writes (create/update/delete) must persist correctly to Supabase
- UI must reflect database changes immediately after actions
- No stale data: after any action, data must re-fetch or update correctly
- Use proper state management so UI stays in sync with backend
- Ensure real-time or near real-time updates where appropriate (e.g., check-ins, posts, likes, joins)
- Auth/session must be fully synced with Supabase auth across routes
- Handle loading, success, and error states properly for all Supabase calls
- Do not simulate success — only show updates after confirmed DB writes

## How to work
When I ask for changes:
1. Audit the relevant flow first
2. Find root cause
3. Implement clean fix
4. Keep changes minimal and safe
5. Ensure frontend and Supabase stay in sync
6. Tell me exactly what was changed

## Current priorities
- Fix broken buttons and dead flows
- Make pod pages fully functional
- Make member profiles clickable
- Make auth/session flow work properly
- Ensure all Supabase data flows are fully connected and updating correctly
- Make app feel production-ready