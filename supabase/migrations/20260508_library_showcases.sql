-- Read-only public library snapshots (shareable URLs)
create table library_showcases (
  public_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  games jsonb not null default '[]'::jsonb,
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
