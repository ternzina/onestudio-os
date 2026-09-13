alter table public.platform_guide_articles
  add column if not exists indexnow_submitted_at timestamptz;

create index if not exists platform_guide_articles_indexnow_pending_idx
  on public.platform_guide_articles (publication_status, indexnow_submitted_at, updated_at)
  where publication_status = 'published';

update public.platform_guide_articles
set indexnow_submitted_at = now()
where publication_status = 'published'
  and indexnow_submitted_at is null;

create or replace function public.publish_review_guides_for_cron(
  p_limit integer default 20
)
returns table(article_id uuid, slug text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_ids uuid[];
begin
  select array_agg(candidate.id)
  into v_ids
  from (
    select a.id
    from public.platform_guide_articles as a
    join public.platform_guide_article_locales as l
      on l.article_id = a.id
     and l.locale = a.original_locale
    where a.publication_status = 'review'
      and a.published_at is null
      and l.translation_status = 'review'
    order by a.updated_at asc, a.id
    limit least(greatest(coalesce(p_limit, 20), 1), 100)
    for update of a skip locked
  ) as candidate;

  if coalesce(array_length(v_ids, 1), 0) = 0 then
    return;
  end if;

  update public.platform_guide_articles as a
  set publication_status = 'published',
      published_at = current_date
  where a.id = any(v_ids);

  update public.platform_guide_article_locales as l
  set translation_status = 'published'
  from public.platform_guide_articles as a
  where a.id = l.article_id
    and a.id = any(v_ids)
    and l.locale = a.original_locale
    and l.translation_status = 'review';

  return query
  select a.id, l.slug
  from public.platform_guide_articles as a
  join public.platform_guide_article_locales as l
    on l.article_id = a.id
   and l.locale = a.original_locale
  where a.id = any(v_ids)
  order by l.slug;
end;
$$;

create or replace function public.pending_guide_indexnow_for_cron(
  p_limit integer default 50
)
returns table(article_id uuid, slug text)
language sql
security invoker
set search_path = ''
stable
as $$
  select a.id, l.slug
  from public.platform_guide_articles as a
  join public.platform_guide_article_locales as l
    on l.article_id = a.id
   and l.locale = a.original_locale
  where a.publication_status = 'published'
    and a.published_at is not null
    and a.published_at <= current_date
    and a.indexnow_submitted_at is null
    and l.translation_status = 'published'
  order by a.updated_at asc, a.id
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;

create or replace function public.mark_guide_indexnow_submitted_for_cron(
  p_article_ids uuid[]
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer := 0;
begin
  if p_article_ids is null or coalesce(array_length(p_article_ids, 1), 0) = 0 then
    return 0;
  end if;

  update public.platform_guide_articles as a
  set indexnow_submitted_at = now()
  where a.id = any(p_article_ids)
    and a.publication_status = 'published'
    and a.indexnow_submitted_at is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.publish_review_guides_for_cron(integer)
  from public, anon, authenticated;
revoke execute on function public.pending_guide_indexnow_for_cron(integer)
  from public, anon, authenticated;
revoke execute on function public.mark_guide_indexnow_submitted_for_cron(uuid[])
  from public, anon, authenticated;

grant execute on function public.publish_review_guides_for_cron(integer)
  to service_role;
grant execute on function public.pending_guide_indexnow_for_cron(integer)
  to service_role;
grant execute on function public.mark_guide_indexnow_submitted_for_cron(uuid[])
  to service_role;
