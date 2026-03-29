-- ============================================================
-- MIGRATION V3: Create Messages/DM tables (idempotent)
-- ============================================================
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/maoekyujyeibqqkbrtsj/sql/new
-- ============================================================

-- STEP 1: Tables
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- STEP 2: Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- STEP 3: RLS Policies (drop first to avoid "already exists")
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "conv_members_select" ON conversation_members;
DROP POLICY IF EXISTS "conv_members_insert" ON conversation_members;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (
    id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
  );

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "conv_members_select" ON conversation_members
  FOR SELECT USING (
    conversation_id IN (SELECT conversation_id FROM conversation_members cm WHERE cm.user_id = auth.uid())
  );

CREATE POLICY "conv_members_insert" ON conversation_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
  );

-- STEP 4: Grants
GRANT SELECT, INSERT ON conversations TO authenticated;
GRANT SELECT, INSERT ON conversation_members TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;

-- STEP 5: Auto-update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversation_updated ON messages;
CREATE TRIGGER trg_conversation_updated
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- STEP 6: Indexes
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(conversation_id, created_at);
