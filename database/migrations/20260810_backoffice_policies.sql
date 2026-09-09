-- Politicas RLS iniciales para el panel de administracion.
-- Ejecutar despues de 20260810_profiles_roles.sql.

create or replace function public.current_role_code()
returns text
language sql
stable
security definer set search_path = public
as $$
  select role.code
  from public.profiles profile
  join public.roles role on role.id = profile.role_id
  where profile.id = auth.uid() and profile.active = true
  limit 1;
$$;

create or replace function public.is_backoffice_user()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_role_code() in (
    'SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'TEAM_MANAGER', 'REFEREE'
  ), false);
$$;

create or replace function public.can_manage_tournament()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_role_code() in (
    'SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'TEAM_MANAGER'
  ), false);
$$;

-- Catalogos y lectura para el panel de administracion.
drop policy if exists backoffice_read_tournaments on public.tournaments;
create policy backoffice_read_tournaments on public.tournaments for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_categories on public.categories;
create policy backoffice_read_categories on public.categories for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_zones on public.zones;
create policy backoffice_read_zones on public.zones for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_teams on public.teams;
create policy backoffice_read_teams on public.teams for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_team_registrations on public.team_category_registrations;
create policy backoffice_read_team_registrations on public.team_category_registrations for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_players on public.players;
create policy backoffice_read_players on public.players for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_player_registrations on public.player_team_registrations;
create policy backoffice_read_player_registrations on public.player_team_registrations for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_registration_statuses on public.registration_statuses;
create policy backoffice_read_registration_statuses on public.registration_statuses for select to authenticated using (public.is_backoffice_user());

-- Alta, edicion y baja para administradores y delegados.
drop policy if exists manager_write_teams on public.teams;
create policy manager_write_teams on public.teams for all to authenticated using (public.can_manage_tournament()) with check (public.can_manage_tournament());
drop policy if exists manager_write_team_registrations on public.team_category_registrations;
create policy manager_write_team_registrations on public.team_category_registrations for all to authenticated using (public.can_manage_tournament()) with check (public.can_manage_tournament());
drop policy if exists manager_write_players on public.players;
create policy manager_write_players on public.players for all to authenticated using (public.can_manage_tournament()) with check (public.can_manage_tournament());
drop policy if exists manager_write_player_registrations on public.player_team_registrations;
create policy manager_write_player_registrations on public.player_team_registrations for all to authenticated using (public.can_manage_tournament()) with check (public.can_manage_tournament());

-- Fixture, resultados y pagos.
drop policy if exists backoffice_read_matchdays on public.matchdays;
create policy backoffice_read_matchdays on public.matchdays for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_matches on public.matches;
create policy backoffice_read_matches on public.matches for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_match_statuses on public.match_statuses;
create policy backoffice_read_match_statuses on public.match_statuses for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_fields on public.fields;
create policy backoffice_read_fields on public.fields for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_referees on public.referees;
create policy backoffice_read_referees on public.referees for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_payments on public.payments;
create policy backoffice_read_payments on public.payments for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_payment_types on public.payment_types;
create policy backoffice_read_payment_types on public.payment_types for select to authenticated using (public.is_backoffice_user());
drop policy if exists backoffice_read_payment_statuses on public.payment_statuses;
create policy backoffice_read_payment_statuses on public.payment_statuses for select to authenticated using (public.is_backoffice_user());
drop policy if exists manager_write_matches on public.matches;
create policy manager_write_matches on public.matches for all to authenticated using (public.can_manage_tournament()) with check (public.can_manage_tournament());
drop policy if exists manager_write_payments on public.payments;
create policy manager_write_payments on public.payments for all to authenticated using (public.can_manage_tournament()) with check (public.can_manage_tournament());

grant select on public.vw_fixture, public.vw_standings to authenticated;
grant select on public.vw_player_suspensions to authenticated;

-- Las politicas RLS no reemplazan los privilegios SQL. Esto es necesario en
-- bases restauradas desde un backup, donde el rol `authenticated` puede no
-- haber recibido los grants que Supabase crea habitualmente.
grant usage on schema public to authenticated;
grant select on public.tournaments, public.categories, public.zones,
  public.teams, public.team_category_registrations, public.players,
  public.player_team_registrations, public.registration_statuses,
  public.matchdays, public.matches, public.match_statuses, public.fields,
  public.referees, public.payments, public.payment_types,
  public.payment_statuses to authenticated;
grant insert, update, delete on public.teams, public.team_category_registrations,
  public.players, public.player_team_registrations, public.matches,
  public.payments to authenticated;
