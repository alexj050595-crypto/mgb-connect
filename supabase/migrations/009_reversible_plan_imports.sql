-- Track each plan import as a reversible batch.
create table if not exists public.plan_import_batches (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  source_file_name text,
  source_plan jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  service_count integer not null default 0,
  status text not null default 'active' check (status in ('active','rolled_back')),
  created_at timestamptz not null default now(),
  rolled_back_at timestamptz
);
alter table public.plan_import_batches enable row level security;
drop policy if exists "planners can read plan import batches" on public.plan_import_batches;
create policy "planners can read plan import batches" on public.plan_import_batches
for select using (public.is_admin_or_planner());

alter table public.services add column if not exists import_batch_id uuid references public.plan_import_batches(id) on delete set null;
alter table public.demo_services add column if not exists import_batch_id uuid references public.plan_import_batches(id) on delete set null;

drop function if exists public.import_plan_services(jsonb, boolean);
create function public.import_plan_services(
  p_services jsonb,
  p_demo boolean default false,
  p_source_plan jsonb default '{}'::jsonb,
  p_source_file_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
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
  batch_id_value uuid;
begin
  if auth.uid() is null or not public.is_admin_or_planner() then
    raise exception 'Keine Berechtigung zum Importieren.';
  end if;
  perform pg_advisory_xact_lock(hashtext('mgb_connect_plan_import')::bigint);
  if p_demo is distinct from public.is_demo_mode() then
    raise exception 'Der Demo-Modus hat sich geändert. Bitte erneut laden.';
  end if;
  if p_services is null or jsonb_typeof(p_services) is distinct from 'array'
     or jsonb_array_length(p_services) < 1 or jsonb_array_length(p_services) > 500 then
    raise exception 'Der Import muss zwischen 1 und 500 Diensteinträge enthalten.';
  end if;

  insert into public.plan_import_batches (created_by, source_file_name, source_plan, is_demo)
  values (auth.uid(), left(coalesce(p_source_file_name, 'Messdienerplan'), 240),
          coalesce(p_source_plan, '{}'::jsonb), p_demo)
  returning id into batch_id_value;

  for item in select value from jsonb_array_elements(p_services) loop
    if jsonb_typeof(item) <> 'object' then raise exception 'Ungültiger Diensteintrag.'; end if;
    title_value := nullif(trim(item ->> 'title'), '');
    if coalesce(item ->> 'dateISO', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'Ungültiges Datum im Import.'; end if;
    date_value := (item ->> 'dateISO')::date;
    time_value := trim(coalesce(item ->> 'time', ''));
    location_value := trim(coalesce(item ->> 'location', ''));
    meeting_value := trim(coalesce(item ->> 'meeting', ''));
    points_value := coalesce((item ->> 'points')::integer, 0);
    assigned_id := nullif(item ->> 'assignedTo', '')::uuid;
    leader_id_value := nullif(item ->> 'leaderId', '')::uuid;
    if title_value is null or char_length(title_value) > 240 then raise exception 'Ungültiger Titel.'; end if;
    if time_value !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Ungültige Uhrzeit im Import.'; end if;
    if points_value < 0 or points_value > 1000 then raise exception 'Ungültige Punktezahl.'; end if;
    if assigned_id is not null and not exists (select 1 from public.profiles where id=assigned_id and active=true) then raise exception 'Zugewiesenes Profil fehlt oder ist inaktiv.'; end if;
    if leader_id_value is not null and not exists (select 1 from public.profiles where id=leader_id_value and active=true) then raise exception 'Leiterprofil fehlt oder ist inaktiv.'; end if;

    if p_demo then
      if exists (select 1 from public.demo_services where date_iso=date_value and time=time_value and title=title_value and location=location_value and assigned_to is not distinct from assigned_id) then
        raise exception 'Doppelte Dienste erkannt. Es wurden keine Einträge importiert.';
      end if;
      insert into public.demo_services (title,date_iso,time,location,leader_id,meeting,points,assigned_to,status,import_batch_id)
      values (title_value,date_value,time_value,location_value,leader_id_value,meeting_value,points_value,assigned_id,'scheduled',batch_id_value);
    else
      if exists (select 1 from public.services where date_iso=date_value and time=time_value and title=title_value and location=location_value and assigned_to is not distinct from assigned_id) then
        raise exception 'Doppelte Dienste erkannt. Es wurden keine Einträge importiert.';
      end if;
      insert into public.services (title,date_iso,time,location,leader_id,meeting,points,assigned_to,status,import_batch_id)
      values (title_value,date_value,time_value,location_value,leader_id_value,meeting_value,points_value,assigned_id,'scheduled',batch_id_value);
    end if;
    imported_count := imported_count + 1;
  end loop;
  update public.plan_import_batches set service_count=imported_count where id=batch_id_value;
  return jsonb_build_object('batch_id',batch_id_value,'service_count',imported_count);
end;
$$;
revoke all on function public.import_plan_services(jsonb,boolean,jsonb,text) from public;
grant execute on function public.import_plan_services(jsonb,boolean,jsonb,text) to authenticated;

create or replace function public.rollback_plan_import(p_batch_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  batch_row public.plan_import_batches%rowtype;
  removed_count integer := 0;
begin
  if auth.uid() is null or not public.is_admin_or_planner() then raise exception 'Keine Berechtigung.'; end if;
  select * into batch_row from public.plan_import_batches where id=p_batch_id for update;
  if not found then raise exception 'Import nicht gefunden.'; end if;
  if batch_row.status <> 'active' then raise exception 'Dieser Import wurde bereits rückgängig gemacht.'; end if;

  if batch_row.is_demo then
    if exists (select 1 from public.demo_services where import_batch_id=p_batch_id and status <> 'scheduled') then
      raise exception 'Dieser Import enthält bereits bearbeitete Dienste. Bitte zuerst deren Statusänderungen klären; es wurde nichts gelöscht.';
    end if;
    delete from public.demo_services where import_batch_id=p_batch_id;
    get diagnostics removed_count = row_count;
  else
    if exists (select 1 from public.services where import_batch_id=p_batch_id and status <> 'scheduled') then
      raise exception 'Dieser Import enthält bereits bearbeitete Dienste. Bitte zuerst deren Statusänderungen klären; es wurde nichts gelöscht.';
    end if;
    delete from public.services where import_batch_id=p_batch_id;
    get diagnostics removed_count = row_count;
  end if;
  update public.plan_import_batches set status='rolled_back', rolled_back_at=now() where id=p_batch_id;
  return removed_count;
end;
$$;
revoke all on function public.rollback_plan_import(uuid) from public;
grant execute on function public.rollback_plan_import(uuid) to authenticated;
