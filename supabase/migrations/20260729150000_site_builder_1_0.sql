-- OneStudio OS Site Builder 1.0
-- Adds a validated block order without changing existing published content.

create or replace function public.save_public_site_draft(
  p_business_id uuid,
  p_locale text,
  p_content jsonb,
  p_make_primary boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_locale text := lower(trim(coalesce(p_locale, '')));
  business_name text;
  normalized_content jsonb;
  requested_order jsonb;
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'public_site_configuration_forbidden' using errcode = '42501';
  end if;

  if normalized_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then
    raise exception 'public_site_locale_invalid' using errcode = '22023';
  end if;

  select b.name into business_name
  from public.businesses b
  where b.id = p_business_id and b.status <> 'archived';

  if business_name is null then
    raise exception 'public_site_business_not_found' using errcode = '23503';
  end if;

  normalized_content := public.normalize_public_site_content(
    business_name,
    normalized_locale,
    p_content
  );

  requested_order := p_content->'section_order';
  if jsonb_typeof(requested_order) <> 'array'
    or jsonb_array_length(requested_order) <> 4
    or not requested_order @> '["services","portfolio","about","contact"]'::jsonb
  then
    requested_order := '["services","portfolio","about","contact"]'::jsonb;
  end if;

  normalized_content := jsonb_set(
    normalized_content,
    '{section_order}',
    requested_order,
    true
  );

  insert into public.public_site_locales (business_id, locale, draft_content)
  values (p_business_id, normalized_locale, normalized_content)
  on conflict (business_id, locale) do update
  set draft_content = excluded.draft_content,
      updated_at = now();

  if p_make_primary then
    update public.public_site_settings
    set primary_locale = normalized_locale,
        updated_at = now()
    where business_id = p_business_id;
  end if;

  return normalized_content;
end;
$$;

update public.public_site_locales
set draft_content = jsonb_set(
      draft_content,
      '{section_order}',
      '["services","portfolio","about","contact"]'::jsonb,
      true
    ),
    updated_at = now()
where not (draft_content ? 'section_order');

update public.public_site_locales
set published_content = jsonb_set(
      published_content,
      '{section_order}',
      '["services","portfolio","about","contact"]'::jsonb,
      true
    ),
    updated_at = now()
where published_content is not null
  and not (published_content ? 'section_order');

revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean)
from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
to authenticated;
