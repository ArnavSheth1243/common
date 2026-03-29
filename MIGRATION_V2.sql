-- ============================================================
-- MIGRATION V2: Fix "Database error saving new user" on signup
-- ============================================================
-- Run this ENTIRE script in Supabase SQL Editor:
-- https://app.supabase.com/project/maoekyujyeibqqkbrtsj/sql/new
-- ============================================================

-- STEP 1: Replace trigger function with robust version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(SPLIT_PART(NEW.email, '@', 1), ''),
      'User'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user failed for user %: % (SQLSTATE %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- STEP 2: Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Ensure RLS + policies are correct
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- STEP 4: Ensure grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- STEP 5: Backfill any orphaned auth users that signed up but have no profile
INSERT INTO public.profiles (id, display_name)
SELECT
  au.id,
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'display_name'), ''),
    NULLIF(SPLIT_PART(au.email, '@', 1), ''),
    'User'
  )
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
