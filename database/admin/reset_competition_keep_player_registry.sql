-- REINICIO OPERATIVO PARA SALIDA A PRODUCCIÓN
-- Ejecutar una sola vez en Supabase SQL Editor, con backup previo.
--
-- Elimina datos deportivos de prueba (fixture, planillas, resultados,
-- play-offs, pagos, equipos e inscripciones) y conserva usuarios, roles,
-- árbitros, canchas y el padrón de jugadores. Las fichas de jugadores quedan
-- sin equipo activo para poder asignarlas al próximo torneo sin volver a
-- cargar el DNI ni los datos personales.

begin;

-- Datos de partidos y documentos de prueba. Algunas tablas pertenecen a
-- versiones anteriores; to_regclass permite ejecutar el reinicio igual.
do $$
begin
  if to_regclass('public.match_sheet_confirmations') is not null then execute 'delete from public.match_sheet_confirmations'; end if;
  if to_regclass('public.match_sheet_entries') is not null then execute 'delete from public.match_sheet_entries'; end if;
  if to_regclass('public.match_sheet_controls') is not null then execute 'delete from public.match_sheet_controls'; end if;
  if to_regclass('public.match_sheets') is not null then execute 'delete from public.match_sheets'; end if;
  if to_regclass('public.match_officials') is not null then execute 'delete from public.match_officials'; end if;
  if to_regclass('public.match_events') is not null then execute 'delete from public.match_events'; end if;
  if to_regclass('public.sanctions') is not null then execute 'delete from public.sanctions'; end if;
  if to_regclass('public.payments') is not null then execute 'delete from public.payments'; end if;
  if to_regclass('public.tournament_documents') is not null then execute 'delete from public.tournament_documents'; end if;
  if to_regclass('public.tournament_settings') is not null then execute 'delete from public.tournament_settings'; end if;
  if to_regclass('public.team_delegate_assignments') is not null then execute 'delete from public.team_delegate_assignments'; end if;
  if to_regclass('public.player_registrations') is not null then execute 'delete from public.player_registrations'; end if;
end;
$$;

-- Los cuadros no conservan valor para un entorno que se reinicia. Sus llaves
-- dependientes se eliminan en cascada.
delete from public.playoff_brackets;

-- Las inscripciones se conservan como historial, pero dejan de estar activas.
update public.player_team_registrations
set left_at = coalesce(left_at, current_date),
    deleted_at = coalesce(deleted_at, now())
where deleted_at is null or left_at is null;

-- Recupera fichas dadas de baja en pruebas: el catálogo de jugadores queda
-- completo y sin equipo para una nueva inscripción.
update public.players set deleted_at = null where deleted_at is not null;

-- Desactiva todo el contexto competitivo de prueba, sin afectar catálogos
-- generales como roles, perfiles, árbitros, canchas o tipos de pago.
-- Primero marca los torneos eliminados. Así los triggers de integridad de un
-- torneo archivado permiten retirar sus fechas y encuentros en este reinicio.
update public.tournaments
set archived_at = coalesce(archived_at, now()),
    deleted_at = coalesce(deleted_at, now())
where deleted_at is null;

update public.matches set deleted_at = coalesce(deleted_at, now()) where deleted_at is null;
update public.matchdays set deleted_at = coalesce(deleted_at, now()) where deleted_at is null;
update public.team_category_registrations set deleted_at = coalesce(deleted_at, now()) where deleted_at is null;
update public.teams set active = false, deleted_at = coalesce(deleted_at, now()) where deleted_at is null;
update public.zones set deleted_at = coalesce(deleted_at, now()) where deleted_at is null;
update public.categories set active = false, deleted_at = coalesce(deleted_at, now()) where deleted_at is null;

commit;

notify pgrst, 'reload schema';

-- Verificación esperada: 0 torneos/equipos activos y jugadores conservados.
select
  (select count(*) from public.tournaments where deleted_at is null and archived_at is null) as torneos_activos,
  (select count(*) from public.teams where deleted_at is null and active) as equipos_activos,
  (select count(*) from public.players where deleted_at is null) as jugadores_disponibles,
  (select count(*) from public.player_team_registrations where deleted_at is null and left_at is null) as asignaciones_activas;
