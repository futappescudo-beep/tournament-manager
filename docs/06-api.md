# Acciones de servidor y servicios

## Equipos

* createTeam
* updateTeam
* deleteTeam
* listados, roster y asignaciones viven en `lib/service/team.service.ts`.

## Jugadores

* createPlayer
* updatePlayer
* deletePlayer
* asignación a equipo/categoría/zona y foto en `lib/service/player.service.ts`.

## Partidos

* createMatch
* updateMatch
* `createManualFixtureMatch`, `saveMatchResult` y eventos de partido.

## Estadísticas

* getStandings
* getTopScorers

## Documentos

## Consultas

`competition.service.ts`, `dashboard.service.ts` y `settings.service.ts` concentran fixture, resultados, posiciones, catálogos y recursos. No hay API REST pública general: `/api/teams` es una ruta puntual; el resto usa Server Actions.
