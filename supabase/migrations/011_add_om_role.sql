-- Add Obermessdiener as a profile role. Keep this migration separate:
-- PostgreSQL requires the enum value to be committed before use in policies/functions.
alter type public.user_role add value if not exists 'om';
