-- Permite a los administradores crear fechas y partidos manuales desde el panel.
-- Ejecutar en Supabase SQL Editor despues de las migraciones de roles y backoffice.

grant usage on schema public to authenticated;
grant select on public.competition_templates, public.competition_phases,
  public.competition_phase_types, public.match_statuses, public.matchdays,
  public.fields, public.referees to authenticated;
grant insert, update, delete on public.matchdays to authenticated;

alter table public.competition_templates enable row level security;
alter table public.competition_phases enable row level security;
alter table public.competition_phase_types enable row level security;
alter table public.match_statuses enable row level security;
alter table public.matchdays enable row level security;

-- Catálogos mínimos para que el primer fixture manual sea utilizable en una
-- instalación nueva. No duplica registros si ya fueron cargados.
insert into public.competition_phase_types (code, name, display_order)
select 'LEAGUE', 'Fase regular', 1
where not exists (
  select 1 from public.competition_phase_types where code = 'LEAGUE'
);

insert into public.match_statuses (code, name, display_order)
select 'SCHEDULED', 'Programado', 1
where not exists (
  select 1 from public.match_statuses where code = 'SCHEDULED'
);

do $$
declare
  template_uuid uuid;
  phase_type_uuid uuid;
begin
  select id into phase_type_uuid
  from public.competition_phase_types
  where code = 'LEAGUE'
  limit 1;

  select id into template_uuid
  from public.competition_templates
  where name = 'Fixture manual'
    and deleted_at is null
  limit 1;

  if template_uuid is null then
    insert into public.competition_templates (name, description, total_teams, total_groups, active)
    values ('Fixture manual', 'Configuración base para cargar partidos manualmente', 2, 1, true)
    returning id into template_uuid;
  end if;

  if not exists (
    select 1 from public.competition_phases
    where template_id = template_uuid
      and name = 'Fase regular'
      and deleted_at is null
  ) then
    insert into public.competition_phases (template_id, name, phase_type_id, display_order, is_elimination)
    values (template_uuid, 'Fase regular', phase_type_uuid, 1, false);
  end if;
end $$;

drop policy if exists backoffice_read_competition_templates on public.competition_templates;
create policy backoffice_read_competition_templates on public.competition_templates
  for select to authenticated using (public.is_backoffice_user());

drop policy if exists backoffice_read_competition_phases on public.competition_phases;
create policy backoffice_read_competition_phases on public.competition_phases
  for select to authenticated using (public.is_backoffice_user());

drop policy if exists backoffice_read_competition_phase_types on public.competition_phase_types;
create policy backoffice_read_competition_phase_types on public.competition_phase_types
  for select to authenticated using (public.is_backoffice_user());

drop policy if exists backoffice_read_match_statuses on public.match_statuses;
create policy backoffice_read_match_statuses on public.match_statuses
  for select to authenticated using (public.is_backoffice_user());

drop policy if exists manager_write_matchdays on public.matchdays;
create policy manager_write_matchdays on public.matchdays
  for all to authenticated
  using (public.can_manage_tournament())
  with check (public.can_manage_tournament());
