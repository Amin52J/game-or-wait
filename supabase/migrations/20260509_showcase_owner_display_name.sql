-- Public label for showcase page title (e.g. "<name> library")
alter table library_showcases
  add column if not exists owner_display_name text;
