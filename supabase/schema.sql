-- Run this in the Supabase SQL editor

-- Concepts table
create table public.concepts (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users not null,
  title       text        not null,
  description text        not null,
  category    text        not null,
  html_file_url text      not null,
  created_at  timestamptz default now() not null
);

alter table public.concepts enable row level security;

create policy "Public read concepts"
  on public.concepts for select using (true);

create policy "Authenticated insert"
  on public.concepts for insert
  with check (auth.uid() = user_id);

create policy "Owner update"
  on public.concepts for update
  using (auth.uid() = user_id);

create policy "Owner delete"
  on public.concepts for delete
  using (auth.uid() = user_id);

-- Storage bucket (public, so iframe src works without auth)
insert into storage.buckets (id, name, public)
  values ('concepts', 'concepts', true)
  on conflict (id) do nothing;

create policy "Public read concept files"
  on storage.objects for select
  using (bucket_id = 'concepts');

create policy "Authenticated upload concept files"
  on storage.objects for insert
  with check (bucket_id = 'concepts' and auth.role() = 'authenticated');

create policy "Owner delete concept files"
  on storage.objects for delete
  using (bucket_id = 'concepts' and auth.uid()::text = (storage.foldername(name))[1]);
