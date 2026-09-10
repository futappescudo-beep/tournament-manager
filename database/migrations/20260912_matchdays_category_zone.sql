-- Completa la estructura de fechas para poder separar cada jornada por
-- torneo, categoría y zona. No modifica ni elimina fechas ya existentes.

alter table public.matchdays
  add column if not exists category_id uuid references public.categories(id) on delete restrict,
  add column if not exists zone_id uuid references public.zones(id) on delete restrict;

create index if not exists matchdays_tournament_category_zone_idx
  on public.matchdays (tournament_id, category_id, zone_id);

notify pgrst, 'reload schema';
