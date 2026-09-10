-- Marca como jugados los partidos históricos que ya tienen un marcador con
-- goles. Los 0-0 antiguos se mantienen programados hasta que se confirmen
-- nuevamente desde la pantalla de Resultados.

update public.matches m
set match_status_id = status.id
from public.match_statuses status
where status.code = 'PLAYED'
  and m.deleted_at is null
  and m.match_status_id is distinct from status.id
  and (coalesce(m.home_score, 0) <> 0 or coalesce(m.away_score, 0) <> 0);

notify pgrst, 'reload schema';
