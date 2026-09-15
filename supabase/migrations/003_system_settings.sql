-- MGB Connect - centrally persisted system settings
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.system_settings enable row level security;

drop policy if exists "admins can manage system settings" on public.system_settings;
create policy "admins can manage system settings"
on public.system_settings for all
using (public.is_admin())
with check (public.is_admin());

insert into public.system_settings (key, value)
values
  ('features', '{"exchange":true,"points":true,"ranking":true,"news":true,"notifications":true,"calendar":false}'::jsonb),
  ('service_rules', '{"autoTakeover":true,"leaderReject":true,"points":true}'::jsonb),
  ('notifications', '{"serviceReminder":true,"exchange":true,"news":true,"important":true}'::jsonb)
on conflict (key) do nothing;

grant select, insert, update, delete on public.system_settings to authenticated;
