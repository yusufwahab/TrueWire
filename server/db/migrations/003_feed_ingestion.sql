-- Run this once against your existing Supabase project's SQL editor to add the bookkeeping
-- table the RSS ingestion pipeline needs. Additive and safe to run more than once.

create table if not exists ingested_feed_items (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  item_guid text not null,
  claim_id uuid references claims (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (source_name, item_guid)
);

alter table ingested_feed_items enable row level security;
-- No public policy — this table is internal bookkeeping the Express API reads/writes with the
-- service-role key, same as every other write-only table in this schema.
