-- Refuerza que los administradores que ya pueden crear equipos también puedan
-- leer sus inscripciones activas desde Jugadores o Plantel. Es una defensa
-- adicional para entornos restaurados con grants o políticas incompletas.

grant select on public.team_category_registrations, public.categories, public.zones to authenticated;

drop policy if exists manager_read_team_registrations on public.team_category_registrations;
create policy manager_read_team_registrations
  on public.team_category_registrations
  for select to authenticated
  using (public.can_manage_tournament());

drop policy if exists manager_read_categories on public.categories;
create policy manager_read_categories
  on public.categories
  for select to authenticated
  using (public.can_manage_tournament());

drop policy if exists manager_read_zones on public.zones;
create policy manager_read_zones
  on public.zones
  for select to authenticated
  using (public.can_manage_tournament());

notify pgrst, 'reload schema';
