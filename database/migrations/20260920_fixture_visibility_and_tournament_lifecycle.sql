-- Fixture visible para todos los usuarios autenticados y ciclo de vida del torneo.
alter table public.tournaments add column if not exists archived_at timestamptz;
alter table public.tournaments add column if not exists archived_by uuid references public.profiles(id);

-- El filtro de fases expone Regular y Play Off incluso antes de crear sus cruces.
insert into public.competition_phase_types (code, name, display_order)
select 'KNOCKOUT', 'Play Off', 2
where not exists (select 1 from public.competition_phase_types where code = 'KNOCKOUT');

do $$
declare
  template_uuid uuid;
  phase_type_uuid uuid;
begin
  select id into template_uuid from public.competition_templates where name = 'Fixture manual' and deleted_at is null limit 1;
  select id into phase_type_uuid from public.competition_phase_types where code = 'KNOCKOUT' limit 1;
  if template_uuid is not null and phase_type_uuid is not null and not exists (
    select 1 from public.competition_phases where template_id = template_uuid and name = 'Play Off' and deleted_at is null
  ) then
    insert into public.competition_phases (template_id, name, phase_type_id, display_order, is_elimination)
    values (template_uuid, 'Play Off', phase_type_uuid, 2, true);
  end if;
end;
$$;

-- El catálogo incluye ambas etapas aun cuando todavía no haya partidos de playoff.
insert into public.competition_phase_types (code, name, display_order)
select 'KNOCKOUT', 'Play Off', 2
where not exists (
  select 1 from public.competition_phase_types where code = 'KNOCKOUT'
);

do $$
declare
  template_uuid uuid;
  phase_type_uuid uuid;
begin
  select id into template_uuid from public.competition_templates
  where name = 'Fixture manual' and deleted_at is null limit 1;
  select id into phase_type_uuid from public.competition_phase_types
  where code = 'KNOCKOUT' limit 1;

  if template_uuid is not null and phase_type_uuid is not null and not exists (
    select 1 from public.competition_phases
    where template_id = template_uuid and name = 'Play Off' and deleted_at is null
  ) then
    insert into public.competition_phases (template_id, name, phase_type_id, display_order, is_elimination)
    values (template_uuid, 'Play Off', phase_type_uuid, 2, true);
  end if;
end;
$$;

-- Los filtros y el fixture son de consulta general dentro de la aplicación.
drop policy if exists fixture_authenticated_read_tournaments on public.tournaments;
create policy fixture_authenticated_read_tournaments on public.tournaments for select to authenticated using (true);
drop policy if exists fixture_authenticated_read_categories on public.categories;
create policy fixture_authenticated_read_categories on public.categories for select to authenticated using (true);
drop policy if exists fixture_authenticated_read_zones on public.zones;
create policy fixture_authenticated_read_zones on public.zones for select to authenticated using (true);
drop policy if exists fixture_authenticated_read_matchdays on public.matchdays;
create policy fixture_authenticated_read_matchdays on public.matchdays for select to authenticated using (true);
drop policy if exists fixture_authenticated_read_matches on public.matches;
create policy fixture_authenticated_read_matches on public.matches for select to authenticated using (true);
drop policy if exists fixture_authenticated_read_phases on public.competition_phases;
create policy fixture_authenticated_read_phases on public.competition_phases for select to authenticated using (true);
grant select on public.competition_phases to authenticated;
grant select on public.tournaments, public.categories, public.zones, public.matchdays, public.matches to authenticated;

-- Eliminar un torneo es una baja lógica en cascada de sus fechas y partidos.
create or replace function public.clean_deleted_tournament_fixture() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.deleted_at is null and new.deleted_at is not null then
    update public.matches match set deleted_at = new.deleted_at
    from public.matchdays day where match.matchday_id = day.id and day.tournament_id = new.id and match.deleted_at is null;
    update public.matchdays set deleted_at = new.deleted_at where tournament_id = new.id and deleted_at is null;
  end if;
  return new;
end;
$$;
drop trigger if exists on_tournament_deleted_clean_fixture on public.tournaments;
create trigger on_tournament_deleted_clean_fixture after update of deleted_at on public.tournaments
  for each row execute function public.clean_deleted_tournament_fixture();

-- Un torneo archivado mantiene su historial visible, pero no permite editar
-- partidos ni fechas hasta que sea reabierto por una futura función explícita.
create or replace function public.prevent_archived_tournament_fixture_change() returns trigger language plpgsql security definer set search_path = public as $$
declare tournament_uuid uuid;
begin
  if tg_table_name = 'matchdays' then
    if tg_op = 'DELETE' then
      tournament_uuid := old.tournament_id;
    else
      tournament_uuid := new.tournament_id;
    end if;
  else
    if tg_op = 'DELETE' then
      select tournament_id into tournament_uuid from public.matchdays where id = old.matchday_id;
    else
      select tournament_id into tournament_uuid from public.matchdays where id = new.matchday_id;
    end if;
  end if;
  if exists (select 1 from public.tournaments where id = tournament_uuid and archived_at is not null and deleted_at is null) then
    raise exception 'El torneo está archivado y no admite modificaciones.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
drop trigger if exists prevent_archived_matchday_changes on public.matchdays;
create trigger prevent_archived_matchday_changes before insert or update or delete on public.matchdays
  for each row execute function public.prevent_archived_tournament_fixture_change();
drop trigger if exists prevent_archived_match_changes on public.matches;
create trigger prevent_archived_match_changes before insert or update or delete on public.matches
  for each row execute function public.prevent_archived_tournament_fixture_change();

notify pgrst, 'reload schema';
