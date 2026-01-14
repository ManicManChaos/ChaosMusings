-- Minimal placeholder schema (safe to run now; extend later)

create extension if not exists "pgcrypto";

create table if not exists daily_entries (
  id uuid primary key default gen_random_uuid(),
  day_key text not null, -- YYYY-MM-DD in America/Chicago
  created_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists daily_entries_day_key_idx on daily_entries(day_key);