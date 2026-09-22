# Roles y Permisos

## SUPER_ADMIN / TOURNAMENT_ADMIN

* Acceso de administración al torneo activo.
* Gestiona catálogos, equipos, jugadores, fixture, resultados, planillas, Play Off y archivo de torneo.

## TEAM_MANAGER

* Alcance deseado: gestiona únicamente su equipo y su lista de buena fe; consulta fixture, resultados y tabla.
* Estado actual: la política de base aún concede permisos amplios de gestión de equipos y jugadores. No debe considerarse una restricción cerrada.

## REFEREE

* Alcance operativo acordado: una cuenta arbitral compartida opera las planillas abiertas y confirma como árbitro o veedor según la designación registrada en el partido.
* Estado actual: puede confirmar y actualizar presentismo de una planilla abierta. La cuenta compartida no identifica por sí sola al oficial físico; la designación en el partido y la matriz de aceptación son el control operativo pendiente.

## PLAYER y Público

* `PLAYER` es el rol inicial de una cuenta autenticada.
* Público usa `/public` sin sesión y consulta Principal, Fixture, Resultados, Posiciones, Goleadores, Sanciones y Reglamento, con filtros Torneo → Categoría → Zona.

La restricción granular por equipo o por partido asignado no está cerrada. Ver `14-rls-backoffice.md`.
