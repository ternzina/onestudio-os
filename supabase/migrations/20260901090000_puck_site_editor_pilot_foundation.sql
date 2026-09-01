-- Local/test pilot migration draft. Do not apply remotely before rollout approval.
-- Adds an isolated save path; legacy save_public_site_draft and publish_public_site remain unchanged.

create or replace function public.save_public_site_puck_draft(
  p_business_id uuid,
  p_locale text,
  p_puck_document jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_locale text := lower(trim(coalesce(p_locale, '')));
  saved jsonb;
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'puck_site_draft_forbidden' using errcode = '42501';
  end if;
  if normalized_locale !~ '^[a-z]{2,3}(-[a-z0-9]{2,8})*$' then
    raise exception 'puck_site_locale_invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(p_puck_document) <> 'object'
    or p_puck_document->>'version' <> '1'
    or p_puck_document->>'registryVersion' <> 'onestudio-puck-1'
    or jsonb_typeof(p_puck_document->'content') <> 'array'
    or pg_column_size(p_puck_document) > 512000
  then
    raise exception 'puck_site_document_invalid' using errcode = '22023';
  end if;

  update public.public_site_locales
  set draft_content = jsonb_set(draft_content, '{puck_document}', p_puck_document, true),
      updated_at = now()
  where business_id = p_business_id and locale = normalized_locale
  returning draft_content into saved;

  if saved is null then
    raise exception 'public_site_locale_not_found' using errcode = '23503';
  end if;
  return saved;
end;
$$;

revoke all on function public.save_public_site_puck_draft(uuid, text, jsonb) from public, anon;
grant execute on function public.save_public_site_puck_draft(uuid, text, jsonb) to authenticated, service_role;
