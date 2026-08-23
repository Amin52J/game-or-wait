-- GameOrWait database schema for Supabase
-- Run this in the Supabase SQL Editor after creating your project.

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  steam_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index idx_profiles_steam_id on profiles (steam_id) where steam_id is not null;

-- User settings (AI provider config, setup answers, instructions)
create table user_settings (
  id uuid references auth.users on delete cascade primary key,
  ai_provider jsonb,
  setup_answers jsonb,
  instructions text default '',
  is_setup_complete boolean default false,
  free_analyses_used integer default 0,
  updated_at timestamptz default now()
);

-- Atomically claim a free analysis slot (returns false if quota exceeded)
create or replace function claim_free_analysis(user_id uuid)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  current_count integer;
begin
  -- Ensure user_settings row exists (handles edge case where trigger didn't fire)
  insert into public.user_settings (id)
  values (user_id)
  on conflict (id) do nothing;

  select free_analyses_used into current_count
  from public.user_settings
  where id = user_id
  for update;

  if current_count is null or current_count >= 5 then
    return false;
  end if;

  update public.user_settings
  set free_analyses_used = current_count + 1,
      updated_at = now()
  where id = user_id;

  return true;
end;
$$;

-- Game library
create table games (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  sorting_name text,
  score integer,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

-- Analysis history
create table analysis_history (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  game_name text not null,
  price numeric not null,
  response text not null,
  -- Set the first time a discussion re-runs the analysis, so the original stays readable
  original_response text,
  "timestamp" bigint not null,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

-- Follow-up discussion messages attached to an analysis
create table analysis_discussions (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  analysis_id text not null,
  role text not null check (role in ('user', 'assistant', 'revision')),
  content text not null,
  "timestamp" bigint not null,
  created_at timestamptz default now(),
  primary key (id, user_id),
  foreign key (analysis_id, user_id) references analysis_history (id, user_id) on delete cascade
);

-- Indexes
create index idx_games_user on games (user_id);
create index idx_analysis_user on analysis_history (user_id);
create index idx_analysis_user_ts on analysis_history (user_id, "timestamp" desc);
create index idx_discussions_user on analysis_discussions (user_id);
create index idx_discussions_thread on analysis_discussions (user_id, analysis_id, "timestamp");

-- RLS policies
alter table profiles enable row level security;
alter table user_settings enable row level security;
alter table games enable row level security;
alter table analysis_history enable row level security;
alter table analysis_discussions enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can view own settings"
  on user_settings for select using (auth.uid() = id);
create policy "Users can upsert own settings"
  on user_settings for insert with check (auth.uid() = id);
create policy "Users can update own settings"
  on user_settings for update using (auth.uid() = id);

create policy "Users can view own games"
  on games for select using (auth.uid() = user_id);
create policy "Users can insert own games"
  on games for insert with check (auth.uid() = user_id);
create policy "Users can update own games"
  on games for update using (auth.uid() = user_id);
create policy "Users can delete own games"
  on games for delete using (auth.uid() = user_id);

create policy "Users can view own analyses"
  on analysis_history for select using (auth.uid() = user_id);
create policy "Users can insert own analyses"
  on analysis_history for insert with check (auth.uid() = user_id);
create policy "Users can update own analyses"
  on analysis_history for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own analyses"
  on analysis_history for delete using (auth.uid() = user_id);

create policy "Users can view own discussion messages"
  on analysis_discussions for select using (auth.uid() = user_id);
create policy "Users can insert own discussion messages"
  on analysis_discussions for insert with check (auth.uid() = user_id);
create policy "Users can delete own discussion messages"
  on analysis_discussions for delete using (auth.uid() = user_id);

-- Read-only library snapshots shareable via public URL
create table library_showcases (
  public_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  games jsonb not null default '[]'::jsonb,
  owner_display_name text,
  updated_at timestamptz default now(),
  constraint library_showcases_user_id_key unique (user_id)
);

create index idx_library_showcases_updated on library_showcases (updated_at desc);

alter table library_showcases enable row level security;

create policy "Anyone can read library showcases"
  on library_showcases for select using (true);

create policy "Users can insert own library showcase"
  on library_showcases for insert with check (auth.uid() = user_id);

create policy "Users can update own library showcase"
  on library_showcases for update using (auth.uid() = user_id);

create policy "Users can delete own library showcase"
  on library_showcases for delete using (auth.uid() = user_id);

-- Auto-create profile + settings on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));

  insert into public.user_settings (id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Data API (PostgREST / supabase-js): explicit privileges for api roles
grant usage on schema public to anon, authenticated, service_role;

grant select on table public.profiles to anon;
grant select, insert, update, delete on table public.profiles to authenticated, service_role;

grant select on table public.user_settings to anon;
grant select, insert, update, delete on table public.user_settings to authenticated, service_role;

grant select on table public.games to anon;
grant select, insert, update, delete on table public.games to authenticated, service_role;

grant select on table public.analysis_history to anon;
grant select, insert, update, delete on table public.analysis_history to authenticated, service_role;

grant select on table public.analysis_discussions to anon;
grant select, insert, update, delete on table public.analysis_discussions to authenticated, service_role;

grant select on table public.library_showcases to anon;
grant select, insert, update, delete on table public.library_showcases to authenticated, service_role;

-- Edge Function only (PostgREST as service_role). Not safe for anon/authenticated — user_id is not validated against auth.uid().
revoke execute on function public.claim_free_analysis(uuid) from public;
revoke execute on function public.claim_free_analysis(uuid) from anon, authenticated;
grant execute on function public.claim_free_analysis(uuid) to service_role;
