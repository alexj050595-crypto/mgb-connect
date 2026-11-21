-- Give Obermessdiener full access to the announcements feature only.
-- Admin policies remain unchanged; OM permissions are explicitly scoped to announcements.

create policy "om and admins can insert announcements"
on public.announcements for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role::text in ('om','admin')
  )
);

create policy "om and admins can update announcements"
on public.announcements for update to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role::text in ('om','admin')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role::text in ('om','admin')
  )
);

create policy "om and admins can delete announcements"
on public.announcements for delete to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role::text in ('om','admin')
  )
);

create policy "om and admins can insert demo announcements"
on public.demo_announcements for insert to authenticated
with check (
  public.is_demo_mode()
  and created_by = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role::text in ('om','admin')
  )
);

create policy "om and admins can update demo announcements"
on public.demo_announcements for update to authenticated
using (
  public.is_demo_mode()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role::text in ('om','admin')
  )
)
with check (
  public.is_demo_mode()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role::text in ('om','admin')
  )
);

create policy "om and admins can delete demo announcements"
on public.demo_announcements for delete to authenticated
using (
  public.is_demo_mode()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role::text in ('om','admin')
  )
);
