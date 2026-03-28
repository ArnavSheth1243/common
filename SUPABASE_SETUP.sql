-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMON APP - SUPABASE DATABASE SETUP
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this entire script in your Supabase SQL Editor
-- https://app.supabase.com/project/maoekyujyeibqqkbrtsj/sql/new

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES TABLE (extends auth.users)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  bio text,
  age int,
  location text,
  goals text[] default '{}',
  interests text[] default '{}',
  commitment text default 'daily',
  time_preference text default 'morning',
  onboarding_complete boolean default false,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PODS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists pods (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  type text not null check (type in ('Habit', 'Explore')),
  category text not null,
  cadence text not null default 'daily',
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  location text default '',
  max_members int,
  streak int default 0,
  member_count int default 1,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- POD MEMBERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists pod_members (
  pod_id uuid references pods(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  current_streak int default 0,
  longest_streak int default 0,
  is_admin boolean default false,
  primary key (pod_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- POD APPLICATIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists pod_applications (
  id uuid primary key default uuid_generate_v4(),
  pod_id uuid references pods(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK-INS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists checkins (
  id uuid primary key default uuid_generate_v4(),
  pod_id uuid references pods(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  image_url text,
  visibility text default 'pod' check (visibility in ('public', 'pod', 'private')),
  streak_count int default 0,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK-IN LIKES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists checkin_likes (
  checkin_id uuid references checkins(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (checkin_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK-IN COMMENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists checkin_comments (
  id uuid primary key default uuid_generate_v4(),
  checkin_id uuid references checkins(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- POD EVENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists pod_events (
  id uuid primary key default uuid_generate_v4(),
  pod_id uuid references pods(id) on delete cascade,
  title text not null,
  date date not null,
  time text,
  end_time text,
  location text,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT RSVPs TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists event_rsvps (
  event_id uuid references pod_events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null check (status in ('going', 'maybe', 'no')),
  updated_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- USER MEDALS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists user_medals (
  user_id uuid references auth.users(id) on delete cascade,
  medal_id text not null,
  earned_at timestamptz default now(),
  primary key (user_id, medal_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CALENDAR EVENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  date date not null,
  time text,
  end_time text,
  type text default 'personal' check (type in ('personal', 'pod', 'reminder')),
  pod_id uuid references pods(id) on delete set null,
  location text,
  description text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════════════════════════════════
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table pods enable row level security;
alter table pod_members enable row level security;
alter table pod_applications enable row level security;
alter table checkins enable row level security;
alter table checkin_likes enable row level security;
alter table checkin_comments enable row level security;
alter table pod_events enable row level security;
alter table event_rsvps enable row level security;
alter table user_medals enable row level security;
alter table calendar_events enable row level security;

-- Profiles: anyone can read, users can update own
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (true);

-- Pods: anyone can read, authenticated users can create, creators can update
create policy "pods_select" on pods for select using (true);
create policy "pods_insert" on pods for insert with check (auth.role() = 'authenticated');
create policy "pods_update" on pods for update using (auth.uid() = created_by);

-- Pod members: anyone can read, users can manage their own membership
create policy "pod_members_select" on pod_members for select using (true);
create policy "pod_members_insert" on pod_members for insert with check (auth.uid() = user_id);
create policy "pod_members_delete" on pod_members for delete using (auth.uid() = user_id);

-- Pod applications: users can see own, pod admins can see all and update
create policy "pod_apps_select" on pod_applications
  for select using (
    auth.uid() = user_id
    or auth.uid() in (
      select user_id from pod_members where pod_id = pod_applications.pod_id and is_admin = true
    )
  );
create policy "pod_apps_insert" on pod_applications for insert with check (auth.uid() = user_id);
create policy "pod_apps_update" on pod_applications
  for update using (
    auth.uid() in (
      select user_id from pod_members where pod_id = pod_applications.pod_id and is_admin = true
    )
  );

-- Check-ins: public/pod visibility-based, users can insert own
create policy "checkins_select" on checkins
  for select using (
    visibility = 'public'
    or auth.uid() = user_id
    or (visibility = 'pod' and auth.uid() in (
      select user_id from pod_members where pod_id = checkins.pod_id
    ))
  );
create policy "checkins_insert" on checkins for insert with check (auth.uid() = user_id);

-- Likes and comments
create policy "likes_select" on checkin_likes for select using (true);
create policy "likes_insert" on checkin_likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on checkin_likes for delete using (auth.uid() = user_id);
create policy "comments_select" on checkin_comments for select using (true);
create policy "comments_insert" on checkin_comments for insert with check (auth.uid() = user_id);

-- Events and RSVPs
create policy "events_select" on pod_events for select using (true);
create policy "events_insert" on pod_events
  for insert with check (
    auth.uid() in (select user_id from pod_members where pod_id = pod_events.pod_id)
  );
create policy "rsvps_select" on event_rsvps for select using (true);
create policy "rsvps_upsert" on event_rsvps for all using (auth.uid() = user_id);

-- Medals and calendar
create policy "medals_select" on user_medals for select using (true);
create policy "medals_insert" on user_medals for insert with check (auth.uid() = user_id);
create policy "calendar_all" on calendar_events for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CREATE INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════════
create index if not exists idx_pods_created_by on pods(created_by);
create index if not exists idx_pod_members_user_id on pod_members(user_id);
create index if not exists idx_checkins_user_id on checkins(user_id);
create index if not exists idx_checkins_pod_id on checkins(pod_id);
create index if not exists idx_checkin_likes_user_id on checkin_likes(user_id);
create index if not exists idx_checkin_comments_user_id on checkin_comments(user_id);
create index if not exists idx_calendar_events_user_id on calendar_events(user_id);
create index if not exists idx_user_medals_user_id on user_medals(user_id);
