-- Persistent abbreviation mappings and atomic plan import.
-- Apply after 006_service_crud.sql.

create table if not exists public.plan_name_mappings (
  id uuid primary key default gen_random_uuid(),
  abbreviation text not null,
  normalized_abbreviation text not null unique,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_name_mappings_abbreviation_length check (char_length(abbreviation) between 1 and 120),
  constraint plan_name_mappings_normalized_length check (char_length(normalized_abbreviation) between 1 and 120)
);
alter table public.plan_name_mappings enable row level security;

drop policy if exists "planners can read plan name mappings" on public.plan_name_mappings;
create policy "planners can read plan name mappings" on public.plan_name_mappings for select using (public.is_admin_or_planner());
drop policy if exists "planners can insert plan name mappings" on public.plan_name_mappings;
create policy "planners can insert plan name mappings" on public.plan_name_mappings for insert with check (public.is_admin_or_planner() and created_by = auth.uid());
drop policy if exists "planners can update plan name mappings" on public.plan_name_mappings;
create policy "planners can update plan name mappings" on public.plan_name_mappings for update using (public.is_admin_or_planner()) with check (public.is_admin_or_planner());
drop policy if exists "planners can delete plan name mappings" on public.plan_name_mappings;
create policy "planners can delete plan name mappings" on public.plan_name_mappings for delete using (public.is_admin_or_planner());

create or replace function public.import_plan_services(p_services jsonb, p_demo boolean default false)
returns integer language plpgsql security definer set search_path = public
as $$
declare
  item jsonb;
  imported_count integer := 0;
  assigned_id uuid;
  leader_id_value uuid;
  title_value text;
  date_value date;
  time_value text;
  location_value text;
  meeting_value text;
  points_value integer;
begin
  if not public.is_admin_or_planner() then raise exception 'Keine Berechtigung zum Importieren.'; end if;
  if p_demo is distinct from public.is_demo_mode() then raise exception 'Der Demo-Modus hat sich geändert. Bitte erneut laden.'; end if;
  if jsonb_typeof(p_services) <> 'array' or jsonb_array_length(p_services) < 1 or jsonb_array_length(p_services) > 500 then
    raise exception 'Der Import muss zwischen 1 und 500 Diensteinträge enthalten.';
  end if;

  for item in select value from jsonb_array_elements(p_services) loop
    if jsonb_typeof(item) <> 'object' then raise exception 'Ungültiger Diensteintrag.'; end if;
    title_value := nullif(trim(item ->> 'title'), '');
    date_value := (item ->> 'dateISO')::date;
    time_value := trim(coalesce(item ->> 'time', ''));
    location_value := trim(coalesce(item ->> 'location', ''));
    meeting_value := trim(coalesce(item ->> 'meeting', ''));
    points_value := coalesce((item ->> 'points')::integer, 0);
    assigned_id := nullif(item ->> 'assignedTo', '')::uuid;
    leader_id_value := nullif(item ->> 'leaderId', '')::uuid;

    if title_value is null or time_value !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Titel oder Uhrzeit ungültig.'; end if;
    if points_value < 0 or points_value > 1000 then raise exception 'Punkte müssen zwischen 0 und 1000 liegen.'; end if;
    if assigned_id is not null and not exists (select 1 from public.profiles where id = assigned_id and active = true) then raise exception 'Zugewiesenes Profil fehlt oder ist inaktiv.'; end if;
    if leader_id_value is not null and not exists (select 1 from public.profiles where id = leader_id_value and active = true) then raise exception 'Leiterprofil fehlt oder ist inaktiv.'; end if;

    if public.is_demo_mode() then
      if exists (select 1 from public.demo_services where date_iso = date_value and time = time_value and title = title_value and location = location_value and assigned_to is not distinct from assigned_id) then
        raise exception 'Doppelte Dienste erkannt. Es wurden keine Einträge importiert.';
      end if;
      insert into public.demo_services (title,date_iso,time,location,leader_id,meeting,points,assigned_to,status)
      values (title_value,date_value,time_value,location_value,leader_id_value,meeting_value,points_value,assigned_id,'scheduled');
    else
      if exists (select 1 from public.services where date_iso = date_value and time = time_value and title = title_value and location = location_value and assigned_to is not distinct from assigned_id) then
        raise exception 'Doppelte Dienste erkannt. Es wurden keine Einträge importiert.';
      end if;
      insert into public.services (title,date_iso,time,location,leader_id,meeting,points,assigned_to,status)
      values (title_value,date_value,time_value,location_value,leader_id_value,meeting_value,points_value,assigned_id,'scheduled');
    end if;
    imported_count := imported_count + 1;
  end loop;
  return imported_count;
end;
$$;
grant execute on function public.import_plan_services(jsonb, boolean) to authenticated;
