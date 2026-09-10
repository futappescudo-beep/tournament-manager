-- Registra el estado de partidos jugados y reconstruye las posiciones a
-- partir de las inscripciones actuales de equipo.

insert into public.match_statuses (code, name, display_order)
select 'PLAYED', 'Jugado', 2
where not exists (
  select 1 from public.match_statuses where code = 'PLAYED'
);

create or replace view public.vw_standings as
with competition_scopes as (
  select distinct m.competition_phase_id, md.category_id, md.zone_id
  from public.matches m
  join public.matchdays md on md.id = m.matchday_id
  where m.deleted_at is null
    and md.deleted_at is null
    and md.category_id is not null
    and md.zone_id is not null
), played_matches as (
  select m.*
  from public.matches m
  join public.match_statuses status on status.id = m.match_status_id
  where m.deleted_at is null
    and status.code = 'PLAYED'
), team_results as (
  select
    home_team_registration_id as team_registration_id,
    competition_phase_id,
    count(*) as played,
    count(*) filter (where home_score > away_score) as won,
    count(*) filter (where home_score = away_score) as drawn,
    count(*) filter (where home_score < away_score) as lost,
    coalesce(sum(home_score), 0) as goals_for,
    coalesce(sum(away_score), 0) as goals_against
  from played_matches
  group by home_team_registration_id, competition_phase_id
  union all
  select
    away_team_registration_id as team_registration_id,
    competition_phase_id,
    count(*) as played,
    count(*) filter (where away_score > home_score) as won,
    count(*) filter (where away_score = home_score) as drawn,
    count(*) filter (where away_score < home_score) as lost,
    coalesce(sum(away_score), 0) as goals_for,
    coalesce(sum(home_score), 0) as goals_against
  from played_matches
  group by away_team_registration_id, competition_phase_id
), totals as (
  select
    team_registration_id,
    competition_phase_id,
    sum(played) as played,
    sum(won) as won,
    sum(drawn) as drawn,
    sum(lost) as lost,
    sum(goals_for) as goals_for,
    sum(goals_against) as goals_against
  from team_results
  group by team_registration_id, competition_phase_id
)
select
  registration.id as team_registration_id,
  coalesce(registration.display_name, team.name) as display_name,
  scope.competition_phase_id,
  null::uuid as competition_group_id,
  coalesce(totals.played, 0) as played,
  coalesce(totals.won, 0) as won,
  coalesce(totals.drawn, 0) as drawn,
  coalesce(totals.lost, 0) as lost,
  coalesce(totals.goals_for, 0) as goals_for,
  coalesce(totals.goals_against, 0) as goals_against
from competition_scopes scope
join public.team_category_registrations registration
  on registration.category_id = scope.category_id
 and registration.zone_id = scope.zone_id
 and registration.deleted_at is null
left join public.teams team on team.id = registration.team_id
left join totals
  on totals.team_registration_id = registration.id
 and totals.competition_phase_id = scope.competition_phase_id;

notify pgrst, 'reload schema';
