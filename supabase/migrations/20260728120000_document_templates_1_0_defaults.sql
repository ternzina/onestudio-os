-- OneStudio OS Document Templates 1.0
-- Complete the default template library for existing and future workspaces.

create or replace function public.seed_document_templates(p_business_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is not null and not public.can_configure_business(p_business_id) then
    raise exception 'document_template_seed_forbidden' using errcode = '42501';
  end if;

  insert into public.document_templates (business_id, template_key, document_type, locale, title_template, body_template, status)
  values
    (p_business_id, 'service_contract', 'contract', 'uk',
      'Договір № {{document.number}}',
      E'ДОГОВІР ПРО НАДАННЯ ПОСЛУГ\n\nВиконавець: {{company.legal_name}}, РНОКПП/ЄДРПОУ {{company.tax_id}}.\nКлієнт: {{client.name}}, email: {{client.email}}, телефон: {{client.phone}}.\n\nПредмет: надання послуги «{{service.title}}».\nБронювання: {{booking.reference}} від {{booking.date}}.\nВартість: {{booking.total}} {{booking.currency}}.\n\nБанківські реквізити Виконавця: {{company.bank_name}}, IBAN {{company.iban}}.\nКонтакти: {{company.email}}, {{company.website}}.',
      'active'),
    (p_business_id, 'invoice', 'invoice', 'uk',
      'Рахунок № {{document.number}}',
      E'РАХУНОК НА ОПЛАТУ\n\nПостачальник: {{company.legal_name}}\nРНОКПП/ЄДРПОУ: {{company.tax_id}}\nIBAN: {{company.iban}}\nБанк: {{company.bank_name}}\n\nПлатник: {{client.name}}\nПослуга: {{service.title}}\nБронювання: {{booking.reference}}\nДо сплати: {{booking.total}} {{booking.currency}}\nДата: {{document.date}}',
      'active'),
    (p_business_id, 'service_act', 'act', 'uk',
      'Акт № {{document.number}}',
      E'АКТ НАДАНИХ ПОСЛУГ\n\nМи, {{company.legal_name}} та {{client.name}}, підтверджуємо надання послуги «{{service.title}}» за бронюванням {{booking.reference}}.\n\nСума: {{booking.total}} {{booking.currency}}.\nДата складання: {{document.date}}.\nСторони не мають взаємних претензій щодо обсягу та якості послуг.',
      'active'),
    (p_business_id, 'commercial_offer', 'commercial_offer', 'uk',
      'Комерційна пропозиція № {{document.number}}',
      E'КОМЕРЦІЙНА ПРОПОЗИЦІЯ\n\n{{company.display_name}} пропонує клієнту {{client.name}} послугу «{{service.title}}».\n\nОрієнтовна дата / бронювання: {{booking.date}}\nРеференс бронювання: {{booking.reference}}\nВартість пропозиції: {{booking.total}} {{booking.currency}}\n\nПропозиція підготовлена {{document.date}} та може бути уточнена після погодження деталей.\n\nКонтакти: {{company.email}}, {{company.website}}.',
      'active'),
    (p_business_id, 'privacy_consent', 'privacy_consent', 'uk',
      'Згода на обробку персональних даних № {{document.number}}',
      E'ЗГОДА НА ОБРОБКУ ПЕРСОНАЛЬНИХ ДАНИХ\n\nЯ, {{client.name}}, надаю згоду {{company.legal_name}} на обробку моїх персональних даних для організації, виконання та комунікації щодо послуги «{{service.title}}».\n\nДані для зв’язку: {{client.email}}, {{client.phone}}.\nПов’язане бронювання: {{booking.reference}}.\nДата згоди: {{document.date}}.\n\nКонтакт виконавця з питань персональних даних: {{company.email}}.',
      'active')
  on conflict (business_id, template_key, locale, version) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.seed_document_templates(uuid) to authenticated, service_role;

do $$
declare
  v_business_id uuid;
begin
  for v_business_id in select id from public.businesses loop
    perform public.seed_document_templates(v_business_id);
  end loop;
end $$;
