-- Acceso de invitado: expone exclusivamente información pública de torneos
-- activos. Las vistas se ejecutan con los permisos de su propietario, por lo
-- que el rol anon no necesita ni recibe acceso directo a tablas operativas.

create or replace view public.vw_guest_fixture
with (security_invoker = false)
as
select fixture.*
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
select standings.*
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

do $$
begin
  if to_regclass('public.vw_top_scorers') is not null then
    execute 'create or replace view public.vw_guest_scorers with (security_invoker = false) as select id, first_name, last_name, goals from public.vw_top_scorers';
  else
    execute 'create or replace view public.vw_guest_scorers with (security_invoker = false) as select null::uuid as id, null::text as first_name, null::text as last_name, 0::bigint as goals where false';
  end if;

  if to_regclass('public.vw_player_suspensions') is not null then
    execute 'create or replace view public.vw_guest_suspensions with (security_invoker = false) as select first_name, last_name, yellow_cards, red_cards, automatic_suspensions, manual_suspensions from public.vw_player_suspensions';
  else
    execute 'create or replace view public.vw_guest_suspensions with (security_invoker = false) as select null::text as first_name, null::text as last_name, 0::bigint as yellow_cards, 0::bigint as red_cards, 0::bigint as automatic_suspensions, 0::bigint as manual_suspensions where false';
  end if;
end;
$$;

grant usage on schema public to anon;
grant select on public.vw_guest_fixture, public.vw_guest_standings,
  public.vw_guest_scorers, public.vw_guest_suspensions to anon;

notify pgrst, 'reload schema';
