-- MGB Connect - initial announcements for the database-backed news area
insert into public.announcements (title, content, priority, published, created_at)
select * from (values
  ('Willkommen bei MGB Connect', 'Über MGB Connect kannst du deine Dienste einsehen, Vertretungen finden und wichtige Informationen der Leitung erhalten.', 'general', true, '2026-09-08T10:00:00+02:00'::timestamptz),
  ('Messdienerplan verfügbar', 'Der aktuelle Messdienerplan wurde veröffentlicht. Bitte überprüft eure eingetragenen Dienste.', 'service', true, '2026-09-07T10:00:00+02:00'::timestamptz),
  ('Leiterrunde', 'Die nächste Leiterrunde findet in Kürze statt.', 'important', false, '2026-09-05T10:00:00+02:00'::timestamptz)
) as seed(title, content, priority, published, created_at)
where not exists (
  select 1 from public.announcements existing
  where existing.title = seed.title and existing.created_at = seed.created_at
);
