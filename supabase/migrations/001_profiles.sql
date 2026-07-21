-- ─────────────────────────────────────────────────────────────────────────────
-- 001_profiles.sql
-- User profiles + addresses, linked to Supabase Auth (auth.users)
-- ─────────────────────────────────────────────────────────────────────────────

-- Extension for UUID generation (usually enabled by default on Supabase)
create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  first_name  text,
  avatar_url  text,
  phone       text,
  role        text not null default 'customer'
                check (role in ('customer', 'admin', 'staff')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Trigger: auto-insert profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, first_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'first_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── addresses ────────────────────────────────────────────────────────────────
create table if not exists public.addresses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  label       text not null default 'Home',   -- Home / Work / Other
  full_name   text not null,
  line1       text not null,
  line2       text,                           -- apartment / suite
  city        text not null,
  state       text not null,
  postal_code text,
  country     text not null default 'Nigeria',
  phone       text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Only one default address per user
create unique index if not exists addresses_default_per_user
  on public.addresses (user_id)
  where is_default = true;
