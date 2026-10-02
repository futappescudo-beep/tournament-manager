-- Sincroniza el marcador con los eventos de gol y formaliza el cierre de planilla
-- por árbitro como contingencia. Los puntos se contabilizan únicamente al finalizar.

insert into public.match_statuses (code, name, display_order)
select 'PLAYED', 'Jugado', 2
where not exists (select 1 from public.match_statuses where code = 'PLAYED');

create or replace function public.sync_match_score_from_events(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.matches match
  set
    home_score = (
      select count(*)::integer
      from public.match_events event
      join public.event_types event_type on event_type.id = event.event_type_id
      where event.match_id = target_match_id
        and event.team_registration_id = match.home_team_registration_id
        and event_type.code = 'GOAL'
    ),
    away_score = (
      select count(*)::integer
      from public.match_events event
      join public.event_types event_type on event_type.id = event.event_type_id
      where event.match_id = target_match_id
        and event.team_registration_id = match.away_team_registration_id
        and event_type.code = 'GOAL'
    )
  where match.id = target_match_id
    and match.deleted_at is null;
end;
$$;

create or replace function public.sync_match_score_after_event_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_match_score_from_events(old.match_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.match_id is distinct from new.match_id then
    perform public.sync_match_score_from_events(old.match_id);
  end if;

  perform public.sync_match_score_from_events(new.match_id);
  return new;
end;
$$;

drop trigger if exists sync_match_score_after_event_change on public.match_events;
create trigger sync_match_score_after_event_change
after insert or update or delete on public.match_events
for each row execute function public.sync_match_score_after_event_change();

-- Recupera también los goles ya cargados antes de instalar esta migración.
do $$
declare
  current_match_id uuid;
begin
  for current_match_id in select distinct match_id from public.match_events loop
    perform public.sync_match_score_from_events(current_match_id);
  end loop;
end;
$$;

create or replace function public.mark_match_played_after_sheet_finalization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  played_status_id uuid;
begin
  if new.match_finished_at is not null and old.match_finished_at is null then
    perform public.sync_match_score_from_events(new.match_id);
    select id into played_status_id from public.match_statuses where code = 'PLAYED' limit 1;
    update public.matches
    set match_status_id = played_status_id
    where id = new.match_id and deleted_at is null;
  end if;
  return new;
end;
$$;

drop trigger if exists mark_match_played_after_sheet_finalization on public.match_sheet_controls;
create trigger mark_match_played_after_sheet_finalization
after update of match_finished_at on public.match_sheet_controls
for each row execute function public.mark_match_played_after_sheet_finalization();

drop policy if exists sheet_controls_open_referee_update on public.match_sheet_controls;
drop policy if exists sheet_controls_referee_finish_or_close_update on public.match_sheet_controls;
create policy sheet_controls_referee_finish_or_close_update on public.match_sheet_controls
  for update to authenticated
  using (
    public.current_role_code() = 'REFEREE'
    and status = 'OPEN'
  )
  with check (
    public.current_role_code() = 'REFEREE'
    and (
      (status = 'OPEN' and match_finished_at is not null)
      or (status = 'CLOSED' and match_finished_at is not null)
    )
  );

notify pgrst, 'reload schema';
