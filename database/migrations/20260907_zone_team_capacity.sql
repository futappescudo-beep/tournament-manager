-- Cupo opcional de equipos por zona. NULL significa sin límite.
alter table public.zones
  add column if not exists max_teams integer;

alter table public.zones
  drop constraint if exists zones_max_teams_check;

alter table public.zones
  add constraint zones_max_teams_check
  check (max_teams is null or max_teams between 2 and 100);
