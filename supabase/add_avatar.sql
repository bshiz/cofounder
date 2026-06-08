-- Run this in the Supabase SQL editor (after interests.sql)

alter table public.profiles
  add column if not exists avatar_url text;

-- Update trigger to also capture avatar_url on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set full_name   = excluded.full_name,
        email       = excluded.email,
        avatar_url  = excluded.avatar_url,
        updated_at  = now();
  return new;
end;
$$;

-- Backfill avatar_url for users who already have a profile
update public.profiles p
set avatar_url = u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
where p.id = u.id;
