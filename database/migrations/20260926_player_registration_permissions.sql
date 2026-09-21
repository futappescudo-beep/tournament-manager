-- Garantiza que los administradores puedan dar de alta jugadores y asignarlos
-- a planteles. Reaplica los grants/políticas por si una restauración previa de
-- la base los hubiera omitido.

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.players, public.player_team_registrations to authenticated;

drop policy if exists manager_write_players on public.players;
create policy manager_write_players on public.players
  for all to authenticated
  using (public.can_manage_tournament())
  with check (public.can_manage_tournament());

drop policy if exists manager_write_player_registrations on public.player_team_registrations;
create policy manager_write_player_registrations on public.player_team_registrations
  for all to authenticated
  using (public.can_manage_tournament())
  with check (public.can_manage_tournament());

notify pgrst, 'reload schema';
