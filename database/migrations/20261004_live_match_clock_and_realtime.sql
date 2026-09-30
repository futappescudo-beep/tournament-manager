-- Cronómetro persistente y máximo de dos partidos en juego por torneo.
alter table public.match_sheet_controls
  add column if not exists clock_status text not null default 'NOT_STARTED'
    check (clock_status in ('NOT_STARTED', 'RUNNING', 'PAUSED', 'FINISHED')),
  add column if not exists clock_started_at timestamptz,
  add column if not exists clock_elapsed_seconds integer not null default 0
    check (clock_elapsed_seconds >= 0);

create or replace function public.enforce_two_running_match_clocks()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_tournament_id uuid;
  running_count integer;
begin
  if new.clock_status <> 'RUNNING' then
    return new;
  end if;

  select matchday.tournament_id into current_tournament_id
  from public.matches match
  join public.matchdays matchday on matchday.id = match.matchday_id
  where match.id = new.match_id;

  if current_tournament_id is null then
    raise exception 'No se pudo identificar el torneo del partido.';
  end if;

  select count(*) into running_count
  from public.match_sheet_controls control
  join public.matches match on match.id = control.match_id
  join public.matchdays matchday on matchday.id = match.matchday_id
  where matchday.tournament_id = current_tournament_id
    and control.clock_status = 'RUNNING'
    and control.match_id <> new.match_id;

  if running_count >= 2 then
    raise exception 'Este torneo ya tiene dos partidos en juego. Pausá o finalizá uno antes de iniciar otro.' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_two_running_match_clocks on public.match_sheet_controls;
create trigger enforce_two_running_match_clocks
  before insert or update of clock_status on public.match_sheet_controls
  for each row execute function public.enforce_two_running_match_clocks();

-- Actualización inmediata para planilla, fixture, resultados y dashboard.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches') then
      alter publication supabase_realtime add table public.matches;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'match_sheet_controls') then
      alter publication supabase_realtime add table public.match_sheet_controls;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'match_events') then
      alter publication supabase_realtime add table public.match_events;
    end if;
  end if;
end;
$$;

notify pgrst, 'reload schema';
