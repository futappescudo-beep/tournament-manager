-- Corrige el permiso de escritura de la cuenta arbitral.
-- Un upsert de convocatoria requiere política INSERT incluso si la fila ya fue precargada.

drop policy if exists sheet_entries_admin_or_open_referee_write on public.match_sheet_entries;
drop policy if exists sheet_entries_open_editor_insert on public.match_sheet_entries;
drop policy if exists sheet_entries_open_editor_update on public.match_sheet_entries;

create policy sheet_entries_open_editor_insert on public.match_sheet_entries
  for insert to authenticated
  with check (
    exists (
      select 1 from public.match_sheet_controls control
      where control.match_id = match_sheet_entries.match_id
        and control.status = 'OPEN'
        and control.match_finished_at is null
    )
    and (public.is_tournament_administrator() or public.current_role_code() = 'REFEREE')
  );

create policy sheet_entries_open_editor_update on public.match_sheet_entries
  for update to authenticated
  using (
    exists (
      select 1 from public.match_sheet_controls control
      where control.match_id = match_sheet_entries.match_id
        and control.status = 'OPEN'
        and control.match_finished_at is null
    )
    and (public.is_tournament_administrator() or public.current_role_code() = 'REFEREE')
  )
  with check (
    exists (
      select 1 from public.match_sheet_controls control
      where control.match_id = match_sheet_entries.match_id
        and control.status = 'OPEN'
        and control.match_finished_at is null
    )
    and (public.is_tournament_administrator() or public.current_role_code() = 'REFEREE')
  );

-- Políticas separadas para que INSERT y UPDATE de eventos sean inequívocos en PostgREST.
drop policy if exists match_events_open_sheet_write on public.match_events;
drop policy if exists match_events_open_editor_insert on public.match_events;
drop policy if exists match_events_open_editor_update on public.match_events;

create policy match_events_open_editor_insert on public.match_events
  for insert to authenticated
  with check (
    exists (
      select 1 from public.match_sheet_controls control
      where control.match_id = match_events.match_id
        and control.status = 'OPEN'
        and control.match_finished_at is null
    )
    and (public.is_tournament_administrator() or public.current_role_code() = 'REFEREE')
  );

create policy match_events_open_editor_update on public.match_events
  for update to authenticated
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

notify pgrst, 'reload schema';
