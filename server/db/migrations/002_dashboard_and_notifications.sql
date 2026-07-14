-- Run this once against your existing Supabase project's SQL editor to add the pieces behind
-- the new authed area (Dashboard, Saved, My reports, Notifications, Settings). It's additive
-- and safe to run more than once — do NOT re-run the full schema.sql on a project that already
-- has data, since its earlier policy-creation statements aren't idempotent and will error on
-- duplicates. This file is.

alter table profiles add column if not exists notifications_enabled boolean not null default true;
alter table verify_submissions add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table user_reports add column if not exists user_id uuid references auth.users (id) on delete set null;

create table if not exists saved_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  claim_id uuid not null references claims (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, claim_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  claim_id uuid not null references claims (id) on delete cascade,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create or replace function notify_matching_profiles() returns trigger as $$
begin
  insert into notifications (user_id, claim_id)
  select p.id, new.id
  from profiles p
  where new.category = any(p.categories) and p.notifications_enabled;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists claims_notify_trigger on claims;
create trigger claims_notify_trigger
  after insert on claims
  for each row execute function notify_matching_profiles();

alter table saved_claims enable row level security;
alter table notifications enable row level security;

drop policy if exists "Users read own verify submissions" on verify_submissions;
create policy "Users read own verify submissions" on verify_submissions for select using (auth.uid() = user_id);
drop policy if exists "Users read own reports" on user_reports;
create policy "Users read own reports" on user_reports for select using (auth.uid() = user_id);

drop policy if exists "Users manage own saved claims" on saved_claims;
create policy "Users manage own saved claims" on saved_claims for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read own notifications" on notifications;
create policy "Users read own notifications" on notifications for select using (auth.uid() = user_id);
drop policy if exists "Users update own notifications" on notifications;
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);
