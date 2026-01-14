-- Core day table
create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  day_date date not null,
  assessment jsonb,
  sealed boolean default false,
  created_at timestamptz default now()
);

-- Context entries (WOW/WTF/PLOT TWIST)
create table if not exists context_entries (
  id uuid primary key default gen_random_uuid(),
  day_date date not null,
  type text,
  description text,
  image_url text,
  created_at timestamptz default now()
);

-- Roid Boy outputs
create table if not exists roidboy_entries (
  id uuid primary key default gen_random_uuid(),
  day_date date not null,
  data jsonb,
  created_at timestamptz default now()
);

-- P.S. notes
create table if not exists ps_entries (
  id uuid primary key default gen_random_uuid(),
  day_date date not null,
  time text,
  description text,
  created_at timestamptz default now()
);

-- Summation
create table if not exists summations (
  id uuid primary key default gen_random_uuid(),
  day_date date not null,
  text text,
  completed boolean default false,
  created_at timestamptz default now()
);
