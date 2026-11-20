-- MGB Connect: private member contact records collected during sign-up.
-- Contact details are stored separately from public-facing profile data.

create table if not exists public.member_contacts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  birth_date date,
  street text,
  postal_code text,
  city text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_contacts enable row level security;

drop policy if exists "members can read own contact record" on public.member_contacts;
create policy "members can read own contact record"
on public.member_contacts for select to authenticated
using (user_id = auth.uid());

drop policy if exists "admins can read all member contacts" on public.member_contacts;
create policy "admins can read all member contacts"
on public.member_contacts for select to authenticated
using (public.is_admin());

-- No client-side INSERT, UPDATE or DELETE policy is provided.
-- New rows are written by the trusted auth trigger below; administrators
-- can manage/export the table through Supabase's secured dashboard.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first text := coalesce(new.raw_user_meta_data ->> 'first_name', '');
  v_last text := coalesce(new.raw_user_meta_data ->> 'last_name', '');
  v_display text;
begin
  v_display := nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', v_first || ' ' || v_last)), '');
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(v_display, split_part(coalesce(new.email, ''), '@', 1)));

  insert into public.member_contacts (
    user_id, first_name, last_name, birth_date, street, postal_code, city, phone, email
  ) values (
    new.id,
    v_first,
    v_last,
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'street', ''),
    nullif(new.raw_user_meta_data ->> 'postal_code', ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    new.email
  );

  return new;
end;
$$;

-- Backfill existing accounts so every existing member also has a contact row.
insert into public.member_contacts (user_id, first_name, last_name, email)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'first_name', ''), split_part(coalesce(u.raw_user_meta_data ->> 'display_name', ''), ' ', 1), ''),
  coalesce(nullif(u.raw_user_meta_data ->> 'last_name', ''), ''),
  u.email
from auth.users u
on conflict (user_id) do update
set email = excluded.email;
