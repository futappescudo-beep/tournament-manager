-- Simulación: cinco equipos inscritos en la primera categoría/zona disponible.
-- Ejecutar después de crear al menos un torneo, una categoría y una zona desde Configuración.
do $$
declare
  target_category uuid;
  target_zone uuid;
  team_name text;
  team_uuid uuid;
begin
  select c.id, z.id into target_category, target_zone
  from public.categories c
  join public.zones z on z.category_id = c.id
  where c.active = true and c.deleted_at is null and z.deleted_at is null
  order by c.display_order, z.display_order
  limit 1;

  if target_category is null or target_zone is null then
    raise exception 'Primero creá una categoría y una zona desde Configuración.';
  end if;

  foreach team_name in array array['Atlético Amistad', 'Deportivo Central', 'Los Pibes FC', 'Náutico FC', 'Unión del Sur']
  loop
    select id into team_uuid from public.teams where name = team_name and deleted_at is null limit 1;
    if team_uuid is null then
      insert into public.teams (name, short_name, active)
      values (team_name, left(upper(replace(team_name, ' ', '')), 12), true)
      returning id into team_uuid;
    end if;

    if not exists (
      select 1 from public.team_category_registrations
      where team_id = team_uuid and category_id = target_category and zone_id = target_zone and deleted_at is null
    ) then
      insert into public.team_category_registrations (team_id, category_id, zone_id, display_name)
      values (team_uuid, target_category, target_zone, team_name);
    end if;
  end loop;
end $$;
