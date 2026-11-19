-- Extended announcement controls and Obermessdiener access.
alter table public.announcements
 add column if not exists audience text not null default 'all' check(audience in ('all','messdiener','leitung')),
 add column if not exists pinned boolean not null default false,
 add column if not exists starts_at timestamptz,
 add column if not exists event_at timestamptz,
 add column if not exists location text,
 add column if not exists link_url text;
alter table public.demo_announcements
 add column if not exists audience text not null default 'all' check(audience in ('all','messdiener','leitung')),
 add column if not exists pinned boolean not null default false,
 add column if not exists starts_at timestamptz,
 add column if not exists event_at timestamptz,
 add column if not exists location text,
 add column if not exists link_url text;

create or replace function public.is_leader_or_admin()
returns boolean language sql stable security definer set search_path=public
as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role::text in ('leiter','om','planschreiber','admin') and active=true);
$$;

drop policy if exists "members can read announcements" on public.announcements;
create policy "members can read announcements" on public.announcements for select using(
 auth.uid() is not null and published=true
 and (starts_at is null or starts_at<=now())
 and (expires_at is null or expires_at>now())
 and (audience='all'
  or (audience='messdiener' and public.current_user_role()::text='messdiener')
  or (audience='leitung' and public.current_user_role()::text in ('leiter','om','planschreiber','admin')))
);
drop policy if exists "authenticated users can read demo announcements" on public.demo_announcements;
create policy "authenticated users can read demo announcements" on public.demo_announcements for select using(
 auth.uid() is not null and public.is_demo_mode() and published=true
 and (starts_at is null or starts_at<=now())
 and (expires_at is null or expires_at>now())
 and (audience='all'
  or (audience='messdiener' and public.current_user_role()::text='messdiener')
  or (audience='leitung' and public.current_user_role()::text in ('leiter','om','planschreiber','admin')))
);
