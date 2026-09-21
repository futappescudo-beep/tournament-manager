-- El número, la capitanía y el puesto de arquero son datos del partido,
-- no atributos permanentes del jugador ni de su inscripción al plantel.

alter table public.match_sheet_entries
  add column if not exists is_captain boolean not null default false,
  add column if not exists is_goalkeeper boolean not null default false;

notify pgrst, 'reload schema';
