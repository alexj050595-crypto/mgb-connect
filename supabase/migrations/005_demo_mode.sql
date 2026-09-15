-- MGB Connect: isolated, resettable demo mode
-- Real services/announcements are never changed while demo mode is active.

create or replace function public.is_demo_mode()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select (value ->> 'enabled')::boolean from public.system_settings where key = 'demo_mode'), false);
$$;

insert into public.system_settings (key, value)
values ('demo_mode', '{"enabled":false}'::jsonb)
on conflict (key) do nothing;

grant execute on function public.is_demo_mode() to authenticated;

create table if not exists public.demo_services (
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

alter table public.demo_services enable row level security;
alter table public.demo_announcements enable row level security;

drop policy if exists "authenticated users can read demo services" on public.demo_services;
create policy "authenticated users can read demo services" on public.demo_services for select
using (auth.uid() is not null and public.is_demo_mode());

drop policy if exists "planners can manage demo services" on public.demo_services;
create policy "planners can manage demo services" on public.demo_services for all
using (public.is_demo_mode() and public.is_admin_or_planner())
with check (public.is_demo_mode() and public.is_admin_or_planner());

drop policy if exists "authenticated users can read demo announcements" on public.demo_announcements;
create policy "authenticated users can read demo announcements" on public.demo_announcements for select
using (auth.uid() is not null and public.is_demo_mode() and published = true);

drop policy if exists "admins can manage demo announcements" on public.demo_announcements;
create policy "admins can manage demo announcements" on public.demo_announcements for all
using (public.is_demo_mode() and public.is_admin())
with check (public.is_demo_mode() and public.is_admin());

create or replace function public.set_demo_mode(p_enabled boolean)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  current_enabled boolean;
  first_user uuid;
  second_user uuid;
  member_record record;
begin
  if not public.is_admin() then return false; end if;

  select coalesce((value ->> 'enabled')::boolean, false) into current_enabled
  from public.system_settings where key = 'demo_mode';

  if p_enabled = current_enabled then return true; end if;

  -- Disable = hard reset. Re-enable = fresh deterministic dataset.
  delete from public.demo_services;
  delete from public.demo_announcements;

  if p_enabled then
    select id into first_user from public.profiles
    where active = true order by created_at, id limit 1;

    select id into second_user from public.profiles
    where active = true and id is distinct from first_user
    order by created_at, id limit 1;

    -- Every active account receives a personal demo service.
    for member_record in
      select id from public.profiles where active = true order by created_at, id
    loop
      insert into public.demo_services
        (title, date_iso, time, location, leader_id, meeting, points, status, assigned_to)
      values
        ('Mein Demo-Dienst', current_date + 3, '09:00', 'Demo-Ort', first_user, '08:30 Uhr', 10, 'scheduled', member_record.id);
    end loop;

    insert into public.demo_services
      (title, date_iso, time, location, leader_id, meeting, points, status, assigned_to)
    values
      ('Familiengottesdienst – Demo', current_date + 5, '11:00', 'Demo-Ort', first_user, '10:30 Uhr', 10, 'scheduled', second_user),
      ('Abendmesse – Demo', current_date + 9, '18:00', 'Demo-Ort', second_user, '17:30 Uhr', 15, 'exchange_requested', first_user),
      ('Jugendmesse – Demo', current_date - 5, '18:30', 'Demo-Ort', first_user, '18:00 Uhr', 10, 'completed', first_user),
      ('Sonderdienst – Demo', current_date - 12, '10:30', 'Demo-Ort', second_user, '10:00 Uhr', 15, 'completed', second_user);

    insert into public.demo_announcements (title, content, priority, published, created_by)
    values
      ('Willkommen im Demo-Modus', 'Alle Inhalte sind Testdaten. Änderungen werden in Supabase gespeichert und beim Ausschalten vollständig zurückgesetzt.', 'general', true, auth.uid()),
      ('Demo-Tauschbörse', 'Dieser Dienst ist absichtlich zur Übernahme freigegeben. Probiere die komplette Tauschbörse aus.', 'service', true, auth.uid());
  end if;

  insert into public.system_settings (key, value, updated_by)
  values ('demo_mode', jsonb_build_object('enabled', p_enabled), auth.uid())
  on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by;

  return true;
end;
$$;

grant execute on function public.set_demo_mode(boolean) to authenticated;

create or replace function public.demo_request_service_exchange(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_demo_mode() then return false; end if;
  update public.demo_services set status = 'exchange_requested', taken_by = null, excuse_reason = null, updated_at = now()
  where id = p_service_id and assigned_to = auth.uid() and status = 'scheduled';
  return found;
end; $$;

create or replace function public.demo_take_service(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_demo_mode() then return false; end if;
  update public.demo_services set status = 'taken_over', taken_by = auth.uid(), excuse_reason = null, updated_at = now()
  where id = p_service_id and status = 'exchange_requested' and assigned_to is distinct from auth.uid();
  return found;
end; $$;

create or replace function public.demo_reject_service_takeover(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_demo_mode() or not public.is_admin_or_planner() then return false; end if;
  update public.demo_services set status = 'exchange_requested', taken_by = null, updated_at = now()
  where id = p_service_id and status = 'taken_over';
  return found;
end; $$;

create or replace function public.demo_excuse_service(p_service_id uuid, p_reason text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_demo_mode() then return false; end if;
  update public.demo_services set status = 'excused', excuse_reason = p_reason, taken_by = null, updated_at = now()
  where id = p_service_id and assigned_to = auth.uid() and status = 'scheduled';
  return found;
end; $$;

create or replace function public.demo_restore_service(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_demo_mode() or not public.is_admin_or_planner() then return false; end if;
  update public.demo_services set status = 'scheduled', excuse_reason = null, taken_by = null, updated_at = now()
  where id = p_service_id;
  return found;
end; $$;

grant execute on function public.demo_request_service_exchange(uuid) to authenticated;
grant execute on function public.demo_take_service(uuid) to authenticated;
grant execute on function public.demo_reject_service_takeover(uuid) to authenticated;
grant execute on function public.demo_excuse_service(uuid, text) to authenticated;
grant execute on function public.demo_restore_service(uuid) to authenticated;
