-- Separate attendance tracking for real and demo services.
alter table public.services
  add column if not exists attendance_status text
    check (attendance_status in ('present', 'excused', 'unexcused')),
  add column if not exists attendance_reason text,
  add column if not exists attendance_marked_by uuid references public.profiles(id) on delete set null,
  add column if not exists attendance_marked_at timestamptz;

alter table public.demo_services
  add column if not exists attendance_status text
    check (attendance_status in ('present', 'excused', 'unexcused')),
  add column if not exists attendance_reason text,
  add column if not exists attendance_marked_by uuid references public.profiles(id) on delete set null,
  add column if not exists attendance_marked_at timestamptz;

create or replace function public.mark_service_attendance(
  p_service_id uuid,
  p_attendance_status text,
  p_reason text default null,
  p_demo boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_leader_or_admin() then
    raise exception 'Keine Berechtigung zum Erfassen der Anwesenheit.';
  end if;

  if p_demo is distinct from public.is_demo_mode() then
    raise exception 'Der Demo-Modus hat sich geändert. Bitte erneut laden.';
  end if;

  if p_attendance_status is not null
     and p_attendance_status not in ('present', 'excused', 'unexcused') then
    raise exception 'Ungültiger Anwesenheitsstatus.';
  end if;

  if p_demo then
    update public.demo_services
    set attendance_status = p_attendance_status,
        attendance_reason = nullif(trim(coalesce(p_reason, '')), ''),
        attendance_marked_by = case when p_attendance_status is null then null else auth.uid() end,
        attendance_marked_at = case when p_attendance_status is null then null else now() end,
        updated_at = now()
    where id = p_service_id;
  else
    update public.services
    set attendance_status = p_attendance_status,
        attendance_reason = nullif(trim(coalesce(p_reason, '')), ''),
        attendance_marked_by = case when p_attendance_status is null then null else auth.uid() end,
        attendance_marked_at = case when p_attendance_status is null then null else now() end,
        updated_at = now()
    where id = p_service_id;
  end if;

  return found;
end;
$$;

revoke all on function public.mark_service_attendance(uuid, text, text, boolean) from public;
grant execute on function public.mark_service_attendance(uuid, text, text, boolean) to authenticated;
