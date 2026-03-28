-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMON APP - V2 MIGRATION
-- Run this in Supabase SQL Editor AFTER the initial SUPABASE_SETUP.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ADD MISSING COLUMNS TO PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
alter table profiles add column if not exists bio text default '';
alter table profiles add column if not exists instagram_handle text default '';
alter table profiles add column if not exists referral_source text default '';
alter table profiles add column if not exists people_met int default 0;
alter table profiles add column if not exists image_url text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ADD DELETE POLICY FOR CHECKINS (authors can delete own posts)
-- ─────────────────────────────────────────────────────────────────────────────
create policy "checkins_delete" on checkins for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ADD IMAGE_URL COLUMN TO PODS (if not exists)
-- ─────────────────────────────────────────────────────────────────────────────
alter table pods add column if not exists image_url text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CONVERSATIONS TABLE (for DMs)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. CONVERSATION MEMBERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists conversation_members (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. MESSAGES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. MEETUPS TABLE (for tracking pod meetups)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists meetups (
  id uuid primary key default uuid_generate_v4(),
  pod_id uuid references pods(id) on delete cascade,
  title text default 'Pod Meetup',
  met_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. MEETUP PARTICIPANTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists meetup_participants (
  meetup_id uuid references meetups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (meetup_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. RLS FOR NEW TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- Conversations: only members can see
alter table conversations enable row level security;
create policy "conversations_select" on conversations for select using (
  id in (select conversation_id from conversation_members where user_id = auth.uid())
);
create policy "conversations_insert" on conversations for insert with check (
  auth.role() = 'authenticated'
);

-- Conversation members: only members can see
alter table conversation_members enable row level security;
create policy "conv_members_select" on conversation_members for select using (
  conversation_id in (select conversation_id from conversation_members cm where cm.user_id = auth.uid())
);
create policy "conv_members_insert" on conversation_members for insert with check (
  auth.uid() = user_id
);

-- Messages: only conversation members can read/write
alter table messages enable row level security;
create policy "messages_select" on messages for select using (
  conversation_id in (select conversation_id from conversation_members where user_id = auth.uid())
);
create policy "messages_insert" on messages for insert with check (
  auth.uid() = sender_id
  and conversation_id in (select conversation_id from conversation_members where user_id = auth.uid())
);

-- Meetups: pod members can see and create
alter table meetups enable row level security;
create policy "meetups_select" on meetups for select using (
  pod_id in (select pod_id from pod_members where user_id = auth.uid())
);
create policy "meetups_insert" on meetups for insert with check (
  auth.uid() = created_by
);

-- Meetup participants: pod members can see
alter table meetup_participants enable row level security;
create policy "meetup_participants_select" on meetup_participants for select using (
  meetup_id in (select id from meetups where pod_id in (select pod_id from pod_members where user_id = auth.uid()))
);
create policy "meetup_participants_insert" on meetup_participants for insert with check (
  auth.uid() = user_id
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. INDEXES FOR NEW TABLES
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_conv_members_user on conversation_members(user_id);
create index if not exists idx_messages_conv on messages(conversation_id);
create index if not exists idx_messages_sender on messages(sender_id);
create index if not exists idx_meetups_pod on meetups(pod_id);
create index if not exists idx_meetup_participants_user on meetup_participants(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. TRIGGER: AUTO-UPDATE member_count ON POD MEMBERS CHANGE
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function update_pod_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update pods set member_count = (
      select count(*) from pod_members where pod_id = NEW.pod_id
    ) where id = NEW.pod_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update pods set member_count = (
      select count(*) from pod_members where pod_id = OLD.pod_id
    ) where id = OLD.pod_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_pod_member_count on pod_members;
create trigger trg_pod_member_count
  after insert or delete on pod_members
  for each row execute function update_pod_member_count();

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. TRIGGER: UPDATE conversations.updated_at ON NEW MESSAGE
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
  update conversations set updated_at = now() where id = NEW.conversation_id;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_conversation_updated on messages;
create trigger trg_conversation_updated
  after insert on messages
  for each row execute function update_conversation_timestamp();

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. FUNCTION: UPDATE people_met AFTER MEETUP
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function update_people_met_after_participant()
returns trigger as $$
declare
  other_user_id uuid;
begin
  -- For each OTHER participant in this meetup, increment both users' people_met
  -- but only if they haven't met before (check existing meetup_participants overlap)
  for other_user_id in
    select mp.user_id from meetup_participants mp
    where mp.meetup_id = NEW.meetup_id and mp.user_id != NEW.user_id
  loop
    -- Check if these two users have been in a meetup together before (excluding this one)
    if not exists (
      select 1 from meetup_participants a
      join meetup_participants b on a.meetup_id = b.meetup_id
      where a.user_id = NEW.user_id
        and b.user_id = other_user_id
        and a.meetup_id != NEW.meetup_id
    ) then
      -- First time meeting: increment both
      update profiles set people_met = people_met + 1 where id = NEW.user_id;
      update profiles set people_met = people_met + 1 where id = other_user_id;
    end if;
  end loop;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_people_met on meetup_participants;
create trigger trg_people_met
  after insert on meetup_participants
  for each row execute function update_people_met_after_participant();

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. UPDATE handle_new_user TO INITIALIZE ALL COUNTERS
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name, people_met, onboarding_complete, is_public)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    0,
    false,
    true
  );
  return new;
end;
$$ language plpgsql security definer;
