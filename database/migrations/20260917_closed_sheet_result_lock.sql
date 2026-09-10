-- Una planilla cerrada inmoviliza el partido. Solo un administrador puede
-- reabrirla; mientras permanezca cerrada nadie puede modificar el resultado.
drop policy if exists manager_write_matches on public.matches;
drop policy if exists admin_write_matches on public.matches;
create policy admin_write_matches on public.matches for all to authenticated
using (public.is_tournament_administrator())
with check (public.is_tournament_administrator());

notify pgrst, 'reload schema';
