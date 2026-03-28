-- =============================================================
-- SEED DATA FOR COMMON APP
-- Run this in Supabase SQL Editor
-- To remove: run REMOVE_SEED.sql
-- =============================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Fixed UUIDs for seed users ──────────────────────────────
-- (We use fixed UUIDs so we can reference them throughout)

DO $$
DECLARE
  u1 uuid := 'a1000000-0000-0000-0000-000000000001';
  u2 uuid := 'a1000000-0000-0000-0000-000000000002';
  u3 uuid := 'a1000000-0000-0000-0000-000000000003';
  u4 uuid := 'a1000000-0000-0000-0000-000000000004';
  u5 uuid := 'a1000000-0000-0000-0000-000000000005';
  u6 uuid := 'a1000000-0000-0000-0000-000000000006';
  u7 uuid := 'a1000000-0000-0000-0000-000000000007';
  u8 uuid := 'a1000000-0000-0000-0000-000000000008';
  u9 uuid := 'a1000000-0000-0000-0000-000000000009';
  u10 uuid := 'a1000000-0000-0000-0000-000000000010';
  u11 uuid := 'a1000000-0000-0000-0000-000000000011';
  u12 uuid := 'a1000000-0000-0000-0000-000000000012';

  -- Pod UUIDs
  p1 uuid := 'b2000000-0000-0000-0000-000000000001';
  p2 uuid := 'b2000000-0000-0000-0000-000000000002';
  p3 uuid := 'b2000000-0000-0000-0000-000000000003';
  p4 uuid := 'b2000000-0000-0000-0000-000000000004';
  p5 uuid := 'b2000000-0000-0000-0000-000000000005';
  p6 uuid := 'b2000000-0000-0000-0000-000000000006';
  p7 uuid := 'b2000000-0000-0000-0000-000000000007';
  p8 uuid := 'b2000000-0000-0000-0000-000000000008';
  p9 uuid := 'b2000000-0000-0000-0000-000000000009';
  p10 uuid := 'b2000000-0000-0000-0000-000000000010';
  p11 uuid := 'b2000000-0000-0000-0000-000000000011';
  p12 uuid := 'b2000000-0000-0000-0000-000000000012';

  -- Checkin UUIDs
  c1 uuid := 'c3000000-0000-0000-0000-000000000001';
  c2 uuid := 'c3000000-0000-0000-0000-000000000002';
  c3 uuid := 'c3000000-0000-0000-0000-000000000003';
  c4 uuid := 'c3000000-0000-0000-0000-000000000004';
  c5 uuid := 'c3000000-0000-0000-0000-000000000005';
  c6 uuid := 'c3000000-0000-0000-0000-000000000006';
  c7 uuid := 'c3000000-0000-0000-0000-000000000007';
  c8 uuid := 'c3000000-0000-0000-0000-000000000008';
  c9 uuid := 'c3000000-0000-0000-0000-000000000009';
  c10 uuid := 'c3000000-0000-0000-0000-000000000010';
  c11 uuid := 'c3000000-0000-0000-0000-000000000011';
  c12 uuid := 'c3000000-0000-0000-0000-000000000012';
  c13 uuid := 'c3000000-0000-0000-0000-000000000013';
  c14 uuid := 'c3000000-0000-0000-0000-000000000014';
  c15 uuid := 'c3000000-0000-0000-0000-000000000015';
  c16 uuid := 'c3000000-0000-0000-0000-000000000016';
  c17 uuid := 'c3000000-0000-0000-0000-000000000017';
  c18 uuid := 'c3000000-0000-0000-0000-000000000018';
  c19 uuid := 'c3000000-0000-0000-0000-000000000019';
  c20 uuid := 'c3000000-0000-0000-0000-000000000020';
  c21 uuid := 'c3000000-0000-0000-0000-000000000021';
  c22 uuid := 'c3000000-0000-0000-0000-000000000022';
  c23 uuid := 'c3000000-0000-0000-0000-000000000023';
  c24 uuid := 'c3000000-0000-0000-0000-000000000024';
  c25 uuid := 'c3000000-0000-0000-0000-000000000025';
  c26 uuid := 'c3000000-0000-0000-0000-000000000026';
  c27 uuid := 'c3000000-0000-0000-0000-000000000027';
  c28 uuid := 'c3000000-0000-0000-0000-000000000028';
  c29 uuid := 'c3000000-0000-0000-0000-000000000029';
  c30 uuid := 'c3000000-0000-0000-0000-000000000030';
  c31 uuid := 'c3000000-0000-0000-0000-000000000031';
  c32 uuid := 'c3000000-0000-0000-0000-000000000032';
  c33 uuid := 'c3000000-0000-0000-0000-000000000033';
  c34 uuid := 'c3000000-0000-0000-0000-000000000034';
  c35 uuid := 'c3000000-0000-0000-0000-000000000035';
  c36 uuid := 'c3000000-0000-0000-0000-000000000036';
  c37 uuid := 'c3000000-0000-0000-0000-000000000037';
  c38 uuid := 'c3000000-0000-0000-0000-000000000038';
  c39 uuid := 'c3000000-0000-0000-0000-000000000039';
  c40 uuid := 'c3000000-0000-0000-0000-000000000040';

  -- Event UUIDs
  e1 uuid := 'd4000000-0000-0000-0000-000000000001';
  e2 uuid := 'd4000000-0000-0000-0000-000000000002';
  e3 uuid := 'd4000000-0000-0000-0000-000000000003';
  e4 uuid := 'd4000000-0000-0000-0000-000000000004';
  e5 uuid := 'd4000000-0000-0000-0000-000000000005';
  e6 uuid := 'd4000000-0000-0000-0000-000000000006';

  -- Comment UUIDs
  cm1 uuid := 'e5000000-0000-0000-0000-000000000001';
  cm2 uuid := 'e5000000-0000-0000-0000-000000000002';
  cm3 uuid := 'e5000000-0000-0000-0000-000000000003';
  cm4 uuid := 'e5000000-0000-0000-0000-000000000004';
  cm5 uuid := 'e5000000-0000-0000-0000-000000000005';
  cm6 uuid := 'e5000000-0000-0000-0000-000000000006';
  cm7 uuid := 'e5000000-0000-0000-0000-000000000007';
  cm8 uuid := 'e5000000-0000-0000-0000-000000000008';
  cm9 uuid := 'e5000000-0000-0000-0000-000000000009';
  cm10 uuid := 'e5000000-0000-0000-0000-000000000010';
  cm11 uuid := 'e5000000-0000-0000-0000-000000000011';
  cm12 uuid := 'e5000000-0000-0000-0000-000000000012';
  cm13 uuid := 'e5000000-0000-0000-0000-000000000013';
  cm14 uuid := 'e5000000-0000-0000-0000-000000000014';
  cm15 uuid := 'e5000000-0000-0000-0000-000000000015';
  cm16 uuid := 'e5000000-0000-0000-0000-000000000016';
  cm17 uuid := 'e5000000-0000-0000-0000-000000000017';
  cm18 uuid := 'e5000000-0000-0000-0000-000000000018';
  cm19 uuid := 'e5000000-0000-0000-0000-000000000019';
  cm20 uuid := 'e5000000-0000-0000-0000-000000000020';

  hashed_pw text;
  supabase_instance_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN

  hashed_pw := crypt('seedpassword123', gen_salt('bf'));

  -- ═══════════════════════════════════════════════════════════
  -- 1. CREATE FAKE AUTH USERS
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_user_meta_data)
  VALUES
    (supabase_instance_id, u1,  'authenticated', 'authenticated', 'marcus.rivera@demo.com',    hashed_pw, now(), now() - interval '90 days', now(), '', '{"display_name":"Marcus Rivera"}'::jsonb),
    (supabase_instance_id, u2,  'authenticated', 'authenticated', 'priya.kapoor@demo.com',     hashed_pw, now(), now() - interval '85 days', now(), '', '{"display_name":"Priya Kapoor"}'::jsonb),
    (supabase_instance_id, u3,  'authenticated', 'authenticated', 'jordan.lee@demo.com',       hashed_pw, now(), now() - interval '80 days', now(), '', '{"display_name":"Jordan Lee"}'::jsonb),
    (supabase_instance_id, u4,  'authenticated', 'authenticated', 'emma.chen@demo.com',        hashed_pw, now(), now() - interval '75 days', now(), '', '{"display_name":"Emma Chen"}'::jsonb),
    (supabase_instance_id, u5,  'authenticated', 'authenticated', 'sam.okonkwo@demo.com',      hashed_pw, now(), now() - interval '70 days', now(), '', '{"display_name":"Sam Okonkwo"}'::jsonb),
    (supabase_instance_id, u6,  'authenticated', 'authenticated', 'olivia.martinez@demo.com',  hashed_pw, now(), now() - interval '65 days', now(), '', '{"display_name":"Olivia Martinez"}'::jsonb),
    (supabase_instance_id, u7,  'authenticated', 'authenticated', 'alex.kim@demo.com',         hashed_pw, now(), now() - interval '60 days', now(), '', '{"display_name":"Alex Kim"}'::jsonb),
    (supabase_instance_id, u8,  'authenticated', 'authenticated', 'noah.williams@demo.com',    hashed_pw, now(), now() - interval '55 days', now(), '', '{"display_name":"Noah Williams"}'::jsonb),
    (supabase_instance_id, u9,  'authenticated', 'authenticated', 'zara.ahmed@demo.com',       hashed_pw, now(), now() - interval '50 days', now(), '', '{"display_name":"Zara Ahmed"}'::jsonb),
    (supabase_instance_id, u10, 'authenticated', 'authenticated', 'liam.johnson@demo.com',     hashed_pw, now(), now() - interval '45 days', now(), '', '{"display_name":"Liam Johnson"}'::jsonb),
    (supabase_instance_id, u11, 'authenticated', 'authenticated', 'maya.patel@demo.com',       hashed_pw, now(), now() - interval '40 days', now(), '', '{"display_name":"Maya Patel"}'::jsonb),
    (supabase_instance_id, u12, 'authenticated', 'authenticated', 'tyler.brooks@demo.com',     hashed_pw, now(), now() - interval '35 days', now(), '', '{"display_name":"Tyler Brooks"}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- Also insert into auth.identities (required by Supabase auth)
  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (u1,  u1::text,  u1,  ('{"sub":"' || u1::text  || '","email":"marcus.rivera@demo.com"}')::jsonb,    'email', now(), now() - interval '90 days', now()),
    (u2,  u2::text,  u2,  ('{"sub":"' || u2::text  || '","email":"priya.kapoor@demo.com"}')::jsonb,     'email', now(), now() - interval '85 days', now()),
    (u3,  u3::text,  u3,  ('{"sub":"' || u3::text  || '","email":"jordan.lee@demo.com"}')::jsonb,       'email', now(), now() - interval '80 days', now()),
    (u4,  u4::text,  u4,  ('{"sub":"' || u4::text  || '","email":"emma.chen@demo.com"}')::jsonb,        'email', now(), now() - interval '75 days', now()),
    (u5,  u5::text,  u5,  ('{"sub":"' || u5::text  || '","email":"sam.okonkwo@demo.com"}')::jsonb,      'email', now(), now() - interval '70 days', now()),
    (u6,  u6::text,  u6,  ('{"sub":"' || u6::text  || '","email":"olivia.martinez@demo.com"}')::jsonb,  'email', now(), now() - interval '65 days', now()),
    (u7,  u7::text,  u7,  ('{"sub":"' || u7::text  || '","email":"alex.kim@demo.com"}')::jsonb,         'email', now(), now() - interval '60 days', now()),
    (u8,  u8::text,  u8,  ('{"sub":"' || u8::text  || '","email":"noah.williams@demo.com"}')::jsonb,    'email', now(), now() - interval '55 days', now()),
    (u9,  u9::text,  u9,  ('{"sub":"' || u9::text  || '","email":"zara.ahmed@demo.com"}')::jsonb,       'email', now(), now() - interval '50 days', now()),
    (u10, u10::text, u10, ('{"sub":"' || u10::text || '","email":"liam.johnson@demo.com"}')::jsonb,     'email', now(), now() - interval '45 days', now()),
    (u11, u11::text, u11, ('{"sub":"' || u11::text || '","email":"maya.patel@demo.com"}')::jsonb,       'email', now(), now() - interval '40 days', now()),
    (u12, u12::text, u12, ('{"sub":"' || u12::text || '","email":"tyler.brooks@demo.com"}')::jsonb,     'email', now(), now() - interval '35 days', now())
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 2. UPDATE PROFILES (trigger auto-created them)
  -- ═══════════════════════════════════════════════════════════
  UPDATE profiles SET display_name = 'Marcus Rivera',   bio = 'Runner and morning person. Building consistency one mile at a time.', age = 28, location = 'Brooklyn, NY', goals = '{fitness,mindfulness}', interests = '{running,meditation,cooking}', commitment = 'daily', time_preference = 'morning', onboarding_complete = true, is_public = true WHERE id = u1;
  UPDATE profiles SET display_name = 'Priya Kapoor',    bio = 'Bookworm and aspiring writer. 50 books a year is the goal.', age = 25, location = 'San Francisco, CA', goals = '{learning,creativity}', interests = '{reading,writing,yoga}', commitment = 'daily', time_preference = 'evening', onboarding_complete = true, is_public = true WHERE id = u2;
  UPDATE profiles SET display_name = 'Jordan Lee',      bio = 'Designer by day, guitarist by night. Trying to ship more side projects.', age = 31, location = 'Austin, TX', goals = '{creativity,productivity}', interests = '{design,music,coding}', commitment = 'daily', time_preference = 'morning', onboarding_complete = true, is_public = true WHERE id = u3;
  UPDATE profiles SET display_name = 'Emma Chen',       bio = 'Product manager learning to code. Also obsessed with bouldering.', age = 27, location = 'Seattle, WA', goals = '{learning,fitness}', interests = '{coding,climbing,photography}', commitment = 'daily', time_preference = 'afternoon', onboarding_complete = true, is_public = true WHERE id = u4;
  UPDATE profiles SET display_name = 'Sam Okonkwo',     bio = 'Entrepreneur working on my second startup. Cold plunges keep me sane.', age = 33, location = 'Miami, FL', goals = '{productivity,fitness}', interests = '{startups,cold-plunge,surfing}', commitment = 'daily', time_preference = 'morning', onboarding_complete = true, is_public = true WHERE id = u5;
  UPDATE profiles SET display_name = 'Olivia Martinez',  bio = 'Grad student in neuroscience. Meditation research is my jam.', age = 26, location = 'Boston, MA', goals = '{mindfulness,learning}', interests = '{meditation,neuroscience,journaling}', commitment = 'daily', time_preference = 'morning', onboarding_complete = true, is_public = true WHERE id = u6;
  UPDATE profiles SET display_name = 'Alex Kim',        bio = 'Full-stack dev and fitness nerd. Documenting my gym journey.', age = 29, location = 'Los Angeles, CA', goals = '{fitness,productivity}', interests = '{weightlifting,coding,nutrition}', commitment = 'daily', time_preference = 'morning', onboarding_complete = true, is_public = true WHERE id = u7;
  UPDATE profiles SET display_name = 'Noah Williams',   bio = 'Freelance photographer chasing golden hours and good coffee.', age = 30, location = 'Portland, OR', goals = '{creativity,mindfulness}', interests = '{photography,coffee,hiking}', commitment = 'weekly', time_preference = 'morning', onboarding_complete = true, is_public = true WHERE id = u8;
  UPDATE profiles SET display_name = 'Zara Ahmed',      bio = 'UX researcher and plant mom. Currently learning watercolor.', age = 24, location = 'Chicago, IL', goals = '{creativity,learning}', interests = '{art,plants,ux-research}', commitment = 'daily', time_preference = 'evening', onboarding_complete = true, is_public = true WHERE id = u9;
  UPDATE profiles SET display_name = 'Liam Johnson',    bio = 'High school teacher trying to read more and scroll less.', age = 35, location = 'Denver, CO', goals = '{learning,mindfulness}', interests = '{reading,hiking,chess}', commitment = 'daily', time_preference = 'evening', onboarding_complete = true, is_public = true WHERE id = u10;
  UPDATE profiles SET display_name = 'Maya Patel',      bio = 'Data scientist who runs ultramarathons for fun. Yes, really.', age = 28, location = 'New York, NY', goals = '{fitness,productivity}', interests = '{running,data-science,cooking}', commitment = 'daily', time_preference = 'morning', onboarding_complete = true, is_public = true WHERE id = u11;
  UPDATE profiles SET display_name = 'Tyler Brooks',    bio = 'Music producer and early bird. Making beats before breakfast.', age = 26, location = 'Nashville, TN', goals = '{creativity,productivity}', interests = '{music-production,djing,fitness}', commitment = 'daily', time_preference = 'morning', onboarding_complete = true, is_public = false WHERE id = u12;

  -- ═══════════════════════════════════════════════════════════
  -- 3. CREATE PODS (12 diverse pods)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO pods (id, name, description, type, category, cadence, visibility, location, max_members, streak, member_count, created_by, created_at) VALUES
    (p1,  '5AM Run Club',           'Early morning runners pushing each other to lace up before dawn. Rain or shine.',                         'Habit',   'fitness',      'daily',   'public',  'Brooklyn, NY',    8,  47, 6, u1,  now() - interval '80 days'),
    (p2,  'Page Turners',           'Read 1 chapter a day. Share highlights, discuss themes, expand your mind.',                                'Habit',   'learning',     'daily',   'public',  '',                10, 32, 5, u2,  now() - interval '75 days'),
    (p3,  'Ship It Sundays',        'Build and ship a small project every week. No excuses, no perfection.',                                    'Habit',   'productivity', 'weekly',  'public',  '',                6,  12, 4, u3,  now() - interval '70 days'),
    (p4,  'Mindful Mornings',       'Start each day with 10 minutes of meditation. Track your practice, share reflections.',                    'Habit',   'mindfulness',  'daily',   'public',  '',                12, 55, 7, u6,  now() - interval '85 days'),
    (p5,  'Cold Plunge Crew',       'Daily cold exposure. Build mental toughness. Share your times and temperatures.',                           'Habit',   'fitness',      'daily',   'public',  'Miami, FL',       6,  28, 4, u5,  now() - interval '60 days'),
    (p6,  'Lens & Light',           'Daily photo challenge. One photo per day, any camera. Focus on seeing the world differently.',              'Explore', 'creativity',   'daily',   'public',  '',                8,  19, 5, u8,  now() - interval '50 days'),
    (p7,  'The Writing Room',       'Write 500 words every day. Fiction, non-fiction, journaling — it all counts.',                              'Habit',   'creativity',   'daily',   'public',  '',                8,  38, 5, u2,  now() - interval '72 days'),
    (p8,  'Iron Hour',              'Strength training accountability. Log your lifts, share your PRs, stay consistent.',                       'Habit',   'fitness',      'daily',   'public',  'Los Angeles, CA', 6,  41, 5, u7,  now() - interval '78 days'),
    (p9,  'Startup Grind',          'Founders building in public. Daily standup: what you shipped, what''s blocking you.',                      'Habit',   'productivity', 'daily',   'private', '',                5,  22, 3, u5,  now() - interval '55 days'),
    (p10, 'Watercolor Wednesdays',  'Weekly watercolor painting sessions. All skill levels welcome. Share your progress.',                      'Explore', 'creativity',   'weekly',  'public',  '',                10, 8,  4, u9,  now() - interval '40 days'),
    (p11, 'Trail Blazers',          'Weekend hiking group. Explore new trails, share GPS routes, and summit together.',                          'Explore', 'fitness',      'weekly',  'public',  'Denver, CO',      8,  14, 5, u10, now() - interval '65 days'),
    (p12, 'Zero Scroll Zone',       'Replace 1 hour of scrolling with something intentional. Daily accountability check-in.',                   'Habit',   'mindfulness',  'daily',   'public',  '',                10, 17, 6, u10, now() - interval '45 days')
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 4. POD MEMBERSHIPS
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO pod_members (pod_id, user_id, joined_at, current_streak, longest_streak, is_admin) VALUES
    -- 5AM Run Club (p1): Marcus(admin), Priya, Jordan, Emma, Maya, Alex
    (p1, u1,  now() - interval '80 days', 47, 47, true),
    (p1, u2,  now() - interval '70 days', 12, 25, false),
    (p1, u3,  now() - interval '65 days', 8,  15, false),
    (p1, u4,  now() - interval '60 days', 22, 22, false),
    (p1, u11, now() - interval '55 days', 35, 35, false),
    (p1, u7,  now() - interval '50 days', 18, 18, false),

    -- Page Turners (p2): Priya(admin), Jordan, Liam, Zara, Olivia
    (p2, u2,  now() - interval '75 days', 32, 32, true),
    (p2, u3,  now() - interval '60 days', 14, 20, false),
    (p2, u10, now() - interval '55 days', 28, 28, false),
    (p2, u9,  now() - interval '50 days', 10, 15, false),
    (p2, u6,  now() - interval '45 days', 19, 19, false),

    -- Ship It Sundays (p3): Jordan(admin), Alex, Sam, Emma
    (p3, u3,  now() - interval '70 days', 12, 12, true),
    (p3, u7,  now() - interval '60 days', 9,  10, false),
    (p3, u5,  now() - interval '55 days', 7,  8,  false),
    (p3, u4,  now() - interval '50 days', 11, 11, false),

    -- Mindful Mornings (p4): Olivia(admin), Marcus, Priya, Zara, Noah, Liam, Maya
    (p4, u6,  now() - interval '85 days', 55, 55, true),
    (p4, u1,  now() - interval '75 days', 30, 40, false),
    (p4, u2,  now() - interval '70 days', 45, 45, false),
    (p4, u9,  now() - interval '60 days', 20, 25, false),
    (p4, u8,  now() - interval '55 days', 15, 18, false),
    (p4, u10, now() - interval '50 days', 35, 35, false),
    (p4, u11, now() - interval '45 days', 25, 25, false),

    -- Cold Plunge Crew (p5): Sam(admin), Marcus, Alex, Tyler
    (p5, u5,  now() - interval '60 days', 28, 28, true),
    (p5, u1,  now() - interval '50 days', 15, 20, false),
    (p5, u7,  now() - interval '45 days', 22, 22, false),
    (p5, u12, now() - interval '40 days', 10, 12, false),

    -- Lens & Light (p6): Noah(admin), Zara, Emma, Jordan, Olivia
    (p6, u8,  now() - interval '50 days', 19, 19, true),
    (p6, u9,  now() - interval '45 days', 14, 16, false),
    (p6, u4,  now() - interval '40 days', 11, 11, false),
    (p6, u3,  now() - interval '35 days', 8,  10, false),
    (p6, u6,  now() - interval '30 days', 12, 12, false),

    -- The Writing Room (p7): Priya(admin), Olivia, Liam, Zara, Tyler
    (p7, u2,  now() - interval '72 days', 38, 38, true),
    (p7, u6,  now() - interval '60 days', 25, 30, false),
    (p7, u10, now() - interval '55 days', 20, 22, false),
    (p7, u9,  now() - interval '50 days', 15, 18, false),
    (p7, u12, now() - interval '45 days', 12, 12, false),

    -- Iron Hour (p8): Alex(admin), Marcus, Sam, Maya, Tyler
    (p8, u7,  now() - interval '78 days', 41, 41, true),
    (p8, u1,  now() - interval '65 days', 30, 35, false),
    (p8, u5,  now() - interval '60 days', 25, 28, false),
    (p8, u11, now() - interval '55 days', 38, 38, false),
    (p8, u12, now() - interval '50 days', 20, 22, false),

    -- Startup Grind (p9): Sam(admin), Jordan, Emma
    (p9, u5,  now() - interval '55 days', 22, 22, true),
    (p9, u3,  now() - interval '45 days', 15, 18, false),
    (p9, u4,  now() - interval '40 days', 19, 19, false),

    -- Watercolor Wednesdays (p10): Zara(admin), Noah, Olivia, Emma
    (p10, u9,  now() - interval '40 days', 8,  8,  true),
    (p10, u8,  now() - interval '35 days', 6,  7,  false),
    (p10, u6,  now() - interval '30 days', 5,  5,  false),
    (p10, u4,  now() - interval '25 days', 4,  4,  false),

    -- Trail Blazers (p11): Liam(admin), Noah, Maya, Sam, Alex
    (p11, u10, now() - interval '65 days', 14, 14, true),
    (p11, u8,  now() - interval '55 days', 10, 12, false),
    (p11, u11, now() - interval '50 days', 12, 12, false),
    (p11, u5,  now() - interval '45 days', 8,  10, false),
    (p11, u7,  now() - interval '40 days', 9,  9,  false),

    -- Zero Scroll Zone (p12): Liam(admin), Priya, Olivia, Zara, Marcus, Noah
    (p12, u10, now() - interval '45 days', 17, 17, true),
    (p12, u2,  now() - interval '40 days', 14, 15, false),
    (p12, u6,  now() - interval '35 days', 12, 12, false),
    (p12, u9,  now() - interval '30 days', 9,  10, false),
    (p12, u1,  now() - interval '25 days', 11, 11, false),
    (p12, u8,  now() - interval '20 days', 7,  8,  false)
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 5. CHECK-INS (40 check-ins across pods)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO checkins (id, pod_id, user_id, content, image_url, visibility, streak_count, created_at) VALUES
    -- 5AM Run Club
    (c1,  p1, u1,  'Crushed a 5K this morning in 22:14. New PR! The cold air actually felt amazing once I got moving.', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop', 'public', 47, now() - interval '2 hours'),
    (c2,  p1, u11, 'Did 8 miles along the river today. Legs are tired but the sunrise was worth every step.', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop', 'public', 35, now() - interval '5 hours'),
    (c3,  p1, u4,  'Recovery run today — just 3 easy miles. Listening to a podcast about ultramarathon training.', NULL, 'pod', 22, now() - interval '1 day'),
    (c4,  p1, u7,  'Tempo run: 4 miles at 7:30 pace. Getting faster every week. This pod is keeping me honest.', NULL, 'public', 18, now() - interval '1 day 3 hours'),
    (c5,  p1, u2,  'Only managed 2 miles today but I showed up. That counts. Tomorrow will be better.', NULL, 'pod', 12, now() - interval '2 days'),

    -- Page Turners
    (c6,  p2, u2,  'Finished "Tomorrow, and Tomorrow, and Tomorrow" — absolutely beautiful. Starting "Demon Copperhead" next.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop', 'public', 32, now() - interval '3 hours'),
    (c7,  p2, u10, 'Chapter 14 of "The Covenant of Water." This book is a masterpiece. Abraham Verghese is a genius.', NULL, 'public', 28, now() - interval '8 hours'),
    (c8,  p2, u6,  'Read 2 chapters of "Behave" by Sapolsky today. Dense but fascinating — connecting it to my research.', NULL, 'pod', 19, now() - interval '1 day'),
    (c9,  p2, u9,  'Started "Pachinko" and I''m already hooked. Read 3 chapters instead of the required 1 😅', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=400&fit=crop', 'public', 10, now() - interval '1 day 6 hours'),

    -- Ship It Sundays
    (c10, p3, u3,  'Shipped a portfolio redesign this weekend! Used Framer Motion for the first time. Link in bio.', 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop', 'public', 12, now() - interval '1 day'),
    (c11, p3, u4,  'Built a CLI tool that generates color palettes from photos. It''s rough but it works!', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop', 'public', 11, now() - interval '2 days'),
    (c12, p3, u7,  'Deployed my expense tracker app. React + Supabase. Simple but functional. Week 9 of shipping!', NULL, 'public', 9, now() - interval '3 days'),
    (c13, p3, u5,  'Launched a landing page for my new SaaS idea. Got 47 signups from one tweet. Let''s go.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', 'public', 7, now() - interval '4 days'),

    -- Mindful Mornings
    (c14, p4, u6,  '20 minutes of loving-kindness meditation today. Felt a deep sense of calm afterward. Day 55 ✨', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop', 'public', 55, now() - interval '1 hour'),
    (c15, p4, u2,  'Morning meditation by the window. Rain sounds + 15 min sit. My mind wandered less today.', 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&h=400&fit=crop', 'public', 45, now() - interval '4 hours'),
    (c16, p4, u10, 'Body scan meditation today. Found so much tension I didn''t know I was holding. This practice is changing me.', NULL, 'pod', 35, now() - interval '6 hours'),
    (c17, p4, u11, 'Quick 10 min session before work. Not my best sit but I showed up. Consistency > perfection.', NULL, 'pod', 25, now() - interval '1 day'),
    (c18, p4, u1,  'Guided meditation on gratitude. Feeling thankful for this community keeping me accountable.', NULL, 'public', 30, now() - interval '1 day 2 hours'),

    -- Cold Plunge Crew
    (c19, p5, u5,  '3 minutes at 42°F this morning. Breath work before and after. The dopamine hit is real.', 'https://images.unsplash.com/photo-1621629098081-2e1e64eaab28?w=600&h=400&fit=crop', 'public', 28, now() - interval '3 hours'),
    (c20, p5, u7,  'First time hitting 2:30 in the ice bath. My body wanted to quit at 1:30 but my mind said no.', NULL, 'public', 22, now() - interval '7 hours'),
    (c21, p5, u1,  'Cold shower today since I''m traveling. Not the same but better than skipping. 2 min at coldest setting.', NULL, 'pod', 15, now() - interval '1 day'),

    -- Lens & Light
    (c22, p6, u8,  'Golden hour at the waterfront. Shot with just my phone — sometimes constraints breed creativity.', 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=400&fit=crop', 'public', 19, now() - interval '4 hours'),
    (c23, p6, u9,  'Macro photography of my monstera leaves today. The patterns in nature are insane.', 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=400&fit=crop', 'public', 14, now() - interval '9 hours'),
    (c24, p6, u4,  'Street photography downtown. Caught a beautiful moment of a dad dancing with his daughter in the park.', 'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=600&h=400&fit=crop', 'public', 11, now() - interval '1 day'),

    -- The Writing Room
    (c25, p7, u2,  'Wrote 800 words on my short story. The characters are finally starting to feel real. Breakthrough day.', NULL, 'public', 38, now() - interval '2 hours'),
    (c26, p7, u6,  'Journal entry turned into a 600-word essay on imposter syndrome in academia. Might actually publish this.', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop', 'public', 25, now() - interval '5 hours'),
    (c27, p7, u10, 'Book review draft done — 550 words on "The Overstory." Writing about nature writing is meta but fun.', NULL, 'pod', 20, now() - interval '1 day'),
    (c28, p7, u9,  'Morning pages: 3 pages of stream of consciousness. Found a poem hiding in the mess.', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop', 'public', 15, now() - interval '1 day 4 hours'),

    -- Iron Hour
    (c29, p8, u7,  'Squat day: 315 x 5. New 5RM! Form felt solid. Deload week next week.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop', 'public', 41, now() - interval '3 hours'),
    (c30, p8, u1,  'Push day: bench 225x3, OHP 135x5, dips +45lbs x 8. Feeling strong.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop', 'public', 30, now() - interval '6 hours'),
    (c31, p8, u11, 'Deadlift PR: 365 lbs! Been chasing this for months. This pod''s energy is everything. 🔥', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=400&fit=crop', 'public', 38, now() - interval '10 hours'),
    (c32, p8, u5,  'Active recovery: 30 min mobility work + sauna. Listening to the body today.', NULL, 'pod', 25, now() - interval '1 day'),

    -- Startup Grind
    (c33, p9, u5,  'Shipped the onboarding flow. Conversion went from 12% to 34% in testing. Huge win.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop', 'pod', 22, now() - interval '4 hours'),
    (c34, p9, u4,  'Finally fixed the payment integration bug. Stripe webhooks are a pain but we''re live now.', NULL, 'pod', 19, now() - interval '8 hours'),
    (c35, p9, u3,  'Redesigned the dashboard. User testing tomorrow. Nervous but excited.', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=400&fit=crop', 'pod', 15, now() - interval '1 day'),

    -- Watercolor Wednesdays
    (c36, p10, u9,  'Painted a sunset over the lake. Wet-on-wet technique is finally clicking for me.', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop', 'public', 8, now() - interval '2 days'),
    (c37, p10, u8,  'Abstract florals today. Made a mess. Loved every minute. That''s the whole point right?', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop', 'public', 6, now() - interval '3 days'),

    -- Trail Blazers
    (c38, p11, u10, 'Hiked Mt. Bierstadt this weekend — 14er #7! Clear skies and zero wind. Perfect conditions.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop', 'public', 14, now() - interval '1 day'),
    (c39, p11, u11, 'Trail run at Red Rocks. 6 miles with 1200ft elevation gain. Colorado never gets old.', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop', 'public', 12, now() - interval '2 days'),

    -- Zero Scroll Zone
    (c40, p12, u10, 'Replaced my morning scroll with 30 min of reading + coffee. Day 17. Screen time down 40% this month.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop', 'public', 17, now() - interval '1 hour')
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 6. LIKES (spread across check-ins)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO checkin_likes (checkin_id, user_id, created_at) VALUES
    -- c1 (Marcus PR run) — 5 likes
    (c1, u2,  now() - interval '1 hour'),
    (c1, u4,  now() - interval '1 hour'),
    (c1, u7,  now() - interval '50 minutes'),
    (c1, u11, now() - interval '45 minutes'),
    (c1, u3,  now() - interval '30 minutes'),
    -- c6 (Priya book finish) — 4 likes
    (c6, u10, now() - interval '2 hours'),
    (c6, u9,  now() - interval '1 hour'),
    (c6, u6,  now() - interval '45 minutes'),
    (c6, u3,  now() - interval '30 minutes'),
    -- c10 (Jordan portfolio) — 6 likes
    (c10, u4,  now() - interval '20 hours'),
    (c10, u7,  now() - interval '18 hours'),
    (c10, u5,  now() - interval '16 hours'),
    (c10, u2,  now() - interval '14 hours'),
    (c10, u1,  now() - interval '12 hours'),
    (c10, u9,  now() - interval '10 hours'),
    -- c14 (Olivia meditation) — 3 likes
    (c14, u2,  now() - interval '45 minutes'),
    (c14, u1,  now() - interval '30 minutes'),
    (c14, u11, now() - interval '15 minutes'),
    -- c19 (Sam cold plunge) — 4 likes
    (c19, u7,  now() - interval '2 hours'),
    (c19, u1,  now() - interval '1 hour'),
    (c19, u12, now() - interval '45 minutes'),
    (c19, u3,  now() - interval '30 minutes'),
    -- c25 (Priya writing) — 3 likes
    (c25, u6,  now() - interval '1 hour'),
    (c25, u10, now() - interval '45 minutes'),
    (c25, u9,  now() - interval '30 minutes'),
    -- c29 (Alex squat PR) — 5 likes
    (c29, u1,  now() - interval '2 hours'),
    (c29, u5,  now() - interval '1 hour 30 minutes'),
    (c29, u11, now() - interval '1 hour'),
    (c29, u12, now() - interval '45 minutes'),
    (c29, u8,  now() - interval '30 minutes'),
    -- c31 (Maya deadlift PR) — 7 likes
    (c31, u7,  now() - interval '9 hours'),
    (c31, u1,  now() - interval '8 hours'),
    (c31, u5,  now() - interval '7 hours'),
    (c31, u2,  now() - interval '6 hours'),
    (c31, u3,  now() - interval '5 hours'),
    (c31, u6,  now() - interval '4 hours'),
    (c31, u12, now() - interval '3 hours'),
    -- c33 (Sam startup win) — 2 likes
    (c33, u3,  now() - interval '3 hours'),
    (c33, u4,  now() - interval '2 hours'),
    -- c40 (Liam zero scroll) — 4 likes
    (c40, u2,  now() - interval '50 minutes'),
    (c40, u6,  now() - interval '40 minutes'),
    (c40, u9,  now() - interval '30 minutes'),
    (c40, u8,  now() - interval '20 minutes'),
    -- More scattered likes
    (c2,  u1,  now() - interval '4 hours'),
    (c2,  u4,  now() - interval '3 hours'),
    (c7,  u2,  now() - interval '7 hours'),
    (c7,  u6,  now() - interval '6 hours'),
    (c11, u3,  now() - interval '1 day'),
    (c13, u3,  now() - interval '3 days'),
    (c13, u7,  now() - interval '3 days'),
    (c15, u6,  now() - interval '3 hours'),
    (c15, u1,  now() - interval '2 hours'),
    (c22, u9,  now() - interval '3 hours'),
    (c22, u4,  now() - interval '2 hours'),
    (c22, u3,  now() - interval '1 hour'),
    (c23, u8,  now() - interval '8 hours'),
    (c30, u7,  now() - interval '5 hours'),
    (c30, u11, now() - interval '4 hours'),
    (c34, u5,  now() - interval '7 hours'),
    (c36, u8,  now() - interval '1 day'),
    (c36, u6,  now() - interval '1 day'),
    (c38, u11, now() - interval '20 hours'),
    (c38, u8,  now() - interval '18 hours'),
    (c38, u5,  now() - interval '16 hours'),
    (c39, u10, now() - interval '1 day'),
    (c39, u7,  now() - interval '1 day')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 7. COMMENTS
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO checkin_comments (id, checkin_id, user_id, content, created_at) VALUES
    (cm1,  c1,  u2,  'That''s insane Marcus! Sub-23 is elite 🔥', now() - interval '1 hour'),
    (cm2,  c1,  u11, 'You''re gonna break 21 by summer at this rate', now() - interval '45 minutes'),
    (cm3,  c1,  u4,  'Motivating me for tomorrow''s run!', now() - interval '30 minutes'),
    (cm4,  c6,  u10, 'Adding this to my list! How would you rate it?', now() - interval '2 hours'),
    (cm5,  c6,  u9,  'One of my favorites this year too', now() - interval '1 hour'),
    (cm6,  c10, u5,  'Clean design. The micro-interactions are chef''s kiss', now() - interval '18 hours'),
    (cm7,  c10, u4,  'Framer Motion is so good once you get the hang of it', now() - interval '15 hours'),
    (cm8,  c10, u2,  'This is beautiful work Jordan!', now() - interval '12 hours'),
    (cm9,  c14, u2,  'Day 55! You''re an inspiration Olivia', now() - interval '30 minutes'),
    (cm10, c19, u7,  '42°F is no joke. Respect.', now() - interval '2 hours'),
    (cm11, c19, u1,  'The breath work makes such a difference right?', now() - interval '1 hour'),
    (cm12, c29, u1,  '315 for 5?! That''s massive. How long did it take you to get there?', now() - interval '2 hours'),
    (cm13, c29, u11, 'ATG? Form check video next time!', now() - interval '1 hour'),
    (cm14, c31, u7,  'LETS GO MAYA! 🎉 4 plates next!', now() - interval '9 hours'),
    (cm15, c31, u1,  'That''s incredible. Consistency pays off', now() - interval '8 hours'),
    (cm16, c33, u4,  'That conversion jump is wild. What did you change?', now() - interval '3 hours'),
    (cm17, c33, u3,  'Huge. The new flow is so much cleaner', now() - interval '2 hours'),
    (cm18, c40, u2,  'Screen time down 40%!! That''s the dream', now() - interval '45 minutes'),
    (cm19, c40, u6,  'I need to join this pod honestly', now() - interval '30 minutes'),
    (cm20, c22, u9,  'Phone photography is underrated. This is gorgeous', now() - interval '3 hours')
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 8. POD EVENTS
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO pod_events (id, pod_id, title, date, time, end_time, location, description, created_by, created_at) VALUES
    (e1, p1,  'Saturday Long Run',           '2026-03-28', '6:00 AM',  '8:00 AM',  'Prospect Park, Brooklyn',      'Group long run — 8-10 miles. All paces welcome. Coffee after!', u1, now() - interval '3 days'),
    (e2, p2,  'Book Club Discussion',        '2026-03-30', '7:00 PM',  '8:30 PM',  'Zoom',                         'Discussing "Tomorrow, and Tomorrow, and Tomorrow." Come with your hot takes.', u2, now() - interval '5 days'),
    (e3, p4,  'Group Meditation Session',    '2026-03-27', '7:00 AM',  '7:30 AM',  'Zoom',                         'Guided 30-minute sit together. Camera optional.', u6, now() - interval '2 days'),
    (e4, p8,  'PR Attempt Day',              '2026-03-29', '10:00 AM', '12:00 PM', 'Gold''s Gym, Venice Beach',    'Everyone attempts a PR on their main lift. Let''s get loud.', u7, now() - interval '4 days'),
    (e5, p11, 'Spring Equinox Hike',         '2026-04-05', '8:00 AM',  '2:00 PM',  'Bear Peak Trailhead, Boulder', 'Moderate 5.5mi hike with 2,500ft gain. Bring lunch for the summit!', u10, now() - interval '7 days'),
    (e6, p6,  'Golden Hour Photo Walk',      '2026-03-28', '5:30 PM',  '7:30 PM',  'Downtown Portland',            'Meet at Pioneer Square. Bring any camera. We''ll walk and shoot together.', u8, now() - interval '2 days')
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 9. EVENT RSVPs
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO event_rsvps (event_id, user_id, status) VALUES
    (e1, u1,  'going'),
    (e1, u11, 'going'),
    (e1, u4,  'going'),
    (e1, u7,  'maybe'),
    (e1, u2,  'going'),
    (e2, u2,  'going'),
    (e2, u10, 'going'),
    (e2, u6,  'going'),
    (e2, u9,  'maybe'),
    (e3, u6,  'going'),
    (e3, u2,  'going'),
    (e3, u1,  'going'),
    (e3, u10, 'going'),
    (e3, u11, 'maybe'),
    (e4, u7,  'going'),
    (e4, u1,  'going'),
    (e4, u11, 'going'),
    (e4, u5,  'going'),
    (e5, u10, 'going'),
    (e5, u8,  'going'),
    (e5, u11, 'going'),
    (e5, u5,  'maybe'),
    (e6, u8,  'going'),
    (e6, u9,  'going'),
    (e6, u4,  'going'),
    (e6, u3,  'maybe')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 10. MEDALS (using new medal system IDs)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO user_medals (user_id, medal_id, earned_at) VALUES
    -- Marcus Rivera (u1) — 47-day streak runner, community active
    (u1,  'early_adopter',    now() - interval '90 days'),
    (u1,  'first_checkin',    now() - interval '80 days'),
    (u1,  'first_pod',        now() - interval '80 days'),
    (u1,  'week_warrior',     now() - interval '73 days'),
    (u1,  'first_like',       now() - interval '70 days'),
    (u1,  'first_comment',    now() - interval '68 days'),
    (u1,  'fortnight',        now() - interval '66 days'),
    (u1,  'ten_checkins',     now() - interval '65 days'),
    (u1,  'perfect_week',     now() - interval '60 days'),
    (u1,  'multi_pod',        now() - interval '55 days'),
    (u1,  'monthly_grind',    now() - interval '50 days'),
    (u1,  'fifty_checkins',   now() - interval '45 days'),
    (u1,  'multi_pod_day',    now() - interval '40 days'),
    (u1,  'five_pods',        now() - interval '35 days'),
    (u1,  'early_bird',       now() - interval '30 days'),
    (u1,  'perfect_month',    now() - interval '25 days'),
    -- Priya Kapoor (u2) — dedicated reader/writer
    (u2,  'early_adopter',    now() - interval '85 days'),
    (u2,  'first_checkin',    now() - interval '75 days'),
    (u2,  'first_pod',        now() - interval '75 days'),
    (u2,  'week_warrior',     now() - interval '68 days'),
    (u2,  'first_like',       now() - interval '65 days'),
    (u2,  'pod_founder',      now() - interval '72 days'),
    (u2,  'fortnight',        now() - interval '61 days'),
    (u2,  'ten_checkins',     now() - interval '60 days'),
    (u2,  'multi_pod',        now() - interval '55 days'),
    (u2,  'monthly_grind',    now() - interval '45 days'),
    (u2,  'bookworm',         now() - interval '40 days'),
    (u2,  'fifty_checkins',   now() - interval '35 days'),
    (u2,  'night_owl',        now() - interval '30 days'),
    (u2,  'cheerleader',      now() - interval '25 days'),
    -- Jordan Lee (u3) — designer/builder
    (u3,  'early_adopter',    now() - interval '80 days'),
    (u3,  'first_checkin',    now() - interval '70 days'),
    (u3,  'first_pod',        now() - interval '70 days'),
    (u3,  'week_warrior',     now() - interval '63 days'),
    (u3,  'pod_founder',      now() - interval '70 days'),
    (u3,  'first_like',       now() - interval '60 days'),
    (u3,  'ten_checkins',     now() - interval '55 days'),
    (u3,  'category_surfer',  now() - interval '40 days'),
    -- Emma Chen (u4) — coder/climber
    (u4,  'first_checkin',    now() - interval '60 days'),
    (u4,  'first_pod',        now() - interval '60 days'),
    (u4,  'week_warrior',     now() - interval '53 days'),
    (u4,  'first_like',       now() - interval '50 days'),
    (u4,  'ten_checkins',     now() - interval '45 days'),
    (u4,  'multi_pod',        now() - interval '40 days'),
    (u4,  'photo_streak',     now() - interval '35 days'),
    -- Sam Okonkwo (u5) — entrepreneur
    (u5,  'first_checkin',    now() - interval '55 days'),
    (u5,  'first_pod',        now() - interval '55 days'),
    (u5,  'week_warrior',     now() - interval '48 days'),
    (u5,  'pod_founder',      now() - interval '60 days'),
    (u5,  'first_like',       now() - interval '45 days'),
    (u5,  'ten_checkins',     now() - interval '40 days'),
    (u5,  'early_bird',       now() - interval '35 days'),
    (u5,  'multi_pod',        now() - interval '30 days'),
    -- Olivia Martinez (u6) — 55-day meditation streak!
    (u6,  'early_adopter',    now() - interval '85 days'),
    (u6,  'first_checkin',    now() - interval '85 days'),
    (u6,  'first_pod',        now() - interval '85 days'),
    (u6,  'pod_founder',      now() - interval '85 days'),
    (u6,  'week_warrior',     now() - interval '78 days'),
    (u6,  'first_like',       now() - interval '75 days'),
    (u6,  'first_comment',    now() - interval '72 days'),
    (u6,  'fortnight',        now() - interval '71 days'),
    (u6,  'ten_checkins',     now() - interval '70 days'),
    (u6,  'multi_pod',        now() - interval '65 days'),
    (u6,  'monthly_grind',    now() - interval '55 days'),
    (u6,  'fifty_checkins',   now() - interval '45 days'),
    (u6,  'sixty_days',       now() - interval '35 days'),
    (u6,  'early_bird',       now() - interval '40 days'),
    (u6,  'perfect_month',    now() - interval '38 days'),
    (u6,  'monday_person',    now() - interval '30 days'),
    (u6,  'cheerleader',      now() - interval '25 days'),
    (u6,  'hundred_checkins', now() - interval '20 days'),
    -- Alex Kim (u7) — gym/code
    (u7,  'first_checkin',    now() - interval '78 days'),
    (u7,  'first_pod',        now() - interval '78 days'),
    (u7,  'pod_founder',      now() - interval '78 days'),
    (u7,  'week_warrior',     now() - interval '71 days'),
    (u7,  'first_like',       now() - interval '68 days'),
    (u7,  'fortnight',        now() - interval '64 days'),
    (u7,  'ten_checkins',     now() - interval '60 days'),
    (u7,  'monthly_grind',    now() - interval '48 days'),
    (u7,  'fifty_checkins',   now() - interval '40 days'),
    (u7,  'early_bird',       now() - interval '35 days'),
    (u7,  'multi_pod',        now() - interval '30 days'),
    -- Noah Williams (u8) — photographer
    (u8,  'first_checkin',    now() - interval '50 days'),
    (u8,  'first_pod',        now() - interval '50 days'),
    (u8,  'pod_founder',      now() - interval '50 days'),
    (u8,  'week_warrior',     now() - interval '43 days'),
    (u8,  'first_like',       now() - interval '40 days'),
    (u8,  'ten_checkins',     now() - interval '35 days'),
    (u8,  'photo_streak',     now() - interval '30 days'),
    (u8,  'globe_trotter',    now() - interval '25 days'),
    -- Zara Ahmed (u9) — UX/art
    (u9,  'first_checkin',    now() - interval '40 days'),
    (u9,  'first_pod',        now() - interval '40 days'),
    (u9,  'pod_founder',      now() - interval '40 days'),
    (u9,  'week_warrior',     now() - interval '33 days'),
    (u9,  'first_like',       now() - interval '30 days'),
    (u9,  'ten_checkins',     now() - interval '25 days'),
    (u9,  'multi_pod',        now() - interval '20 days'),
    -- Liam Johnson (u10) — teacher/reader
    (u10, 'first_checkin',    now() - interval '65 days'),
    (u10, 'first_pod',        now() - interval '65 days'),
    (u10, 'pod_founder',      now() - interval '65 days'),
    (u10, 'week_warrior',     now() - interval '58 days'),
    (u10, 'first_like',       now() - interval '55 days'),
    (u10, 'fortnight',        now() - interval '51 days'),
    (u10, 'ten_checkins',     now() - interval '50 days'),
    (u10, 'multi_pod',        now() - interval '40 days'),
    (u10, 'night_owl',        now() - interval '30 days'),
    -- Maya Patel (u11) — ultramarathoner
    (u11, 'first_checkin',    now() - interval '55 days'),
    (u11, 'first_pod',        now() - interval '55 days'),
    (u11, 'week_warrior',     now() - interval '48 days'),
    (u11, 'first_like',       now() - interval '45 days'),
    (u11, 'first_comment',    now() - interval '42 days'),
    (u11, 'fortnight',        now() - interval '41 days'),
    (u11, 'ten_checkins',     now() - interval '40 days'),
    (u11, 'monthly_grind',    now() - interval '25 days'),
    (u11, 'multi_pod',        now() - interval '30 days'),
    (u11, 'early_bird',       now() - interval '20 days'),
    (u11, 'fifty_checkins',   now() - interval '15 days'),
    -- Tyler Brooks (u12) — music producer
    (u12, 'first_checkin',    now() - interval '35 days'),
    (u12, 'first_pod',        now() - interval '35 days'),
    (u12, 'week_warrior',     now() - interval '28 days'),
    (u12, 'first_like',       now() - interval '25 days'),
    (u12, 'early_bird',       now() - interval '20 days'),
    (u12, 'ten_checkins',     now() - interval '15 days')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- 11. POD APPLICATIONS (a few pending ones)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO pod_applications (pod_id, user_id, message, status, created_at) VALUES
    (p1,  u8,  'I''ve been running 3x/week and want to level up to daily. Would love to join!', 'pending', now() - interval '2 days'),
    (p4,  u12, 'Been meditating on my own for a month. Ready for accountability.', 'pending', now() - interval '1 day'),
    (p8,  u3,  'Looking to get more serious about lifting. Currently running PPL.', 'pending', now() - interval '3 days'),
    (p2,  u11, 'I read about 40 books a year and want to discuss more. Let me in!', 'accepted', now() - interval '10 days'),
    (p5,  u4,  'Cold showers for 2 weeks now. Ready for the real thing.', 'pending', now() - interval '4 days')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE '12 users, 12 pods, 40 check-ins, 60+ likes, 20 comments, 6 events, 100+ medals, images on posts';
END $$;

-- ═══════════════════════════════════════════════════════════
-- 12. ENROLL THE REAL USER IN PODS
-- (Separate block — finds any non-seed user and adds them)
-- ═══════════════════════════════════════════════════════════
DO $$
DECLARE
  real_user_id uuid;
  p1  uuid := 'b2000000-0000-0000-0000-000000000001';
  p3  uuid := 'b2000000-0000-0000-0000-000000000003';
  p4  uuid := 'b2000000-0000-0000-0000-000000000004';
  p8  uuid := 'b2000000-0000-0000-0000-000000000008';
  p12 uuid := 'b2000000-0000-0000-0000-000000000012';
  e1  uuid := 'd4000000-0000-0000-0000-000000000001';
  e3  uuid := 'd4000000-0000-0000-0000-000000000003';
  e4  uuid := 'd4000000-0000-0000-0000-000000000004';
BEGIN
  SELECT id INTO real_user_id FROM auth.users
  WHERE id::text NOT LIKE 'a1000000-0000-0000-0000-%'
  LIMIT 1;

  IF real_user_id IS NULL THEN
    RAISE NOTICE 'No real user found — skipping enrollment';
    RETURN;
  END IF;

  -- Join 5 pods
  INSERT INTO pod_members (pod_id, user_id, joined_at, current_streak, longest_streak, is_admin) VALUES
    (p1,  real_user_id, now() - interval '30 days', 14, 14, false),
    (p4,  real_user_id, now() - interval '25 days', 10, 12, false),
    (p3,  real_user_id, now() - interval '20 days', 5,  5,  false),
    (p8,  real_user_id, now() - interval '15 days', 8,  8,  false),
    (p12, real_user_id, now() - interval '10 days', 6,  6,  false)
  ON CONFLICT DO NOTHING;

  -- Checkins from the real user
  INSERT INTO checkins (pod_id, user_id, content, image_url, visibility, streak_count, created_at) VALUES
    (p1,  real_user_id, 'First 5AM run in weeks and I actually loved it. The group energy is unmatched.', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop', 'public', 14, now() - interval '6 hours'),
    (p4,  real_user_id, 'Meditation in the park this morning. 15 minutes. Mind was busy but I stayed with it.', 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop', 'public', 10, now() - interval '1 day'),
    (p8,  real_user_id, 'Leg day done. Squats felt heavy but I didn''t skip a single set. Progress.', NULL, 'public', 8, now() - interval '2 days'),
    (p12, real_user_id, 'Replaced 45 min of Instagram with a walk around the neighborhood. Small wins.', NULL, 'public', 6, now() - interval '3 days'),
    (p3,  real_user_id, 'Shipped a simple habit tracker this weekend using Next.js. Nothing fancy but it works!', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop', 'public', 5, now() - interval '5 days')
  ON CONFLICT DO NOTHING;

  -- Medals
  INSERT INTO user_medals (user_id, medal_id, earned_at) VALUES
    (real_user_id, 'early_adopter',  now() - interval '30 days'),
    (real_user_id, 'first_checkin',  now() - interval '30 days'),
    (real_user_id, 'first_pod',      now() - interval '30 days'),
    (real_user_id, 'week_warrior',   now() - interval '23 days'),
    (real_user_id, 'first_like',     now() - interval '20 days'),
    (real_user_id, 'first_comment',  now() - interval '18 days'),
    (real_user_id, 'ten_checkins',   now() - interval '15 days'),
    (real_user_id, 'multi_pod',      now() - interval '12 days'),
    (real_user_id, 'bookworm',       now() - interval '5 days'),
    (real_user_id, 'pod_founder',    now() - interval '8 days'),
    (real_user_id, 'perfect_week',   now() - interval '6 days'),
    (real_user_id, 'five_pods',      now() - interval '3 days')
  ON CONFLICT DO NOTHING;

  -- RSVPs
  INSERT INTO event_rsvps (event_id, user_id, status) VALUES
    (e1, real_user_id, 'going'),
    (e3, real_user_id, 'going'),
    (e4, real_user_id, 'maybe')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Real user (%) enrolled in 5 pods with checkins, medals, and RSVPs', real_user_id;
END $$;
