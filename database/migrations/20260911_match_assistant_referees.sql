-- Agrega asistentes al equipo arbitral de cada partido y confirma permisos
-- de escritura para administradores del torneo.

alter table public.matches
  add column if not exists assistant_referee_1_id uuid references public.referees(id) on delete set null,
  add column if not exists assistant_referee_2_id uuid references public.referees(id) on delete set null;

create index if not exists matches_assistant_referee_1_id_idx on public.matches (assistant_referee_1_id);
create index if not exists matches_assistant_referee_2_id_idx on public.matches (assistant_referee_2_id);

grant select, insert, update on public.matches to authenticated;

alter table public.matches enable row level security;

drop policy if exists manager_insert_matches on public.matches;
create policy manager_insert_matches on public.matches
  for insert to authenticated
  with check (public.can_manage_tournament());

drop policy if exists manager_update_matches on public.matches;
create policy manager_update_matches on public.matches
  for update to authenticated
  using (public.can_manage_tournament())
  with check (public.can_manage_tournament());
