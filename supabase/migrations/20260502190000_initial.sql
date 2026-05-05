-- Receptbok: Postgres + Auth (Supabase)
-- Apply with: `supabase db push` or paste into Dashboard → SQL Editor.

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  portions integer,
  category text default 'Okategoriserat',
  ingredients text[] not null default '{}',
  instructions text[] not null default '{}',
  image text default '',
  source_image text default '',
  created_at timestamptz not null default now()
);

create index if not exists recipes_created_at_idx on public.recipes (created_at desc);

alter table public.recipes enable row level security;

create policy "recipes_service_role_all"
  on public.recipes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text default '',
  username text default '',
  favorites text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_service_role_all"
  on public.profiles
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'username', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- API (service role) och inloggad användare (profiles)
grant usage on schema public to anon, authenticated, service_role;

grant all on table public.recipes to service_role;

grant select, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
