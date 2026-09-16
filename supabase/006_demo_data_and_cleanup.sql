-- MGB Connect: demo data upgrade + cleanup of old presentation seed data
-- Run once in Supabase SQL Editor AFTER 005_demo_mode.sql.
-- Safe to re-run.

-- ------------------------------------------------------------
-- Remove the old presentation data from the REAL services table.
-- These exact rows were created by the former presentation seed.
-- ------------------------------------------------------------
delete from public.services
where (title, date_iso, time, location) in (
  ('Hochamt', '2026-09-19'::date, '10:00', 'Kirche'),
  ('Familienmesse', '2026-09-20'::date, '10:30', 'Kirche'),
  ('Vorabendmesse', '2026-09-26'::date, '18:00', 'Kirche'),
  ('Sonntagsmesse', '2026-09-27'::date, '10:00', 'Kirche'),
  ('Jugendmesse', '2026-10-04'::date, '18:00', 'Kirche'),
  ('Erntedank', '2026-10-11'::date, '10:00', 'Kirche'),
  ('Familiengottesdienst', '2026-10-18'::date, '10:30', 'Kirche'),
  ('Sonntagsmesse', '2026-08-30'::date, '10:00', 'Kirche'),
  ('Sonntagsmesse', '2026-08-23'::date, '10:00', 'Kirche'),
  ('Sonntagsmesse', '2026-08-16'::date, '10:00', 'Kirche')
);

-- ------------------------------------------------------------
-- Demo announcements are isolated from real announcements.
-- ------------------------------------------------------------
create table if not exists public.demo_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  priority text not null default 'general',
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.demo_announcements enable row level security;

drop policy if exists "demo_announcements_authenticated_select" on public.demo_announcements;
drop policy if exists "demo_announcements_admin_insert" on public.demo_announcements;
drop policy if exists "demo_announcements_admin_update" on public.demo_announcements;
drop policy if exists "demo_announcements_admin_delete" on public.demo_announcements;

create policy "demo_announcements_authenticated_select"
on public.demo_announcements for select
to authenticated
using (public.is_demo_mode() and published = true);

create policy "demo_announcements_admin_insert"
on public.demo_announcements for insert
to authenticated
with check (public.is_admin() and public.is_demo_mode());

create policy "demo_announcements_admin_update"
on public.demo_announcements for update
to authenticated
using (public.is_admin() and public.is_demo_mode())
with check (public.is_admin() and public.is_demo_mode());

create policy "demo_announcements_admin_delete"
on public.demo_announcements for delete
to authenticated
using (public.is_admin() and public.is_demo_mode());

grant select on public.demo_announcements to authenticated;
grant insert, update, delete on public.demo_announcements to authenticated;

-- ------------------------------------------------------------
-- Complete demo reset.
-- Every active profile gets several personal services in different states.
-- Additional open services make the marketplace usable with one account.
-- ------------------------------------------------------------
create or replace function public.reset_demo_data()
returns void language plpgsql security definer set search_path = public
as $$
declare
  p record;
  other_id uuid;
  idx integer := 0;
  base_date date := current_date;
begin
  if not public.is_admin() then
    raise exception 'Nur Administratoren dürfen den Demo-Modus verwalten';
  end if;

  delete from public.demo_services where true;
  delete from public.demo_announcements where true;

  for p in
    select id, display_name
    from public.profiles
    where active = true
    order by created_at, id
  loop
    idx := idx + 1;

    -- Completed service: demonstrates history and points.
    insert into public.demo_services
      (title, date_iso, time, location, meeting, points, status, assigned_to)
    values
      ('Abgeschlossener Demo-Dienst ' || idx, base_date - 3, '10:00', 'Demo-Ort', '09:30', 15, 'completed', p.id);

    -- Scheduled service: can be excused or released.
    insert into public.demo_services
      (title, date_iso, time, location, meeting, points, status, assigned_to)
    values
      ('Geplanter Demo-Dienst ' || idx, base_date + 1, '18:00', 'Demo-Ort', '17:30', 10, 'scheduled', p.id);

    -- Second scheduled service: gives the user another independent test case.
    insert into public.demo_services
      (title, date_iso, time, location, meeting, points, status, assigned_to)
    values
      ('Weiterer Demo-Dienst ' || idx, base_date + 2, '10:30', 'Demo-Ort', '10:00', 10, 'scheduled', p.id);

    -- Already excused service: demonstrates the status and reason UI.
    insert into public.demo_services
      (title, date_iso, time, location, meeting, points, status, excuse_reason, assigned_to)
    values
      ('Abgemeldeter Demo-Dienst ' || idx, base_date + 3, '18:30', 'Demo-Ort', '18:00', 10, 'excused', 'Schule', p.id);

    -- Already released service: demonstrates the marketplace state in My Services.
    insert into public.demo_services
      (title, date_iso, time, location, meeting, points, status, assigned_to)
    values
      ('Freigegebener Demo-Dienst ' || idx, base_date + 4, '18:00', 'Demo-Ort', '17:30', 10, 'exchange_requested', p.id);

    -- Already taken-over service, if another active profile exists.
    select id into other_id
    from public.profiles
    where active = true and id <> p.id
    order by created_at, id
    limit 1;

    if other_id is not null then
      insert into public.demo_services
        (title, date_iso, time, location, meeting, points, status, assigned_to, taken_by)
      values
        ('Übernommener Demo-Dienst ' || idx, base_date + 5, '10:00', 'Demo-Ort', '09:30', 10, 'taken_over', p.id, other_id);
    end if;
  end loop;

  -- Open marketplace services are intentionally unassigned, so every demo user
  -- can see and take them. This is separate from each user's own released service.
  insert into public.demo_services
    (title, date_iso, time, location, meeting, points, status)
  values
    ('Offener Demo-Dienst A', base_date + 6, '18:30', 'Demo-Ort', '18:00', 10, 'exchange_requested'),
    ('Offener Demo-Dienst B', base_date + 7, '10:00', 'Demo-Ort', '09:30', 15, 'exchange_requested'),
    ('Offener Demo-Dienst C', base_date + 8, '18:00', 'Demo-Ort', '17:30', 10, 'exchange_requested'),
    ('Offener Demo-Dienst D', base_date + 9, '10:30', 'Demo-Ort', '10:00', 15, 'exchange_requested');

  -- Demo news for the dashboard/news page.
  insert into public.demo_announcements (title, content, priority, published)
  values
    ('Demo: Neuer Messdienerplan', 'Dies ist eine Beispiel-Ankündigung für die Präsentation von MGB Connect.', 'general', true),
    ('Demo: Diensttausch', 'Hier kannst du beispielhaft einen offenen Dienst übernehmen.', 'service', true),
    ('Demo: Wichtige Information', 'Diese Meldung zeigt, wie wichtige Nachrichten in MGB Connect dargestellt werden.', 'important', true);
end;
$$;

grant execute on function public.reset_demo_data() to authenticated;

-- Existing set_demo_mode() already calls reset_demo_data(), so it now uses the
-- complete dataset above whenever the administrator activates demo mode.
