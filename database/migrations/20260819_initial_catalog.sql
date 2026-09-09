-- Configuración inicial. Cambiá los nombres por los de tu torneo antes de ejecutarlo.
do $$
declare
  tournament_uuid uuid;
  libre_uuid uuid;
  juvenil_uuid uuid;
begin
  select id into tournament_uuid from public.tournaments where deleted_at is null order by created_at limit 1;
  if tournament_uuid is null then
    insert into public.tournaments (name, season, description)
    values ('Escudo Amistad', '2026', 'Torneo de fútbol')
    returning id into tournament_uuid;
  end if;

  select id into libre_uuid from public.categories where tournament_id = tournament_uuid and name = 'Libre' and deleted_at is null;
  if libre_uuid is null then
    insert into public.categories (tournament_id, name, display_order) values (tournament_uuid, 'Libre', 1) returning id into libre_uuid;
  end if;

  select id into juvenil_uuid from public.categories where tournament_id = tournament_uuid and name = 'Juvenil' and deleted_at is null;
  if juvenil_uuid is null then
    insert into public.categories (tournament_id, name, display_order) values (tournament_uuid, 'Juvenil', 2) returning id into juvenil_uuid;
  end if;

  if not exists (select 1 from public.zones where category_id = libre_uuid and name = 'Zona A' and deleted_at is null) then
    insert into public.zones (category_id, name, display_order) values (libre_uuid, 'Zona A', 1);
  end if;
  if not exists (select 1 from public.zones where category_id = juvenil_uuid and name = 'Zona A' and deleted_at is null) then
    insert into public.zones (category_id, name, display_order) values (juvenil_uuid, 'Zona A', 1);
  end if;
end $$;
