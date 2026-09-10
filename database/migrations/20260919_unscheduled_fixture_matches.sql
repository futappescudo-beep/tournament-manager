-- Permite generar la estructura deportiva antes de conocer día, hora, cancha
-- o terna. Los encuentros pasan a programarse o reprogramarse posteriormente.
alter table public.matchdays
  alter column starts_at drop not null;

alter table public.matches
  alter column match_date drop not null,
  alter column kickoff_time drop not null;

notify pgrst, 'reload schema';
