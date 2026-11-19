-- Keep profile directory access restricted to planners/admins.
drop policy if exists "planners can read profiles" on public.profiles;
drop policy if exists "members can read active profile summaries" on public.profiles;
create policy "planners can read profiles"
on public.profiles for select
using (public.is_admin_or_planner());

-- Members can view only the minimal roster information for the service they open.
-- This avoids granting broad SELECT access to every active profile.
create or replace function public.get_service_team(p_service_id uuid)
returns table (
  person_id uuid,
  display_name text,
  role public.user_role
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  selected_date date;
  selected_time text;
  selected_title text;
  selected_location text;
  selected_meeting text;
  selected_leader_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Anmeldung erforderlich.';
  end if;

  select s.date_iso, s.time, s.title, s.location, s.meeting, s.leader_id
  into selected_date, selected_time, selected_title, selected_location, selected_meeting, selected_leader_id
  from public.services s
  where s.id = p_service_id
    and not public.is_demo_mode();

  if not found then
    select s.date_iso, s.time, s.title, s.location, s.meeting, s.leader_id
    into selected_date, selected_time, selected_title, selected_location, selected_meeting, selected_leader_id
    from public.demo_services s
    where s.id = p_service_id
      and public.is_demo_mode();
  end if;

  if selected_date is null then
    raise exception 'Dienst nicht gefunden.';
  end if;

  if not public.is_admin_or_planner()
     and selected_leader_id is distinct from auth.uid()
     and not exists (
       select 1 from public.services s
       where not public.is_demo_mode()
         and s.date_iso = selected_date and s.time = selected_time
         and s.title = selected_title and s.location = selected_location
         and s.meeting = selected_meeting
         and (s.assigned_to = auth.uid() or s.taken_by = auth.uid() or s.leader_id = auth.uid())
       union all
       select 1 from public.demo_services s
       where public.is_demo_mode()
         and s.date_iso = selected_date and s.time = selected_time
         and s.title = selected_title and s.location = selected_location
         and s.meeting = selected_meeting
         and (s.assigned_to = auth.uid() or s.taken_by = auth.uid() or s.leader_id = auth.uid())
     ) then
    raise exception 'Du hast keinen Zugriff auf die Teilnehmerliste dieses Dienstes.';
  end if;

  return query
  with service_rows as (
    select s.assigned_to, s.taken_by, s.status, s.leader_id
    from public.services s
    where not public.is_demo_mode()
      and s.date_iso = selected_date and s.time = selected_time
      and s.title = selected_title and s.location = selected_location
      and s.meeting = selected_meeting
    union all
    select s.assigned_to, s.taken_by, s.status, s.leader_id
    from public.demo_services s
    where public.is_demo_mode()
      and s.date_iso = selected_date and s.time = selected_time
      and s.title = selected_title and s.location = selected_location
      and s.meeting = selected_meeting
  ), participants as (
    select case when status = 'taken_over' and taken_by is not null then taken_by else assigned_to end as profile_id
    from service_rows
    where status <> 'excused'
      and (assigned_to is not null or taken_by is not null)
    union
    select leader_id as profile_id
    from service_rows
    where leader_id is not null
  )
  select distinct p.id, p.display_name, p.role
  from participants x
  join public.profiles p on p.id = x.profile_id and p.active = true
  order by p.display_name;
end;
$$;

revoke all on function public.get_service_team(uuid) from public;
grant execute on function public.get_service_team(uuid) to authenticated;
