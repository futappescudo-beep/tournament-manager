# Roles y Permisos

## SUPER_ADMIN / TOURNAMENT_ADMIN

* Acceso de backoffice al torneo
* Gestiona equipos, jugadores, partidos, resultados y sanciones

## TEAM_MANAGER

* Gestiona únicamente su equipo y su lista de buena fe
* Puede ver fixture, resultados y tabla

## REFEREE

* Puede cargar resultados, goles y tarjetas de los partidos asignados

## PLAYER y Público

* `PLAYER` es el rol inicial de una cuenta autenticada.
* Público usa `/public` y solo consulta fixture y posiciones.

La restricción granular por equipo o por partido asignado no está cerrada: `TEAM_MANAGER` conserva permisos amplios de backoffice. Ver `14-rls-backoffice.md`.
