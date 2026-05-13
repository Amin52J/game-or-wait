-- Explicit Data API (PostgREST) grants for anon / authenticated / service_role.
-- Safe to re-run; required for new Supabase projects after default-privilege changes
-- and for existing projects from 2026-10-30 onward for newly created tables.
-- See: https://supabase.com/docs/guides/api/api-recipes#grants

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.profiles to anon;
grant select, insert, update, delete on table public.profiles to authenticated, service_role;

grant select on table public.user_settings to anon;
grant select, insert, update, delete on table public.user_settings to authenticated, service_role;

grant select on table public.games to anon;
grant select, insert, update, delete on table public.games to authenticated, service_role;

grant select on table public.analysis_history to anon;
grant select, insert, update, delete on table public.analysis_history to authenticated, service_role;

grant select on table public.library_showcases to anon;
grant select, insert, update, delete on table public.library_showcases to authenticated, service_role;

-- Edge Function only (PostgREST as service_role). Not safe for anon/authenticated — user_id is not validated against auth.uid().
revoke execute on function public.claim_free_analysis(uuid) from public;
revoke execute on function public.claim_free_analysis(uuid) from anon, authenticated;
grant execute on function public.claim_free_analysis(uuid) to service_role;
