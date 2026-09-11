-- Relaciona cada llave de playoff con su partido del fixture y con la llave
-- de la que proviene el ganador. Así el cuadro puede avanzar automáticamente.
alter table public.playoff_bracket_matches
  add column if not exists fixture_match_id uuid references public.matches(id) on delete set null,
  add column if not exists winner_team_registration_id uuid references public.team_category_registrations(id) on delete set null,
  add column if not exists home_source_match_id uuid references public.playoff_bracket_matches(id) on delete set null,
  add column if not exists away_source_match_id uuid references public.playoff_bracket_matches(id) on delete set null;

create unique index if not exists playoff_bracket_matches_fixture_match_unique
  on public.playoff_bracket_matches(fixture_match_id) where fixture_match_id is not null;
create index if not exists playoff_bracket_matches_home_source_idx on public.playoff_bracket_matches(home_source_match_id);
create index if not exists playoff_bracket_matches_away_source_idx on public.playoff_bracket_matches(away_source_match_id);

-- El cuadro es de consulta general como el fixture; las escrituras conservan
-- la política de administrador configurada por la migración anterior.
drop policy if exists playoff_brackets_authenticated_read on public.playoff_brackets;
create policy playoff_brackets_authenticated_read on public.playoff_brackets
  for select to authenticated using (true);
drop policy if exists playoff_bracket_matches_authenticated_read on public.playoff_bracket_matches;
create policy playoff_bracket_matches_authenticated_read on public.playoff_bracket_matches
  for select to authenticated using (true);

notify pgrst, 'reload schema';
