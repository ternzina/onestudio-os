begin;

-- The existing tenant behind babysgames.com stores the public label in the
-- site content and in the premium header block. Keep the template/demo data
-- untouched and update only this tenant's synchronized brand-name fields.
update public.public_site_locales as locale
set
  draft_content = case
    when locale.draft_content is null then null
    else jsonb_set(
      jsonb_set(
        jsonb_set(
          locale.draft_content,
          '{brand_name}',
          to_jsonb('BabysGames'::text),
          true
        ),
        '{template_content,premium-kids-center,brand_name}',
        to_jsonb('BabysGames'::text),
        true
      ),
      '{template_content,premium-kids-center,blocks,0,props,brand_name}',
      to_jsonb('BabysGames'::text),
      true
    )
  end,
  published_content = case
    when locale.published_content is null then null
    else jsonb_set(
      jsonb_set(
        jsonb_set(
          locale.published_content,
          '{brand_name}',
          to_jsonb('BabysGames'::text),
          true
        ),
        '{template_content,premium-kids-center,brand_name}',
        to_jsonb('BabysGames'::text),
        true
      ),
      '{template_content,premium-kids-center,blocks,0,props,brand_name}',
      to_jsonb('BabysGames'::text),
      true
    )
  end,
  updated_at = timezone('utc', now())
from public.public_site_domains as domain
where domain.business_id = locale.business_id
  and domain.domain = 'babysgames.com'
  and coalesce(
    locale.draft_content->>'template_id',
    locale.published_content->>'template_id'
  ) = 'premium-kids-center';

commit;
