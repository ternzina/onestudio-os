-- OneStudio OS
-- Public site legacy save compatibility hotfix.
--
-- The current editor sends section_order and saves successfully.
-- Older callers and the foundation contract may omit section_order.
-- Delegate the legacy RPC to the null-safe v22 implementation so both
-- entry points use one source of truth.

create or replace function public.save_public_site_draft(
  p_business_id uuid,
  p_locale text,
  p_content jsonb,
  p_make_primary boolean default false
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.save_public_site_draft_v22(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );
$$;

revoke all on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) from public, anon, authenticated;

grant execute on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) to authenticated;

comment on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) is
  'Compatibility entry point delegated to null-safe save_public_site_draft_v22.';
