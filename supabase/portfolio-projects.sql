-- Sisters Photo Studio: portfolio grouped by photo sessions/projects.
-- Run this file once in Supabase SQL Editor before using the new admin screen.

create extension if not exists pgcrypto;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.portfolio_categories(id) on delete restrict,
  slug text not null unique,
  title_uk text not null,
  title_pl text not null,
  description_uk text not null default '',
  description_pl text not null default '',
  cover_media_id uuid references public.media_library(id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  media_id uuid not null references public.media_library(id) on delete cascade,
  is_active boolean not null default true,
  sort_order integer not null default 10,
  created_at timestamptz not null default now(),
  unique (project_id, media_id)
);

create index if not exists portfolio_projects_public_order_idx
  on public.portfolio_projects (is_active, sort_order, created_at desc);
create index if not exists portfolio_projects_category_idx
  on public.portfolio_projects (category_id);
create index if not exists portfolio_project_images_order_idx
  on public.portfolio_project_images (project_id, is_active, sort_order);
create index if not exists portfolio_project_images_media_idx
  on public.portfolio_project_images (media_id);

create or replace function public.portfolio_projects_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_projects_updated_at on public.portfolio_projects;
create trigger portfolio_projects_updated_at
before update on public.portfolio_projects
for each row execute function public.portfolio_projects_set_updated_at();

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_project_images enable row level security;

drop policy if exists "Public can read active portfolio projects" on public.portfolio_projects;
create policy "Public can read active portfolio projects"
on public.portfolio_projects for select
using (is_active = true);

drop policy if exists "Admins manage portfolio projects" on public.portfolio_projects;
create policy "Admins manage portfolio projects"
on public.portfolio_projects for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

drop policy if exists "Public can read images of active portfolio projects" on public.portfolio_project_images;
create policy "Public can read images of active portfolio projects"
on public.portfolio_project_images for select
using (
  is_active = true
  and exists (
    select 1 from public.portfolio_projects
    where portfolio_projects.id = portfolio_project_images.project_id
      and portfolio_projects.is_active = true
  )
);

drop policy if exists "Admins manage portfolio project images" on public.portfolio_project_images;
create policy "Admins manage portfolio project images"
on public.portfolio_project_images for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

grant select on public.portfolio_projects to anon, authenticated;
grant select on public.portfolio_project_images to anon, authenticated;
grant insert, update, delete on public.portfolio_projects to authenticated;
grant insert, update, delete on public.portfolio_project_images to authenticated;

