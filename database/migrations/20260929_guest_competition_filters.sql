-- Filtros públicos Torneo → Categoría → Zona para el modo invitado.
-- Mantiene los permisos restringidos a vistas de solo lectura.

create or replace view public.vw_guest_fixture
with (security_invoker = false)
as
select
  fixture.*,
  tournament.id as tournament_id,
  matchday.category_id,
  matchday.zone_id
from public.vw_fixture fixture
join public.matches match on match.id = fixture.id
join public.matchdays matchday on matchday.id = match.matchday_id
join public.tournaments tournament on tournament.id = matchday.tournament_id
where match.deleted_at is null
  and matchday.deleted_at is null
  and tournament.deleted_at is null
  and tournament.archived_at is null;

create or replace view public.vw_guest_standings
with (security_invoker = false)
as
select
  standings.*,
  tournament.id as tournament_id,
  category.id as category_id,
  registration.zone_id
from public.vw_standings standings
join public.team_category_registrations registration
  on registration.id = standings.team_registration_id
join public.categories category on category.id = registration.category_id
join public.tournaments tournament on tournament.id = category.tournament_id
where registration.deleted_at is null
  and category.deleted_at is null
  and category.active is true
  and tournament.deleted_at is null
  and tournament.archived_at is null;

create or replace view public.vw_guest_competition_filters
with (security_invoker = false)
as
select
  tournament.id as tournament_id,
  tournament.name as tournament_name,
  category.id as category_id,
  category.name as category_name,
  zone.id as zone_id,
  zone.name as zone_name
from public.tournaments tournament
join public.categories category on category.tournament_id = tournament.id
join public.zones zone on zone.category_id = category.id
where tournament.deleted_at is null
  and tournament.archived_at is null
  and category.deleted_at is null
  and category.active is true
  and zone.deleted_at is null;

grant select on public.vw_guest_fixture, public.vw_guest_standings,
  public.vw_guest_competition_filters to anon;

notify pgrst, 'reload schema';
