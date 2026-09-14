-- MGB Connect - profile/role security
-- Run after schema.sql and the previous service transition migration.

-- Leaders need to see the team, while normal members should only see themselves.
create or replace function public.is_leader_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('leiter', 'planschreiber', 'admin')
      and active = true
  );
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and active = true
  limit 1;
$$;

-- Replace the profile SELECT policies with the intended access model.
drop policy if exists "users can read own profile" on public.profiles;
drop policy if exists "admins can read all profiles" on public.profiles;

create policy "users can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "leaders can read team profiles"
on public.profiles for select
using (public.is_leader_or_admin());

-- Only admins can change roles, activation state or profile administration data.
drop policy if exists "admins can update profiles" on public.profiles;

create policy "admins can update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

grant execute on function public.is_leader_or_admin() to authenticated;
grant execute on function public.current_user_role() to authenticated;
