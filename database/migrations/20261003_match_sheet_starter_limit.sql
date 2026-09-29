-- Límite de titulares por equipo y partido. No hay mínimo obligatorio.
create or replace function public.enforce_match_sheet_starter_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_starter and not exists (
    select 1
    from public.match_sheet_entries current_entry
    where current_entry.match_id = new.match_id
      and current_entry.team_registration_id = new.team_registration_id
      and current_entry.player_registration_id = new.player_registration_id
      and current_entry.is_starter
  ) then
    if (
      select count(*)
      from public.match_sheet_entries entry
      where entry.match_id = new.match_id
        and entry.team_registration_id = new.team_registration_id
        and entry.is_starter
        and entry.player_registration_id <> new.player_registration_id
    ) >= 11 then
      raise exception 'Cada equipo puede tener como máximo 11 titulares en la planilla.' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_match_sheet_starter_limit on public.match_sheet_entries;
create trigger enforce_match_sheet_starter_limit
  before insert or update of is_starter, team_registration_id on public.match_sheet_entries
  for each row execute function public.enforce_match_sheet_starter_limit();

notify pgrst, 'reload schema';
