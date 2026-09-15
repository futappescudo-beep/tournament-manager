# Roles y Permisos

## SUPER_ADMIN / TOURNAMENT_ADMIN

* Acceso de administración al torneo activo.
* Gestiona catálogos, equipos, jugadores, fixture, resultados, planillas, Play Off y archivo de torneo.

## TEAM_MANAGER

* Alcance deseado: gestiona únicamente su equipo y su lista de buena fe; consulta fixture, resultados y tabla.
* Estado actual: la política de base aún concede permisos amplios de gestión de equipos y jugadores. No debe considerarse una restricción cerrada.

## REFEREE

* Alcance deseado: opera la planilla abierta y carga datos solo de partidos que tiene asignados.
* Estado actual: puede confirmar y actualizar presentismo de una planilla abierta según RLS; la asignación exclusiva por partido y el registro integral de resultado/eventos no están cerrados.

## PLAYER y Público

* `PLAYER` es el rol inicial de una cuenta autenticada.
* Público usa `/public` y solo consulta fixture y posiciones.

La restricción granular por equipo o por partido asignado no está cerrada. Ver `14-rls-backoffice.md`.
