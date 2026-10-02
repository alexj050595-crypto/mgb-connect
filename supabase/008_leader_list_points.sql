-- MGB Connect: configurable leader list action points
-- Run once in Supabase SQL Editor after 007_leader_lists.sql.

alter table public.leader_list_actions
  add column if not exists points integer not null default 1
  check (points >= 1);

create or replace function public.increment_leader_list_entry(
  p_list_id uuid,
  p_member_id uuid,
  p_action_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not public.is_leader_or_admin() then
    raise exception 'Keine Berechtigung';
  end if;

  if not exists (
    select 1 from public.leader_lists
    where id = p_list_id and active = true
  ) then
    raise exception 'Liste nicht gefunden oder deaktiviert';
  end if;

  if not exists (
    select 1 from public.leader_list_members
    where id = p_member_id and list_id = p_list_id
  ) then
    raise exception 'Person gehört nicht zu dieser Liste';
  end if;

  if not exists (
    select 1 from public.leader_list_actions
    where id = p_action_id and list_id = p_list_id
  ) then
    raise exception 'Ereignis gehört nicht zu dieser Liste';
  end if;

  insert into public.leader_list_entries(list_id, member_id, action_id, count, updated_at)
  values (p_list_id, p_member_id, p_action_id, 1, now())
  on conflict (list_id, member_id, action_id)
  do update set count = public.leader_list_entries.count + 1, updated_at = now()
  returning count into v_count;

  return v_count;
end;
$$;

grant execute on function public.increment_leader_list_entry(uuid,uuid,uuid) to authenticated;
