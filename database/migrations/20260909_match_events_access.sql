-- Registro de goles y tarjetas desde el detalle de cada partido.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.match_events to authenticated;
grant select on public.event_types to authenticated;

alter table public.match_events enable row level security;
alter table public.event_types enable row level security;

drop policy if exists backoffice_read_match_events on public.match_events;
create policy backoffice_read_match_events on public.match_events
  for select to authenticated using (public.is_backoffice_user());

drop policy if exists manager_write_match_events on public.match_events;
create policy manager_write_match_events on public.match_events
  for all to authenticated
  using (public.can_manage_tournament())
  with check (public.can_manage_tournament());

drop policy if exists backoffice_read_event_types on public.event_types;
create policy backoffice_read_event_types on public.event_types
  for select to authenticated using (public.is_backoffice_user());

insert into public.event_types (code, name, display_order)
select 'GOAL', 'Gol', 1
where not exists (select 1 from public.event_types where code = 'GOAL');

insert into public.event_types (code, name, display_order)
select 'YELLOW_CARD', 'Tarjeta amarilla', 2
where not exists (select 1 from public.event_types where code = 'YELLOW_CARD');

insert into public.event_types (code, name, display_order)
select 'RED_CARD', 'Tarjeta roja', 3
where not exists (select 1 from public.event_types where code = 'RED_CARD');
