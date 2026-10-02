-- MGB Connect: decimal points for leader list actions
-- Run once in Supabase SQL Editor after 007_leader_lists.sql.

alter table public.leader_list_actions
  add column if not exists points numeric(10,2) not null default 1;

alter table public.leader_list_actions
  alter column points type numeric(10,2)
  using points::numeric(10,2);

alter table public.leader_list_actions
  drop constraint if exists leader_list_actions_points_check;

alter table public.leader_list_actions
  add constraint leader_list_actions_points_check check (points >= 0.01);
