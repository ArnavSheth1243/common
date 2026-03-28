-- =============================================================
-- REMOVE ALL SEED DATA
-- Run this in Supabase SQL Editor to clean up fake data
-- =============================================================

DO $$
DECLARE
  seed_user_ids uuid[] := ARRAY[
    'a1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000007',
    'a1000000-0000-0000-0000-000000000008',
    'a1000000-0000-0000-0000-000000000009',
    'a1000000-0000-0000-0000-000000000010',
    'a1000000-0000-0000-0000-000000000011',
    'a1000000-0000-0000-0000-000000000012'
  ];
BEGIN
  -- Delete in reverse dependency order
  -- (CASCADE on auth.users will handle most of it)

  -- Delete seed pods (cascade will remove pod_members, checkins, events, etc.)
  DELETE FROM pods WHERE id::text LIKE 'b2000000-0000-0000-0000-%';

  -- Delete seed auth users (cascade will remove profiles, remaining references)
  DELETE FROM auth.identities WHERE user_id = ANY(seed_user_ids);
  DELETE FROM auth.users WHERE id = ANY(seed_user_ids);

  RAISE NOTICE 'All seed data removed successfully!';
END $$;
