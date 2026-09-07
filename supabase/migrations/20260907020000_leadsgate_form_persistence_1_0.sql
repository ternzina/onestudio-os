-- OneStudio OS
-- LeadsGate custom-block persistence 1.0.
--
-- The legacy custom-block validator predates the safe shared LeadsGate block
-- and converts its kind to text. Delegate to that complete validator first,
-- then restore only the bounded provider contract from the original input.

do $$
begin
  if to_regprocedure(
    'public.normalize_public_site_custom_blocks_v_leadsgate_form_1_0(jsonb)'
  ) is null then
    alter function public.normalize_public_site_custom_blocks(jsonb)
      rename to normalize_public_site_custom_blocks_v_leadsgate_form_1_0;
  end if;
end;
$$;

create or replace function public.normalize_public_site_custom_blocks(p_blocks jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select value as block, ordinality
    from jsonb_array_elements(
      public.normalize_public_site_custom_blocks_v_leadsgate_form_1_0(p_blocks)
    ) with ordinality
  ), source as (
    select value as block, ordinality
    from jsonb_array_elements(
      case when jsonb_typeof(p_blocks) = 'array' then p_blocks else '[]'::jsonb end
    ) with ordinality
    where jsonb_typeof(value) = 'object'
  )
  select coalesce(jsonb_agg(
    normalized.block
    || case
      when source.block->>'kind' = 'leadsgate_form'
        and coalesce(source.block->>'leadsgate_aid', '') ~ '^[0-9]{1,12}$'
        and source.block->>'leadsgate_template' = 'wallet-lines'
      then jsonb_build_object(
        'kind', 'leadsgate_form',
        'leadsgate_aid', source.block->>'leadsgate_aid',
        'leadsgate_template', 'wallet-lines'
      )
      else '{}'::jsonb
    end
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized
  join source using (ordinality);
$$;

revoke all on function public.normalize_public_site_custom_blocks_v_leadsgate_form_1_0(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb)
  from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_custom_blocks(jsonb) is
  'Complete custom-block normalizer with safe shared LeadsGate form persistence: numeric aid and wallet-lines template only.';
