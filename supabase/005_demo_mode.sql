-- MGB Connect: isolated demo mode
-- Production tables are never modified by demo operations.

create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.system_settings enable row level security;

drop policy if exists "system_settings_admin_select" on public.system_settings;
drop policy if exists "system_settings_admin_write" on public.system_settings;

create policy "system_settings_admin_select" on public.system_settings for select
to authenticated using (public.is_admin());

create policy "system_settings_admin_write" on public.system_settings for all
to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.system_settings(key, value)
values
  ('demo_mode', 'false'::jsonb),
  ('features', '{"exchange":true,"points":true,"ranking":true,"news":true,"notifications":true,"calendar":false}'::jsonb),
  ('service_rules', '{"autoTakeover":true,"leaderReject":true,"points":true}'::jsonb),
  ('notifications', '{"serviceReminder":true,"exchange":true,"news":true,"important":true}'::jsonb)
on conflict (key) do nothing;

create or replace function public.is_demo_mode()
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce((select (value #>> '{}')::boolean from public.system_settings where key = 'demo_mode'), false);
$$;

grant execute on function public.is_demo_mode() to authenticated;

create table if not exists public.demo_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_iso date not null,
  time text not null,
  location text not null default '',
  meeting text not null default '',
  points integer not null default 0 check (points >= 0),
  status public.service_status not null default 'scheduled',
  excuse_reason text,
  assigned_to uuid references public.profiles(id) on delete set null,
  taken_by uuid references public.profiles(id) on delete set null,
  leader_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.demo_services enable row level security;

drop policy if exists "demo_services_authenticated_select" on public.demo_services;
drop policy if exists "demo_services_planner_insert" on public.demo_services;
drop policy if exists "demo_services_planner_update" on public.demo_services;
drop policy if exists "demo_services_planner_delete" on public.demo_services;

create policy "demo_services_authenticated_select" on public.demo_services for select
to authenticated using (public.is_demo_mode());

create policy "demo_services_planner_insert" on public.demo_services for insert
to authenticated with check (public.is_admin_or_planner() and public.is_demo_mode());

create policy "demo_services_planner_update" on public.demo_services for update
to authenticated
using (public.is_admin_or_planner() and public.is_demo_mode())
with check (public.is_admin_or_planner() and public.is_demo_mode());

create policy "demo_services_planner_delete" on public.demo_services for delete
to authenticated using (public.is_admin_or_planner() and public.is_demo_mode());

create or replace function public.reset_demo_data()
returns void language plpgsql security definer set search_path = public
as $$
declare
  p record;
  base_date date := current_date;
  idx integer := 0;
begin
  if not public.is_admin() then raise exception 'Nur Administratoren dürfen den Demo-Modus verwalten'; end if;

  delete from public.demo_services;

  for p in select id from public.profiles where active = true order by created_at, id loop
    idx := idx + 1;
    insert into public.demo_services
      (title, date_iso, time, location, meeting, points, status, assigned_to)
    values
      ('Demo-Dienst ' || idx, base_date + idx,
       case when idx % 2 = 0 then '18:00' else '10:00' end,
       'Demo-Ort', 'Treffen 30 Minuten vorher',
       case when idx % 3 = 0 then 15 else 10 end,
       case when idx = 1 then 'completed'::public.service_status else 'scheduled'::public.service_status end,
       p.id);
  end loop;

  insert into public.demo_services
    (title, date_iso, time, location, meeting, points, status)
  values
    ('Offener Demo-Dienst', base_date + 3, '18:30', 'Demo-Ort', 'Treffen 30 Minuten vorher', 10, 'exchange_requested');
end;
$$;

grant execute on function public.reset_demo_data() to authenticated;

create or replace function public.set_demo_mode(p_enabled boolean)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then return false; end if;

  if p_enabled then
    perform public.reset_demo_data();
  else
    delete from public.demo_services;
  end if;

  insert into public.system_settings(key, value, updated_at, updated_by)
  values ('demo_mode', to_jsonb(p_enabled), now(), auth.uid())
  on conflict (key) do update
    set value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by;

  return true;
end;
$$;

grant execute on function public.set_demo_mode(boolean) to authenticated;

-- Production service CRUD
create or replace function public.create_service(
  p_title text, p_date_iso date, p_time text, p_location text default '',
  p_meeting text default '', p_points integer default 0,
  p_leader_id uuid default null, p_assigned_to uuid default null,
  p_status public.service_status default 'scheduled'
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  if not public.is_admin_or_planner() then raise exception 'Keine Berechtigung'; end if;
  insert into public.services(title,date_iso,time,location,meeting,points,leader_id,assigned_to,status)
  values(p_title,p_date_iso,p_time,p_location,p_meeting,p_points,p_leader_id,p_assigned_to,p_status)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.create_service(text,date,text,text,text,integer,uuid,uuid,public.service_status) to authenticated;

create or replace function public.update_service(
  p_service_id uuid, p_title text, p_date_iso date, p_time text, p_location text,
  p_meeting text, p_points integer, p_leader_id uuid, p_assigned_to uuid,
  p_status public.service_status
)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin_or_planner() then raise exception 'Keine Berechtigung'; end if;
  update public.services set title=p_title,date_iso=p_date_iso,time=p_time,location=p_location,
    meeting=p_meeting,points=p_points,leader_id=p_leader_id,assigned_to=p_assigned_to,
    status=p_status,updated_at=now() where id=p_service_id;
  return found;
end;
$$;

grant execute on function public.update_service(uuid,text,date,text,text,text,integer,uuid,uuid,public.service_status) to authenticated;

create or replace function public.delete_service(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin_or_planner() then raise exception 'Keine Berechtigung'; end if;
  delete from public.services where id=p_service_id;
  return found;
end;
$$;

grant execute on function public.delete_service(uuid) to authenticated;

-- Demo service CRUD
create or replace function public.create_demo_service(
  p_title text, p_date_iso date, p_time text, p_location text default '',
  p_meeting text default '', p_points integer default 0,
  p_leader_id uuid default null, p_assigned_to uuid default null,
  p_status public.service_status default 'scheduled'
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  if not public.is_admin_or_planner() or not public.is_demo_mode() then raise exception 'Keine Berechtigung oder Demo-Modus inaktiv'; end if;
  insert into public.demo_services(title,date_iso,time,location,meeting,points,leader_id,assigned_to,status)
  values(p_title,p_date_iso,p_time,p_location,p_meeting,p_points,p_leader_id,p_assigned_to,p_status)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.create_demo_service(text,date,text,text,text,integer,uuid,uuid,public.service_status) to authenticated;

create or replace function public.update_demo_service(
  p_service_id uuid, p_title text, p_date_iso date, p_time text, p_location text,
  p_meeting text, p_points integer, p_leader_id uuid, p_assigned_to uuid,
  p_status public.service_status
)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin_or_planner() or not public.is_demo_mode() then raise exception 'Keine Berechtigung oder Demo-Modus inaktiv'; end if;
  update public.demo_services set title=p_title,date_iso=p_date_iso,time=p_time,location=p_location,
    meeting=p_meeting,points=p_points,leader_id=p_leader_id,assigned_to=p_assigned_to,
    status=p_status,updated_at=now() where id=p_service_id;
  return found;
end;
$$;

grant execute on function public.update_demo_service(uuid,text,date,text,text,text,integer,uuid,uuid,public.service_status) to authenticated;

create or replace function public.delete_demo_service(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin_or_planner() or not public.is_demo_mode() then raise exception 'Keine Berechtigung oder Demo-Modus inaktiv'; end if;
  delete from public.demo_services where id=p_service_id;
  return found;
end;
$$;

grant execute on function public.delete_demo_service(uuid) to authenticated;

-- Demo service lifecycle mirrors production behavior.
create or replace function public.demo_request_service_exchange(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_demo_mode() then return false; end if;
  update public.demo_services set status='exchange_requested', taken_by=null, excuse_reason=null, updated_at=now()
  where id=p_service_id and assigned_to=auth.uid() and status='scheduled';
  return found;
end;
$$;

grant execute on function public.demo_request_service_exchange(uuid) to authenticated;

create or replace function public.demo_take_service(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_demo_mode() then return false; end if;
  update public.demo_services set status='taken_over', taken_by=auth.uid(), updated_at=now()
  where id=p_service_id and status='exchange_requested' and (assigned_to is null or assigned_to <> auth.uid());
  return found;
end;
$$;

grant execute on function public.demo_take_service(uuid) to authenticated;

create or replace function public.demo_reject_service_takeover(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_demo_mode() or not public.is_leader_or_admin() then return false; end if;
  update public.demo_services set status='exchange_requested', taken_by=null, updated_at=now()
  where id=p_service_id and status='taken_over';
  return found;
end;
$$;

grant execute on function public.demo_reject_service_takeover(uuid) to authenticated;

create or replace function public.demo_excuse_service(p_service_id uuid, p_reason text)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_demo_mode() then return false; end if;
  update public.demo_services set status='excused', excuse_reason=p_reason, taken_by=null, updated_at=now()
  where id=p_service_id and assigned_to=auth.uid() and status='scheduled';
  return found;
end;
$$;

grant execute on function public.demo_excuse_service(uuid,text) to authenticated;

create or replace function public.demo_restore_service(p_service_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_demo_mode() then return false; end if;
  update public.demo_services set status='scheduled', excuse_reason=null, taken_by=null, updated_at=now()
  where id=p_service_id and assigned_to=auth.uid() and status in ('excused','exchange_requested');
  return found;
end;
$$;

grant execute on function public.demo_restore_service(uuid) to authenticated;
