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
  stance text not null check (stance in ('corroborates', 'contradicts'))
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
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security. The Express API writes through the service-role key, which bypasses RLS
-- entirely, so write tables intentionally have no anon policies below.
alter table sources enable row level security;
alter table claims enable row level security;
alter table claim_sources enable row level security;
alter table claim_reports enable row level security;
alter table insights enable row level security;
alter table verify_submissions enable row level security;
alter table user_reports enable row level security;
alter table profiles enable row level security;
alter table contact_messages enable row level security;

create policy "Public read sources" on sources for select using (true);
create policy "Public read claims" on claims for select using (true);
create policy "Public read claim_sources" on claim_sources for select using (true);
create policy "Public read claim_reports" on claim_reports for select using (true);
create policy "Public read insights" on insights for select using (true);

create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Enable realtime on claims so the ticker / trending feed can subscribe without polling.
alter publication supabase_realtime add table claims;
