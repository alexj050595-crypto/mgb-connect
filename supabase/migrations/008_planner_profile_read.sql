-- Allow active planners to see active member profiles for plan import
-- and persistent name-mapping administration. No profile data is writable here.

drop policy if exists "planners can read profiles" on public.profiles;
create policy "planners can read profiles"
on public.profiles for select
using (public.is_admin_or_planner());
