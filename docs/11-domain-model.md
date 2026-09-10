# Modelo de dominio

`Tournament` contiene `Category`; cada categoría posee zonas generadas de A a E. Un `Team` participa mediante `TeamCategoryRegistration` (torneo + categoría + zona), no directamente en un único torneo. Un `Player` se vincula con una o más inscripciones activas del mismo equipo mediante `PlayerTeamRegistration`.

Una `Matchday` pertenece a torneo, categoría y zona. Un `Match` enlaza jornada, inscripciones local/visitante, recursos (cancha y terna arbitral), estado y marcador. `MatchEvent` genera estadísticas; las vistas `vw_fixture`, `vw_standings` y `vw_top_scorers` son proyecciones de lectura.
