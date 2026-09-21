-- Los usuarios PLAYER tienen navegación de consulta: filtros, fixture,
-- resultados, posiciones, goleadores, sanciones y reglamento. No reciben
-- políticas de escritura ni acceso a configuración, equipos o planteles.

drop policy if exists authenticated_competition_read_tournaments on public.tournaments;
create policy authenticated_competition_read_tournaments on public.tournaments
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_categories on public.categories;
create policy authenticated_competition_read_categories on public.categories
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_zones on public.zones;
create policy authenticated_competition_read_zones on public.zones
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_teams on public.teams;
create policy authenticated_competition_read_teams on public.teams
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_team_registrations on public.team_category_registrations;
create policy authenticated_competition_read_team_registrations on public.team_category_registrations
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_players on public.players;
create policy authenticated_competition_read_players on public.players
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_player_registrations on public.player_team_registrations;
create policy authenticated_competition_read_player_registrations on public.player_team_registrations
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_matchdays on public.matchdays;
create policy authenticated_competition_read_matchdays on public.matchdays
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_fields on public.fields;
create policy authenticated_competition_read_fields on public.fields
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_referees on public.referees;
create policy authenticated_competition_read_referees on public.referees
  for select to authenticated using (true);
drop policy if exists authenticated_competition_read_match_statuses on public.match_statuses;
create policy authenticated_competition_read_match_statuses on public.match_statuses
  for select to authenticated using (true);

notify pgrst, 'reload schema';
