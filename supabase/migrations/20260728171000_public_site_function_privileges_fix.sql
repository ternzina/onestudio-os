-- Public Site Foundation 1.0 privilege hardening.
-- The clean-base default privileges granted EXECUTE directly to anon and
-- authenticated when these functions were created. Removing PUBLIC alone does
-- not remove those role-specific grants.

revoke all on function public.default_public_site_content(text, text) from public, anon, authenticated;
revoke all on function public.normalize_public_site_content(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.ensure_public_site_workspace() from public, anon, authenticated;
revoke all on function public.refresh_unpublished_public_site_identity() from public, anon, authenticated;
revoke all on function public.get_public_site_editor(uuid) from public, anon, authenticated;
revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean) from public, anon, authenticated;
revoke all on function public.publish_public_site(uuid, text) from public, anon, authenticated;
revoke all on function public.unpublish_public_site(uuid) from public, anon, authenticated;
revoke all on function public.get_public_site(text, text) from public, anon, authenticated;
revoke all on function public.list_public_site_paths() from public, anon, authenticated;

grant execute on function public.get_public_site_editor(uuid) to authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean) to authenticated;
grant execute on function public.publish_public_site(uuid, text) to authenticated;
grant execute on function public.unpublish_public_site(uuid) to authenticated;
grant execute on function public.get_public_site(text, text) to anon, authenticated;
grant execute on function public.list_public_site_paths() to anon, authenticated;
