-- RETIRO SEGURO DE UN TORNEO DE QA O DEMO
--
-- Uso: reemplazar únicamente el UUID en target_tournament_id y ejecutar el
-- archivo entero en Supabase SQL Editor. No toca otros torneos ni el padrón
-- global de jugadores. Conserva una baja lógica y el historial técnico.
--
-- Protección: sólo admite torneos cuyo nombre contenga QA, DEMO, PRUEBA o
-- TUTORIAL. Para eliminar un torneo operativo usar el archivo de administración
-- correspondiente, nunca modificar esta protección.

begin;

do $$
declare
  target_tournament_id uuid := '00000000-0000-0000-0000-000000000000'; -- REEMPLAZAR
  target_name text;
  now_value timestamptz := now();
begin
  select name into target_name
  from public.tournaments
  where id = target_tournament_id;

  if target_name is null then
    raise exception 'No existe un torneo con el UUID indicado.';
  end if;

  if target_name !~* '(qa|demo|prueba|tutorial)' then
    raise exception 'Por seguridad sólo se pueden retirar torneos de QA o DEMO. Torneo recibido: %', target_name;
  end if;

  -- Un torneo archivado bloquea cambios de fixture. Lo habilitamos sólo durante
  -- esta transacción para retirarlo y vuelve a quedar fuera de operación al final.
  update public.tournaments
  set archived_at = null,
      archived_by = null
  where id = target_tournament_id;

  -- Los cuadros y sus cruces quedan fuera de la vista activa.
  delete from public.playoff_brackets
  where tournament_id = target_tournament_id;

  -- Retira las convocatorias del torneo, manteniendo el catálogo global de jugadores.
  update public.player_team_registrations player_registration
  set left_at = coalesce(player_registration.left_at, current_date),
      deleted_at = coalesce(player_registration.deleted_at, now_value)
  from public.team_category_registrations team_registration
  join public.categories category on category.id = team_registration.category_id
  where player_registration.team_registration_id = team_registration.id
    and category.tournament_id = target_tournament_id
    and player_registration.deleted_at is null;

  update public.team_category_registrations team_registration
  set deleted_at = coalesce(team_registration.deleted_at, now_value)
  from public.categories category
  where category.id = team_registration.category_id
    and category.tournament_id = target_tournament_id
    and team_registration.deleted_at is null;

  -- Baja lógica de partidos y fechas: las planillas, eventos y confirmaciones
  -- permanecen como trazabilidad técnica, pero ya no aparecen en la aplicación.
  update public.matches fixture_match
  set deleted_at = coalesce(fixture_match.deleted_at, now_value)
  from public.matchdays matchday
  where fixture_match.matchday_id = matchday.id
    and matchday.tournament_id = target_tournament_id
    and fixture_match.deleted_at is null;

  update public.matchdays
  set deleted_at = coalesce(deleted_at, now_value)
  where tournament_id = target_tournament_id
    and deleted_at is null;

  update public.zones zone
  set deleted_at = coalesce(zone.deleted_at, now_value)
  from public.categories category
  where zone.category_id = category.id
    and category.tournament_id = target_tournament_id
    and zone.deleted_at is null;

  update public.categories
  set active = false,
      deleted_at = coalesce(deleted_at, now_value)
  where tournament_id = target_tournament_id
    and deleted_at is null;

  -- Sólo desactiva equipos que, tras retirar este torneo, no participan de
  -- ningún otro torneo activo. Así nunca borra un equipo reutilizado.
  update public.teams team
  set active = false,
      deleted_at = coalesce(team.deleted_at, now_value)
  where exists (
      select 1
      from public.team_category_registrations registration
      join public.categories category on category.id = registration.category_id
      where registration.team_id = team.id
        and category.tournament_id = target_tournament_id
    )
    and not exists (
      select 1
      from public.team_category_registrations registration
      where registration.team_id = team.id
        and registration.deleted_at is null
    );

  update public.tournaments
  set archived_at = now_value,
      deleted_at = now_value
  where id = target_tournament_id;
end;
$$;

commit;

notify pgrst, 'reload schema';

-- Verificación: debe devolver un único torneo con ambas fechas completas y
-- cero partidos/inscripciones activas relacionados a él.
-- Reemplazar el UUID nuevamente antes de ejecutar esta consulta.
select
  tournament.id,
  tournament.name,
  tournament.archived_at,
  tournament.deleted_at,
  (select count(*) from public.matchdays matchday where matchday.tournament_id = tournament.id and matchday.deleted_at is null) as fechas_activas,
  (select count(*) from public.matches fixture_match join public.matchdays matchday on matchday.id = fixture_match.matchday_id where matchday.tournament_id = tournament.id and fixture_match.deleted_at is null) as partidos_activos
from public.tournaments tournament
where tournament.id = '00000000-0000-0000-0000-000000000000'; -- REEMPLAZAR
