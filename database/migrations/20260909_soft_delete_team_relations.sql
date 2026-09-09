-- Corrige bajas realizadas antes de la versión 0.2.4.
-- Un equipo dado de baja no debe conservar inscripciones ni jugadores activos.

update public.team_category_registrations as registration
set deleted_at = coalesce(registration.deleted_at, now())
where registration.deleted_at is null
  and exists (
    select 1
    from public.teams as team
    where team.id = registration.team_id
      and (team.deleted_at is not null or team.active = false)
  );

update public.player_team_registrations as player_registration
set
  left_at = coalesce(player_registration.left_at, current_date),
  deleted_at = coalesce(player_registration.deleted_at, now())
where player_registration.deleted_at is null
  and exists (
    select 1
    from public.team_category_registrations as registration
    where registration.id = player_registration.team_registration_id
      and registration.deleted_at is not null
  );
