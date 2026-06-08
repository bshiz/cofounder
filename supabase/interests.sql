-- Run this in the Supabase SQL editor (after schema.sql)

-- Profiles table: mirrors auth.users for public name/email access
create table if not exists public.profiles (
  id        uuid references auth.users on delete cascade primary key,
  full_name text,
  email     text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly viewable"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create/update profile on sign-up or sign-in
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  )
  on conflict (id) do update
    set full_name  = excluded.full_name,
        email      = excluded.email,
        updated_at = now();
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for users who signed up before this table existed
insert into public.profiles (id, full_name, email)
select id, raw_user_meta_data ->> 'full_name', email
from auth.users
on conflict (id) do update
  set full_name  = excluded.full_name,
      email      = excluded.email,
      updated_at = now();

-- Interests table
create table if not exists public.interests (
  id         uuid        default gen_random_uuid() primary key,
  concept_id uuid        references public.concepts(id) on delete cascade not null,
  user_id    uuid        references auth.users not null,
  reason     text        not null check (char_length(reason) <= 200),
  created_at timestamptz default now() not null,
  unique (concept_id, user_id)
);

alter table public.interests enable row level security;

-- Concept owners can see all interests on their concepts
create policy "Concept owners can view interests"
  on public.interests for select
  using (
    exists (
      select 1 from public.concepts
      where id = concept_id and user_id = auth.uid()
    )
  );

-- Users can see their own interests (to detect duplicates on the detail page)
create policy "Users can view own interests"
  on public.interests for select
  using (auth.uid() = user_id);

-- Authenticated users can insert (but only for themselves, not as someone else)
create policy "Authenticated can insert interest"
  on public.interests for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own interest"
  on public.interests for delete
  using (auth.uid() = user_id);
