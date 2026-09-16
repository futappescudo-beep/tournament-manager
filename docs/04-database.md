# Modelo de datos vigente

## Tablas

### profiles

* id (uuid, PK, referencia a auth.users)
* full_name
* role
* created_at

### tournaments

* id
* name
* season
* archived_at, archived_by
* deleted_at
* created_at

### teams y team_category_registrations

* id
* name
* short_name
* logo_url
* created_at

Las inscripciones vinculan equipo, torneo, categoría y zona; son la referencia para fixture, plantel y posiciones.

Los cuadros eliminatorios se modelan con `playoff_brackets` y `playoff_bracket_matches`. Un cruce puede indicar equipos concretos o una procedencia textual, como “Ganador de repechaje 1”; por eso el cuadro se puede diseñar antes de que estén resueltos todos sus partidos.

### players y player_team_registrations

* id
* first_name
* last_name
* dni
* birth_date
* photo_url
* created_at

Las asignaciones activas vinculan un jugador con una inscripción de equipo. Dorsal, capitán y arquero no participan del flujo actual.

### matches y matchdays

* id
* matchday_id (la jornada tiene torneo, categoría, zona, fase y número de fecha)
* match_date
* field_id, referee_id, assistant_referee_1_id, assistant_referee_2_id, supervisor_referee_id
* home_team_registration_id
* away_team_registration_id
* home_score
* away_score
* status (scheduled, played, postponed)
* created_at

### goals

* id
* match_id
* player_id
* team_id
* minute

### cards

* id
* match_id
* player_id
* type (yellow, red)
* minute

### sanctions

* id
* player_id
* reason
* matches_suspended
* active

### Vistas y recursos

* `vw_fixture`: fixture publicado con nombres de equipos y recursos.
* `vw_standings`: posiciones a partir de partidos `PLAYED`.
* `vw_top_scorers`: ranking de goles registrados.
* `fields`, `referees`, `match_events`, `match_sheet_entries`, `match_sheet_confirmations`, `sanctions`, `payments` y catálogos de estado.
* `playoff_brackets` y `playoff_bracket_matches` conservan torneo/categoría, instancias, procedencias, vínculo al partido de fixture y ganador.

La planilla digital se controla en `match_sheet_controls` con estados `DRAFT`, `OPEN` y `CLOSED`. Al crear la preliminar, un trigger copia los jugadores activos de ambos equipos a `match_sheet_entries`; mientras está en `DRAFT` puede cancelarse y eliminar esa convocatoria. Las confirmaciones contemplan árbitro, veedor y ambos delegados. Aún no existe adjunto PDF/imagen ni generación de PDF.

No existe por ahora una tabla de campeones/títulos ni una proyección histórica para ranking: deberá agregarse sin borrar los datos de torneos archivados.
