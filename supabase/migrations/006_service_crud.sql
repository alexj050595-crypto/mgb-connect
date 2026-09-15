-- MGB Connect - service management CRUD
-- Adds secure create/update/delete operations for real and demo services.

create or replace function public.create_service(
  p_title text,
  p_date_iso date,
  p_time text,
  p_location text,
  p_leader_id uuid,
  p_meeting text,
  p_points integer,
  p_assigned_to uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.is_admin_or_planner() then
    return null;
  end if;

  insert into public.services (title, date_iso, time, location, leader_id, meeting, points, assigned_to, status)
  values (trim(p_title), p_date_iso, trim(p_time), trim(coalesce(p_location, '')), p_leader_id,
          trim(coalesce(p_meeting, '')), greatest(coalesce(p_points, 0), 0), p_assigned_to, 'scheduled')
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.update_service(
  p_service_id uuid,
  p_title text,
  p_date_iso date,
  p_time text,
  p_location text,
  p_leader_id uuid,
  p_meeting text,
  p_points integer,
  p_assigned_to uuid,
  p_status public.service_status
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_or_planner() then
    return false;
  end if;

  update public.services
  set title = trim(p_title),
      date_iso = p_date_iso,
      time = trim(p_time),
      location = trim(coalesce(p_location, '')),
      leader_id = p_leader_id,
      meeting = trim(coalesce(p_meeting, '')),
      points = greatest(coalesce(p_points, 0), 0),
      assigned_to = p_assigned_to,
      status = p_status,
      updated_at = now()
  where id = p_service_id;

  return found;
end;
$$;

create or replace function public.delete_service(p_service_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_or_planner() then
    return false;
  end if;

  delete from public.services where id = p_service_id;
  return found;
end;
$$;

create or replace function public.create_demo_service(
  p_title text,
  p_date_iso date,
  p_time text,
  p_location text,
  p_leader_id uuid,
  p_meeting text,
  p_points integer,
  p_assigned_to uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.is_demo_mode() or not public.is_admin_or_planner() then
    return null;
  end if;

  insert into public.demo_services (title, date_iso, time, location, leader_id, meeting, points, assigned_to, status)
  values (trim(p_title), p_date_iso, trim(p_time), trim(coalesce(p_location, '')), p_leader_id,
          trim(coalesce(p_meeting, '')), greatest(coalesce(p_points, 0), 0), p_assigned_to, 'scheduled')
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.update_demo_service(
  p_service_id uuid,
  p_title text,
  p_date_iso date,
  p_time text,
  p_location text,
  p_leader_id uuid,
  p_meeting text,
  p_points integer,
  p_assigned_to uuid,
  p_status public.service_status
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_demo_mode() or not public.is_admin_or_planner() then
    return false;
  end if;

  update public.demo_services
  set title = trim(p_title), date_iso = p_date_iso, time = trim(p_time),
      location = trim(coalesce(p_location, '')), leader_id = p_leader_id,
      meeting = trim(coalesce(p_meeting, '')), points = greatest(coalesce(p_points, 0), 0),
      assigned_to = p_assigned_to, status = p_status, updated_at = now()
  where id = p_service_id;

  return found;
end;
$$;

create or replace function public.delete_demo_service(p_service_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_demo_mode() or not public.is_admin_or_planner() then
    return false;
  end if;

  delete from public.demo_services where id = p_service_id;
  return found;
end;
$$;

grant execute on function public.create_service(text, date, text, text, uuid, text, integer, uuid) to authenticated;
grant execute on function public.update_service(uuid, text, date, text, text, uuid, text, integer, uuid, public.service_status) to authenticated;
grant execute on function public.delete_service(uuid) to authenticated;
grant execute on function public.create_demo_service(text, date, text, text, uuid, text, integer, uuid) to authenticated;
grant execute on function public.update_demo_service(uuid, text, date, text, text, uuid, text, integer, uuid, public.service_status) to authenticated;
grant execute on function public.delete_demo_service(uuid) to authenticated;
