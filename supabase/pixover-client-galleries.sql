-- Модуль клиентских галерей Pixover для Sister's Photo Studio.
-- Выполнить один раз целиком в Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.client_galleries (
  id uuid primary key default gen_random_uuid(),
  booking_kind text not null default 'photo'
    check (booking_kind in ('photo', 'rental')),
  booking_reference text not null,
  client_name text,
  client_email text,
  booking_date date,
  language text not null default 'uk'
    check (language in ('uk', 'pl')),
  pixover_url text not null,
  access_password text,
  public_token uuid not null default gen_random_uuid() unique,
  status text not null default 'draft'
    check (status in ('draft', 'sent')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_kind, booking_reference)
);

create index if not exists client_galleries_public_token_idx
  on public.client_galleries (public_token);

create index if not exists client_galleries_client_email_idx
  on public.client_galleries (client_email);

alter table public.client_galleries enable row level security;

-- Политики специально не создаются: браузер не получает прямой доступ к
-- приватным ссылкам и паролям. Чтение и запись выполняют только защищённые
-- серверные маршруты после проверки роли администратора.
