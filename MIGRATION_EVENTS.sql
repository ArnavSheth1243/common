-- ═══════════════════════════════════════════════════════════════════════════════
-- EVENTS FEATURE MIGRATION
-- Run this in the Supabase SQL editor on existing databases.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Make pod_id nullable so solo events can exist
alter table pod_events alter column pod_id drop not null;

-- 2. Add new columns
alter table pod_events add column if not exists is_public boolean default true;
alter table pod_events add column if not exists image_url text;
alter table pod_events add column if not exists category text;

-- 3. Replace insert policy to allow solo events
drop policy if exists "events_insert" on pod_events;
create policy "events_insert" on pod_events
  for insert with check (
    (pod_id is null and auth.uid() = created_by)
    or auth.uid() in (select user_id from pod_members where pod_id = pod_events.pod_id)
  );

-- 4. Add update + delete policies (creator only)
drop policy if exists "events_update" on pod_events;
create policy "events_update" on pod_events for update using (auth.uid() = created_by);

drop policy if exists "events_delete" on pod_events;
create policy "events_delete" on pod_events for delete using (auth.uid() = created_by);

-- 5. Index for fast public event queries
create index if not exists idx_pod_events_public_date on pod_events(is_public, date);
