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
* `createManualFixtureMatch`, `createRegularFixture`, `saveFixtureSchedule`, `saveMatchResult` y eventos de partido.
* Planilla: `setSheetStatus`, `saveSheetEntry`, `confirmSheet` y `cancelPreliminarySheet`.
* Play Off: `savePlayoffBracket` y `publishPlayoffBracket`.

## Estadísticas

* getStandings
* getTopScorers

## Documentos

No hay acciones para adjuntar, exportar o firmar documentos en formato PDF/imagen.

## Consultas

`competition.service.ts`, `dashboard.service.ts`, `playoffs.service.ts` y `settings.service.ts` concentran fixture, resultados, posiciones, cuadros y catálogos. No hay API REST pública general: `/api/teams` es una ruta puntual; el resto usa Server Actions.
