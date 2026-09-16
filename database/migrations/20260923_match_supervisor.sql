-- Designa un veedor desde el padrón de árbitros y lo incorpora a la planilla.
alter table public.matches
  add column if not exists supervisor_referee_id uuid references public.referees(id) on delete set null;

create index if not exists matches_supervisor_referee_id_idx on public.matches (supervisor_referee_id);

alter table public.match_sheet_confirmations
  drop constraint if exists match_sheet_confirmations_confirmation_type_check;
alter table public.match_sheet_confirmations
  add constraint match_sheet_confirmations_confirmation_type_check
  check (confirmation_type in ('REFEREE', 'SUPERVISOR', 'HOME_DELEGATE', 'AWAY_DELEGATE'));

create or replace view public.vw_fixture as
select
  m.id,
  md.round,
  m.match_date,
  m.kickoff_time,
  coalesce(home_registration.display_name, home_team.name) as home_team,
  coalesce(away_registration.display_name, away_team.name) as away_team,
  field.name as field,
  nullif(concat_ws(' ', referee.first_name, referee.last_name), '') as referee,
  nullif(concat_ws(' ', supervisor.first_name, supervisor.last_name), '') as supervisor,
  m.home_score,
  m.away_score
from public.matches m
left join public.matchdays md on md.id = m.matchday_id
left join public.team_category_registrations home_registration on home_registration.id = m.home_team_registration_id
left join public.teams home_team on home_team.id = home_registration.team_id
left join public.team_category_registrations away_registration on away_registration.id = m.away_team_registration_id
left join public.teams away_team on away_team.id = away_registration.team_id
left join public.fields field on field.id = m.field_id
left join public.referees referee on referee.id = m.referee_id
left join public.referees supervisor on supervisor.id = m.supervisor_referee_id
where m.deleted_at is null;

grant select on public.vw_fixture to anon, authenticated;
notify pgrst, 'reload schema';
