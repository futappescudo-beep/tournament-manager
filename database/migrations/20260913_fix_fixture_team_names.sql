-- Actualiza la vista del fixture para leer las inscripciones de equipo
-- actuales. Corrige también los partidos que ya fueron cargados.

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
where m.deleted_at is null;

notify pgrst, 'reload schema';
