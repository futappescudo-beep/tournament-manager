-- Planilla móvil: jugadores identificables, cierre operativo y conformidades ordenadas.

alter table public.match_sheet_entries
  add column if not exists is_starter boolean not null default false;

alter table public.match_sheet_controls
  add column if not exists match_finished_at timestamptz,
  add column if not exists match_finished_by uuid references public.profiles(id);

alter table public.match_sheet_confirmations
  add column if not exists comments text;

alter table public.match_sheet_confirmations
  drop constraint if exists match_sheet_confirmations_comments_length_check;
alter table public.match_sheet_confirmations
  add constraint match_sheet_confirmations_comments_length_check
  check (comments is null or char_length(comments) <= 600);

-- Eventos: el árbitro compartido puede registrar y corregir mientras el partido esté abierto
-- y no haya sido marcado como finalizado. La misma regla protege a los administradores.
drop policy if exists manager_write_match_events on public.match_events;
drop policy if exists match_events_open_sheet_write on public.match_events;
create policy match_events_open_sheet_write on public.match_events
  for all to authenticated
  using (
    exists (
      select 1 from public.match_sheet_controls control
      where control.match_id = match_events.match_id
        and control.status = 'OPEN'
        and control.match_finished_at is null
    )
    and (public.is_tournament_administrator() or public.current_role_code() = 'REFEREE')
  )
  with check (
    exists (
      select 1 from public.match_sheet_controls control
      where control.match_id = match_events.match_id
        and control.status = 'OPEN'
        and control.match_finished_at is null
    )
    and (public.is_tournament_administrator() or public.current_role_code() = 'REFEREE')
  );

-- El árbitro puede marcar el fin operativo. El backend sólo actualiza las columnas de cierre.
drop policy if exists sheet_controls_open_referee_update on public.match_sheet_controls;
create policy sheet_controls_open_referee_update on public.match_sheet_controls
  for update to authenticated
  using (
    public.current_role_code() = 'REFEREE'
    and status = 'OPEN'
    and match_finished_at is null
  )
  with check (public.current_role_code() = 'REFEREE');

-- Las firmas son consecutivas: partido finalizado, delegados, árbitro y finalmente veedor.
drop policy if exists sheet_confirmations_open_referee_admin_or_delegate_insert on public.match_sheet_confirmations;
drop policy if exists sheet_confirmations_ordered_insert on public.match_sheet_confirmations;
create policy sheet_confirmations_ordered_insert on public.match_sheet_confirmations
  for insert to authenticated
  with check (
    exists (
      select 1 from public.match_sheet_controls control
      where control.match_id = match_sheet_confirmations.match_id
        and control.status = 'OPEN'
        and control.match_finished_at is not null
    )
    and (
      (
        confirmation_type in ('HOME_DELEGATE', 'AWAY_DELEGATE')
        and (public.is_tournament_administrator() or public.can_confirm_match_as_delegate(match_id, confirmation_type))
      )
      or (
        confirmation_type = 'REFEREE'
        and (public.is_tournament_administrator() or public.current_role_code() = 'REFEREE')
        and exists (select 1 from public.match_sheet_confirmations home where home.match_id = match_sheet_confirmations.match_id and home.confirmation_type = 'HOME_DELEGATE')
        and exists (select 1 from public.match_sheet_confirmations away where away.match_id = match_sheet_confirmations.match_id and away.confirmation_type = 'AWAY_DELEGATE')
      )
      or (
        confirmation_type = 'SUPERVISOR'
        and (public.is_tournament_administrator() or public.current_role_code() = 'REFEREE')
        and exists (select 1 from public.match_sheet_confirmations home where home.match_id = match_sheet_confirmations.match_id and home.confirmation_type = 'HOME_DELEGATE')
        and exists (select 1 from public.match_sheet_confirmations away where away.match_id = match_sheet_confirmations.match_id and away.confirmation_type = 'AWAY_DELEGATE')
        and exists (select 1 from public.match_sheet_confirmations referee where referee.match_id = match_sheet_confirmations.match_id and referee.confirmation_type = 'REFEREE')
      )
    )
  );

notify pgrst, 'reload schema';
