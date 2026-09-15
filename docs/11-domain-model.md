# Modelo de dominio

`Tournament` contiene `Category`; cada categoría posee zonas generadas de A a E. Un `Team` participa mediante `TeamCategoryRegistration` (torneo + categoría + zona), no directamente en un único torneo. Un `Player` se vincula con una o más inscripciones activas del mismo equipo mediante `PlayerTeamRegistration`.

Una `Matchday` pertenece a torneo, categoría, zona y fase. Un `Match` enlaza jornada, inscripciones local/visitante, recursos (cancha y terna arbitral), estado y marcador. `MatchEvent` genera estadísticas; las vistas `vw_fixture`, `vw_standings` y `vw_top_scorers` son proyecciones de lectura.

Una `MatchSheetControl` gobierna la planilla digital del partido: `DRAFT` precarga convocatoria, `OPEN` habilita la carga y `CLOSED` inmoviliza el resultado. Las `MatchSheetEntry` registran presentismo y las `MatchSheetConfirmation` dejan constancia digital.

Un `PlayoffBracket` pertenece a un torneo y categoría. Sus `PlayoffBracketMatch` pueden partir de equipos concretos o de otros cruces; al definirse un ganador se completa la llave siguiente y se crea el partido de fixture cuando ambas partes estén resueltas. El archivo de torneo conserva el dominio original; la capa de historia consultable todavía no existe.
