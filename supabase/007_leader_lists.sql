-- MGB Connect: configurable leader lists / tally boards
-- Run once in Supabase SQL Editor. Safe to re-run.

create table if not exists public.leader_lists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leader_list_members (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.leader_lists(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  display_name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(list_id, profile_id)
);

create table if not exists public.leader_list_actions (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.leader_lists(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.leader_list_entries (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.leader_lists(id) on delete cascade,
  member_id uuid not null references public.leader_list_members(id) on delete cascade,
  action_id uuid not null references public.leader_list_actions(id) on delete cascade,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  unique(list_id, member_id, action_id)
);

create or replace function public.is_leader_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('leiter', 'planschreiber', 'admin')
      and active = true
  );
$;

grant execute on function public.is_leader_or_admin() to authenticated;

alter table public.leader_lists enable row level security;
alter table public.leader_list_members enable row level security;
alter table public.leader_list_actions enable row level security;
alter table public.leader_list_entries enable row level security;

drop policy if exists "leader_lists_select" on public.leader_lists;
drop policy if exists "leader_lists_admin_write" on public.leader_lists;
create policy "leader_lists_select" on public.leader_lists for select to authenticated
using (public.is_leader_or_admin());
create policy "leader_lists_admin_write" on public.leader_lists for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leader_list_members_select" on public.leader_list_members;
drop policy if exists "leader_list_members_admin_write" on public.leader_list_members;
create policy "leader_list_members_select" on public.leader_list_members for select to authenticated
using (public.is_leader_or_admin());
create policy "leader_list_members_admin_write" on public.leader_list_members for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leader_list_actions_select" on public.leader_list_actions;
drop policy if exists "leader_list_actions_admin_write" on public.leader_list_actions;
create policy "leader_list_actions_select" on public.leader_list_actions for select to authenticated
using (public.is_leader_or_admin());
create policy "leader_list_actions_admin_write" on public.leader_list_actions for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leader_list_entries_select" on public.leader_list_entries;
drop policy if exists "leader_list_entries_write" on public.leader_list_entries;
create policy "leader_list_entries_select" on public.leader_list_entries for select to authenticated
using (public.is_leader_or_admin());
create policy "leader_list_entries_write" on public.leader_list_entries for all to authenticated
using (public.is_leader_or_admin()) with check (public.is_leader_or_admin());

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

create index if not exists leader_list_members_list_idx on public.leader_list_members(list_id, sort_order);
create index if not exists leader_list_actions_list_idx on public.leader_list_actions(list_id, sort_order);
create index if not exists leader_list_entries_list_idx on public.leader_list_entries(list_id);
