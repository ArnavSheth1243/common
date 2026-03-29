-- ============================================================
-- MIGRATION V4: Challenges tables
-- ============================================================
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/maoekyujyeibqqkbrtsj/sql/new
-- ============================================================

-- STEP 1: Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id uuid REFERENCES pods(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  goal int NOT NULL DEFAULT 30,
  goal_unit text NOT NULL DEFAULT 'check-ins',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- STEP 2: Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);

-- STEP 3: Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- STEP 4: RLS Policies
DROP POLICY IF EXISTS "challenges_select" ON challenges;
DROP POLICY IF EXISTS "challenges_insert" ON challenges;
DROP POLICY IF EXISTS "challenge_participants_select" ON challenge_participants;
DROP POLICY IF EXISTS "challenge_participants_insert" ON challenge_participants;

-- Anyone in the pod can see challenges
CREATE POLICY "challenges_select" ON challenges
  FOR SELECT USING (
    pod_id IN (SELECT pod_id FROM pod_members WHERE user_id = auth.uid())
  );

-- Pod admins can create challenges
CREATE POLICY "challenges_insert" ON challenges
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND pod_id IN (SELECT pod_id FROM pod_members WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Anyone can see participants
CREATE POLICY "challenge_participants_select" ON challenge_participants
  FOR SELECT USING (true);

-- Authenticated users can join challenges
CREATE POLICY "challenge_participants_insert" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- STEP 5: Grants
GRANT SELECT, INSERT ON challenges TO authenticated;
GRANT SELECT, INSERT ON challenge_participants TO authenticated;

-- STEP 6: Indexes
CREATE INDEX IF NOT EXISTS idx_challenges_pod ON challenges(pod_id);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
