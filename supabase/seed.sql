-- MGB Connect - presentation seed data
-- Run once in Supabase SQL Editor AFTER schema.sql and the service transition migration.
-- Safe to re-run: existing rows with these titles/dates are removed first.

insert into public.services (
  title, date_iso, time, location, meeting, points, status
)
select * from (values
  ('Hochamt', '2026-09-19'::date, '10:00', 'Kirche', '09:30', 10, 'scheduled'::public.service_status),
  ('Familienmesse', '2026-09-20'::date, '10:30', 'Kirche', '10:00', 10, 'scheduled'::public.service_status),
  ('Vorabendmesse', '2026-09-26'::date, '18:00', 'Kirche', '17:30', 10, 'exchange_requested'::public.service_status),
  ('Sonntagsmesse', '2026-09-27'::date, '10:00', 'Kirche', '09:30', 10, 'scheduled'::public.service_status),
  ('Jugendmesse', '2026-10-04'::date, '18:00', 'Kirche', '17:30', 15, 'scheduled'::public.service_status),
  ('Erntedank', '2026-10-11'::date, '10:00', 'Kirche', '09:30', 15, 'scheduled'::public.service_status),
  ('Familiengottesdienst', '2026-10-18'::date, '10:30', 'Kirche', '10:00', 10, 'scheduled'::public.service_status),
  ('Sonntagsmesse', '2026-08-30'::date, '10:00', 'Kirche', '09:30', 10, 'completed'::public.service_status),
  ('Sonntagsmesse', '2026-08-23'::date, '10:00', 'Kirche', '09:30', 10, 'completed'::public.service_status),
  ('Sonntagsmesse', '2026-08-16'::date, '10:00', 'Kirche', '09:30', 10, 'excused'::public.service_status)
) as seed(title, date_iso, time, location, meeting, points, status)
where not exists (
  select 1
  from public.services existing
  where existing.title = seed.title
    and existing.date_iso = seed.date_iso
    and existing.time = seed.time
);

-- Give the currently available active profile a few personal services.
-- This makes "Meine Dienste" immediately useful after signup without needing
-- to know the user's UUID beforehand.
update public.services
set assigned_to = profile.id
from (
  select id
  from public.profiles
  where active = true
  order by created_at asc
  limit 1
) profile
where public.services.assigned_to is null
  and public.services.date_iso in ('2026-09-19', '2026-09-27', '2026-10-11');

-- The exchange example should remain available in the marketplace.
update public.services
set status = 'exchange_requested',
    taken_by = null,
    excuse_reason = null
where title = 'Vorabendmesse'
  and date_iso = '2026-09-26'
  and time = '18:00';
