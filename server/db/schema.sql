-- Truewire schema. Run this in the Supabase SQL editor once you've created a project.
create extension if not exists pgcrypto;

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  type text not null check (type in ('news', 'factcheck')),
  homepage_url text
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  text text not null,
  category text not null check (category in ('Politics', 'Health', 'Finance', 'Security', 'Entertainment')),
  verdict text not null check (verdict in ('verified', 'disputed', 'unconfirmed')),
  confidence numeric check (confidence >= 0 and confidence <= 1),
  explanation text not null,
  first_reported_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists claim_sources (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  source_id uuid not null references sources (id) on delete cascade,
  article_url text,
  stance text not null check (stance in ('corroborates', 'contradicts')),
  unique (claim_id, source_id)
);

-- One row per time bucket, powers the sparkline / propagation summary.
create table if not exists claim_reports (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  bucket_at timestamptz not null,
  count integer not null default 1
);

create table if not exists verify_submissions (
  id uuid primary key default gen_random_uuid(),
  input_text text not null,
  input_type text not null default 'text',
  matched_claim_id uuid references claims (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists user_reports (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  type text not null default 'text',
  category text,
  contact_email text,
  matched_claim_id uuid references claims (id) on delete set null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  category text,
  hero_image_query text,
  body jsonb not null default '[]'::jsonb,
  published_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  categories text[] not null default '{}',
  language text not null default 'English',
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists saved_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  claim_id uuid not null references claims (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, claim_id)
);

-- One row per (matching profile, new claim) — populated by the trigger below, not the app.
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  claim_id uuid not null references claims (id) on delete cascade,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

alter table verify_submissions add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table user_reports add column if not exists user_id uuid references auth.users (id) on delete set null;

-- Tracks which RSS items from server/lib/feeds.js have already been processed, so the ingestion
-- poller doesn't re-evaluate the same fact-check article every cycle (feeds keep repeating
-- recent items until they scroll off). claim_id is null for items judged not Nigeria-relevant.
create table if not exists ingested_feed_items (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  item_guid text not null,
  claim_id uuid references claims (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (source_name, item_guid)
);

-- Fires whenever a new claim is inserted (by the ingestion pipeline, or the seed data), and
-- notifies every profile whose saved categories include it — this is what makes /notifications
-- a genuine "pushed to the user" feed rather than something the app fakes on read.
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

-- Row Level Security. The Express API writes through the service-role key, which bypasses RLS
-- entirely, so write tables intentionally have no anon insert/update/delete policies below —
-- only the owner-scoped select/insert/delete policies a signed-in user needs to read or manage
-- their own rows directly (profiles, saved_claims, notifications, and their own report/verify
-- history). Policies are dropped-and-recreated so this whole file is safely re-runnable.
alter table sources enable row level security;
alter table claims enable row level security;
alter table claim_sources enable row level security;
alter table claim_reports enable row level security;
alter table insights enable row level security;
alter table verify_submissions enable row level security;
alter table user_reports enable row level security;
alter table profiles enable row level security;
alter table contact_messages enable row level security;
alter table saved_claims enable row level security;
alter table notifications enable row level security;
alter table ingested_feed_items enable row level security;

drop policy if exists "Public read sources" on sources;
create policy "Public read sources" on sources for select using (true);
drop policy if exists "Public read claims" on claims;
create policy "Public read claims" on claims for select using (true);
drop policy if exists "Public read claim_sources" on claim_sources;
create policy "Public read claim_sources" on claim_sources for select using (true);
drop policy if exists "Public read claim_reports" on claim_reports;
create policy "Public read claim_reports" on claim_reports for select using (true);
drop policy if exists "Public read insights" on insights;
create policy "Public read insights" on insights for select using (true);

drop policy if exists "Users read own profile" on profiles;
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
drop policy if exists "Users insert own profile" on profiles;
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
drop policy if exists "Users update own profile" on profiles;
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

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

-- Enable realtime on claims so the ticker / trending feed can subscribe without polling.
alter publication supabase_realtime add table claims;
