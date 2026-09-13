-- MGB Connect - initial Supabase schema
-- Run this once in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('messdiener', 'leiter', 'planschreiber', 'admin');
create type public.service_status as enum ('scheduled', 'exchange_requested', 'taken_over', 'excused', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role public.user_role not null default 'messdiener',
  points integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_iso date not null,
  time text not null,
  location text not null default '',
  leader_id uuid references public.profiles(id) on delete set null,
  meeting text not null default '',
  points integer not null default 0,
  status public.service_status not null default 'scheduled',
  assigned_to uuid references public.profiles(id) on delete set null,
  taken_by uuid references public.profiles(id) on delete set null,
  excuse_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  priority text not null default 'normal',
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.announcements enable row level security;

create or replace function public.is_admin_or_planner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'planschreiber')
      and active = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

create policy "users can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "admins can read all profiles"
on public.profiles for select
using (public.is_admin());

create policy "admins can update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "members can read services"
on public.services for select
using (auth.uid() is not null);

create policy "planners can insert services"
on public.services for insert
with check (public.is_admin_or_planner());

create policy "planners can update services"
on public.services for update
using (public.is_admin_or_planner())
with check (public.is_admin_or_planner());

create policy "members can read announcements"
on public.announcements for select
using (auth.uid() is not null and published = true);

create policy "admins can manage announcements"
on public.announcements for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
