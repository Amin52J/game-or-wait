-- Follow-up discussions attached to a completed analysis.

create table if not exists analysis_discussions (
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

create index if not exists idx_discussions_user on analysis_discussions (user_id);
create index if not exists idx_discussions_thread
  on analysis_discussions (user_id, analysis_id, "timestamp");

alter table analysis_discussions enable row level security;

drop policy if exists "Users can view own discussion messages" on analysis_discussions;
create policy "Users can view own discussion messages"
  on analysis_discussions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own discussion messages" on analysis_discussions;
create policy "Users can insert own discussion messages"
  on analysis_discussions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own discussion messages" on analysis_discussions;
create policy "Users can delete own discussion messages"
  on analysis_discussions for delete using (auth.uid() = user_id);

grant select on table public.analysis_discussions to anon;
grant select, insert, update, delete on table public.analysis_discussions to authenticated, service_role;

-- Re-running an analysis from a discussion overwrites the response, so keep the
-- first version around and allow updates (previously only select/insert/delete
-- were granted, which silently broke the "More Details" expand flow too).
alter table analysis_history add column if not exists original_response text;

drop policy if exists "Users can update own analyses" on analysis_history;
create policy "Users can update own analyses"
  on analysis_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
