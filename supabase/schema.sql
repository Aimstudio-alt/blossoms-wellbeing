-- Blossoms Wellbeing Tracker — database schema & RLS policies
-- Run this in the Supabase SQL editor after creating a fresh project.

-- ============================================================
-- 1. profiles table (one row per auth.users entry)
-- ============================================================
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  is_therapist     boolean not null default false,
  sharing_enabled  boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 2. checkins table
-- ============================================================
create table if not exists public.checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  date        date not null,
  mood        smallint not null check (mood between 1 and 10),
  anxiety     smallint not null check (anxiety between 1 and 10),
  sleep       smallint not null check (sleep between 1 and 10),
  gratitude   text,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, date) -- one entry per client per day
);

create index if not exists checkins_user_date_idx
  on public.checkins (user_id, date desc);

-- ============================================================
-- 3. auto-create a profile row when a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 4. Row-level security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.checkins enable row level security;

-- -- Clean up any previous versions --
drop policy if exists "profiles: self read"           on public.profiles;
drop policy if exists "profiles: self update"         on public.profiles;
drop policy if exists "profiles: therapist read all"  on public.profiles;
drop policy if exists "checkins: self all"            on public.checkins;
drop policy if exists "checkins: therapist read shared" on public.checkins;

-- Profiles ---------------------------------------------------
-- Every user can see their own profile
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

-- Every user can update their own profile (used for the sharing toggle).
-- Note: is_therapist is NOT settable from the client; see trigger below.
create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- A therapist can read any profile that currently has sharing enabled,
-- so the therapist dashboard can list clients.
create policy "profiles: therapist read all"
  on public.profiles for select
  using (
    sharing_enabled = true
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_therapist = true
    )
  );

-- Prevent clients from promoting themselves to therapist via update.
create or replace function public.prevent_therapist_self_promotion()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.is_therapist is distinct from old.is_therapist then
    new.is_therapist := old.is_therapist;
  end if;
  return new;
end;
$$;

drop trigger if exists lock_is_therapist on public.profiles;
create trigger lock_is_therapist
  before update on public.profiles
  for each row execute procedure public.prevent_therapist_self_promotion();

-- Checkins ---------------------------------------------------
-- Clients see / insert / update / delete only their own entries.
create policy "checkins: self all"
  on public.checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- A therapist can read (only read) checkins belonging to clients who
-- currently have sharing_enabled = true.
create policy "checkins: therapist read shared"
  on public.checkins for select
  using (
    exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.is_therapist = true
    )
    and exists (
      select 1 from public.profiles owner
      where owner.id = checkins.user_id
        and owner.sharing_enabled = true
    )
  );
