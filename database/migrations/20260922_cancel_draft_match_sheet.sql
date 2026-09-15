-- Permite a la administración cancelar una planilla todavía preliminar.
-- Solo borra la convocatoria precargada y el control DRAFT; una planilla abierta o cerrada conserva su trazabilidad.
grant delete on public.match_sheet_controls, public.match_sheet_entries to authenticated;

drop policy if exists sheet_controls_admin_delete_draft on public.match_sheet_controls;
create policy sheet_controls_admin_delete_draft on public.match_sheet_controls for delete to authenticated
using (public.is_tournament_administrator() and status = 'DRAFT');

drop policy if exists sheet_entries_admin_delete_draft on public.match_sheet_entries;
create policy sheet_entries_admin_delete_draft on public.match_sheet_entries for delete to authenticated
using (
  public.is_tournament_administrator()
  and exists (
    select 1 from public.match_sheet_controls control
    where control.match_id = match_sheet_entries.match_id and control.status = 'DRAFT'
  )
);

notify pgrst, 'reload schema';
