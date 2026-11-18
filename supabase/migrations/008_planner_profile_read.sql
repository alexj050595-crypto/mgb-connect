-- Active members need to see the names and roles of people serving
-- alongside them. The profiles table contains only in-app profile metadata.
drop policy if exists "planners can read profiles" on public.profiles;
drop policy if exists "members can read active profile summaries" on public.profiles;
create policy "members can read active profile summaries"
on public.profiles for select
using (auth.uid() is not null and active = true);
