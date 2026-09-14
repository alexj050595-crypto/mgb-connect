-- MGB Connect - service transition RPCs
-- Run this AFTER the initial supabase/schema.sql setup.

create or replace function public.request_service_exchange(p_service_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.services
  set status = 'exchange_requested',
      taken_by = null,
      excuse_reason = null,
      updated_at = now()
  where id = p_service_id
    and assigned_to = auth.uid()
    and status = 'scheduled';

  return found;
end;
$$;

create or replace function public.take_service(p_service_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.services
  set status = 'taken_over',
      taken_by = auth.uid(),
      excuse_reason = null,
      updated_at = now()
  where id = p_service_id
    and status = 'exchange_requested'
    and assigned_to is distinct from auth.uid();

  return found;
end;
$$;

create or replace function public.reject_service_takeover(p_service_id uuid)
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
  set status = 'exchange_requested',
      taken_by = null,
      updated_at = now()
  where id = p_service_id
    and status = 'taken_over';

  return found;
end;
$$;

create or replace function public.excuse_service(p_service_id uuid, p_reason text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.services
  set status = 'excused',
      excuse_reason = p_reason,
      taken_by = null,
      updated_at = now()
  where id = p_service_id
    and assigned_to = auth.uid()
    and status = 'scheduled';

  return found;
end;
$$;

create or replace function public.restore_service(p_service_id uuid)
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
  set status = 'scheduled',
      excuse_reason = null,
      taken_by = null,
      updated_at = now()
  where id = p_service_id;

  return found;
end;
$$;

grant execute on function public.request_service_exchange(uuid) to authenticated;
grant execute on function public.take_service(uuid) to authenticated;
grant execute on function public.reject_service_takeover(uuid) to authenticated;
grant execute on function public.excuse_service(uuid, text) to authenticated;
grant execute on function public.restore_service(uuid) to authenticated;
