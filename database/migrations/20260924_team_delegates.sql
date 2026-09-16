-- Un delegado operativo por equipo, designado exclusivamente por SUPER_ADMIN.
-- El delegado conserva su rol global (normalmente PLAYER) y sólo obtiene
-- acceso a la planilla de los partidos de su equipo.

create table if not exists public.team_delegate_assignments (
  team_id uuid primary key references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  assigned_by uuid not null references public.profiles(id),
  assigned_at timestamptz not null default now()
);

create index if not exists team_delegate_assignments_profile_idx
  on public.team_delegate_assignments(profile_id);

alter table public.team_delegate_assignments enable row level security;
grant select on public.team_delegate_assignments to authenticated;

create or replace function public.is_team_delegate_for_team(target_team_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.team_delegate_assignments assignment
    where assignment.team_id = target_team_id
      and assignment.profile_id = auth.uid()
  );
$$;

create or replace function public.is_team_delegate_for_registration(target_registration_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.team_category_registrations registration
    join public.team_delegate_assignments assignment on assignment.team_id = registration.team_id
    where registration.id = target_registration_id
      and registration.deleted_at is null
      and assignment.profile_id = auth.uid()
  );
$$;

create or replace function public.is_match_delegate(target_match_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.matches match
    join public.team_category_registrations registration
      on registration.id in (match.home_team_registration_id, match.away_team_registration_id)
    join public.team_delegate_assignments assignment on assignment.team_id = registration.team_id
    where match.id = target_match_id
      and match.deleted_at is null
      and registration.deleted_at is null
      and assignment.profile_id = auth.uid()
  );
$$;

create or replace function public.can_confirm_match_as_delegate(
  target_match_id uuid,
  target_confirmation_type text
)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.matches match
    join public.team_category_registrations registration
      on registration.id = case
        when target_confirmation_type = 'HOME_DELEGATE' then match.home_team_registration_id
        when target_confirmation_type = 'AWAY_DELEGATE' then match.away_team_registration_id
        else null
      end
    join public.team_delegate_assignments assignment on assignment.team_id = registration.team_id
    where match.id = target_match_id
      and match.deleted_at is null
      and registration.deleted_at is null
      and assignment.profile_id = auth.uid()
  );
$$;

create or replace function public.assign_team_delegate(target_team_id uuid, target_profile_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Solo un SUPER_ADMIN puede asignar delegados';
  end if;

  if not exists (select 1 from public.teams where id = target_team_id and deleted_at is null and active = true) then
    raise exception 'El equipo seleccionado no está activo';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    join public.roles role on role.id = profile.role_id
    where profile.id = target_profile_id
      and profile.active = true
      and role.code = 'PLAYER'
  ) then
    raise exception 'El delegado debe ser un usuario activo con rol Jugador';
  end if;

  insert into public.team_delegate_assignments (team_id, profile_id, assigned_by, assigned_at)
  values (target_team_id, target_profile_id, auth.uid(), now())
  on conflict (team_id) do update
    set profile_id = excluded.profile_id,
        assigned_by = excluded.assigned_by,
        assigned_at = excluded.assigned_at;
end;
$$;

create or replace function public.remove_team_delegate(target_team_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Solo un SUPER_ADMIN puede quitar delegados';
  end if;

  delete from public.team_delegate_assignments where team_id = target_team_id;
end;
$$;

drop policy if exists team_delegate_assignments_read on public.team_delegate_assignments;
create policy team_delegate_assignments_read on public.team_delegate_assignments
  for select to authenticated
  using (public.is_super_admin() or profile_id = auth.uid());

-- El delegado puede leer su planilla, pero no modificar convocatoria ni eventos.
drop policy if exists sheet_controls_read on public.match_sheet_controls;
create policy sheet_controls_read on public.match_sheet_controls
  for select to authenticated using (public.is_backoffice_user() or public.is_match_delegate(match_id));
drop policy if exists sheet_entries_read on public.match_sheet_entries;
create policy sheet_entries_read on public.match_sheet_entries
  for select to authenticated using (public.is_backoffice_user() or public.is_match_delegate(match_id));
drop policy if exists sheet_confirmations_read on public.match_sheet_confirmations;
create policy sheet_confirmations_read on public.match_sheet_confirmations
  for select to authenticated using (public.is_backoffice_user() or public.is_match_delegate(match_id));

drop policy if exists sheet_confirmations_open_referee_or_admin_insert on public.match_sheet_confirmations;
create policy sheet_confirmations_open_referee_admin_or_delegate_insert on public.match_sheet_confirmations
  for insert to authenticated
  with check (
    public.is_tournament_administrator()
    or (public.current_role_code() = 'REFEREE' and exists (
      select 1 from public.match_sheet_controls control
      where control.match_id = match_sheet_confirmations.match_id and control.status = 'OPEN'
    ))
    or (
      confirmation_type in ('HOME_DELEGATE', 'AWAY_DELEGATE')
      and public.can_confirm_match_as_delegate(match_id, confirmation_type)
      and exists (
        select 1 from public.match_sheet_controls control
        where control.match_id = match_sheet_confirmations.match_id and control.status = 'OPEN'
      )
    )
  );

drop policy if exists backoffice_read_matches on public.matches;
create policy backoffice_read_matches on public.matches
  for select to authenticated using (public.is_backoffice_user() or public.is_match_delegate(id));
drop policy if exists backoffice_read_team_registrations on public.team_category_registrations;
create policy backoffice_read_team_registrations on public.team_category_registrations
  for select to authenticated using (public.is_backoffice_user() or public.is_team_delegate_for_registration(id));
drop policy if exists backoffice_read_players on public.players;
create policy backoffice_read_players on public.players
  for select to authenticated using (public.is_backoffice_user() or exists (
    select 1
    from public.player_team_registrations registration
    where registration.player_id = players.id
      and registration.deleted_at is null
      and public.is_team_delegate_for_registration(registration.team_registration_id)
  ));
drop policy if exists backoffice_read_player_registrations on public.player_team_registrations;
create policy backoffice_read_player_registrations on public.player_team_registrations
  for select to authenticated using (public.is_backoffice_user() or public.is_team_delegate_for_registration(team_registration_id));
drop policy if exists backoffice_read_teams on public.teams;
create policy backoffice_read_teams on public.teams
  for select to authenticated using (public.is_backoffice_user() or public.is_team_delegate_for_team(id));

drop policy if exists backoffice_read_match_events on public.match_events;
create policy backoffice_read_match_events on public.match_events
  for select to authenticated using (public.is_backoffice_user() or public.is_match_delegate(match_id));
drop policy if exists backoffice_read_event_types on public.event_types;
create policy backoffice_read_event_types on public.event_types
  for select to authenticated using (public.is_backoffice_user() or exists (
    select 1 from public.team_delegate_assignments assignment where assignment.profile_id = auth.uid()
  ));
drop policy if exists backoffice_read_referees on public.referees;
create policy backoffice_read_referees on public.referees
  for select to authenticated using (public.is_backoffice_user() or exists (
    select 1 from public.team_delegate_assignments assignment where assignment.profile_id = auth.uid()
  ));

grant select on public.match_events, public.event_types to authenticated;
notify pgrst, 'reload schema';
