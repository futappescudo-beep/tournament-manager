-- Cuadros de playoff configurables. Los cruces se guardan como un borrador
-- independiente de los partidos para admitir pases directos y rivales aún no
-- definidos (por ejemplo: el ganador de un repechaje).
create table if not exists public.playoff_brackets (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id),
  category_id uuid not null references public.categories(id),
  name text not null,
  trophy text not null default 'GOLD' check (trophy in ('GOLD', 'SILVER', 'CUSTOM')),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'CONFIRMED', 'COMPLETED')),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playoff_bracket_matches (
  id uuid primary key default gen_random_uuid(),
  bracket_id uuid not null references public.playoff_brackets(id) on delete cascade,
  stage_name text not null,
  match_order integer not null check (match_order > 0),
  home_team_registration_id uuid references public.team_category_registrations(id),
  away_team_registration_id uuid references public.team_category_registrations(id),
  home_source_label text,
  away_source_label text,
  is_neutral_venue boolean not null default false,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  unique (bracket_id, match_order),
  check (home_team_registration_id is not null or nullif(trim(home_source_label), '') is not null),
  check (away_team_registration_id is not null or nullif(trim(away_source_label), '') is not null),
  check (home_team_registration_id is null or away_team_registration_id is null or home_team_registration_id <> away_team_registration_id)
);

create index if not exists playoff_brackets_scope_idx on public.playoff_brackets(tournament_id, category_id);
create index if not exists playoff_bracket_matches_bracket_idx on public.playoff_bracket_matches(bracket_id, match_order);

grant select, insert, update, delete on public.playoff_brackets, public.playoff_bracket_matches to authenticated;
alter table public.playoff_brackets enable row level security;
alter table public.playoff_bracket_matches enable row level security;

drop policy if exists playoff_brackets_backoffice_read on public.playoff_brackets;
create policy playoff_brackets_backoffice_read on public.playoff_brackets for select to authenticated
  using (public.is_backoffice_user());
drop policy if exists playoff_brackets_admin_write on public.playoff_brackets;
create policy playoff_brackets_admin_write on public.playoff_brackets for all to authenticated
  using (public.is_tournament_administrator()) with check (public.is_tournament_administrator());

drop policy if exists playoff_bracket_matches_backoffice_read on public.playoff_bracket_matches;
create policy playoff_bracket_matches_backoffice_read on public.playoff_bracket_matches for select to authenticated
  using (public.is_backoffice_user());
drop policy if exists playoff_bracket_matches_admin_write on public.playoff_bracket_matches;
create policy playoff_bracket_matches_admin_write on public.playoff_bracket_matches for all to authenticated
  using (public.is_tournament_administrator()) with check (public.is_tournament_administrator());

notify pgrst, 'reload schema';
