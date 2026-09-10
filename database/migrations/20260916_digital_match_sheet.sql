-- Planilla digital móvil: estados, convocatoria precargada y constancias.
create table if not exists public.match_sheet_controls (
  match_id uuid primary key references public.matches(id) on delete cascade,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'OPEN', 'CLOSED')),
  created_by uuid not null references public.profiles(id),
  opened_by uuid references public.profiles(id), opened_at timestamptz,
  closed_by uuid references public.profiles(id), closed_at timestamptz,
  closing_observations text, updated_at timestamptz not null default now()
);

create table if not exists public.match_sheet_entries (
  id uuid primary key default gen_random_uuid(), match_id uuid not null references public.matches(id) on delete cascade,
  player_registration_id uuid not null references public.player_team_registrations(id),
  team_registration_id uuid not null references public.team_category_registrations(id),
  shirt_number integer, is_present boolean not null default false, notes text,
  updated_by uuid references public.profiles(id), updated_at timestamptz not null default now(),
  unique (match_id, player_registration_id)
);

create table if not exists public.match_sheet_confirmations (
  id uuid primary key default gen_random_uuid(), match_id uuid not null references public.matches(id) on delete cascade,
  team_registration_id uuid references public.team_category_registrations(id),
  confirmation_type text not null check (confirmation_type in ('REFEREE', 'HOME_DELEGATE', 'AWAY_DELEGATE')),
  profile_id uuid not null references public.profiles(id), declaration text not null,
  confirmed_at timestamptz not null default now(), unique (match_id, confirmation_type)
);

create or replace function public.is_tournament_administrator() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_code() in ('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), false);
$$;

create or replace function public.seed_match_sheet_entries() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.match_sheet_entries (match_id, player_registration_id, team_registration_id, shirt_number)
  select new.match_id, registration.id, registration.team_registration_id, registration.shirt_number
  from public.player_team_registrations registration
  join public.matches match on match.id = new.match_id
  where registration.deleted_at is null and registration.left_at is null
    and registration.team_registration_id in (match.home_team_registration_id, match.away_team_registration_id)
  on conflict (match_id, player_registration_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_match_sheet_created on public.match_sheet_controls;
create trigger on_match_sheet_created after insert on public.match_sheet_controls for each row execute function public.seed_match_sheet_entries();

create index if not exists match_sheet_entries_match_idx on public.match_sheet_entries(match_id);
create index if not exists match_sheet_confirmations_match_idx on public.match_sheet_confirmations(match_id);
grant select, insert, update on public.match_sheet_controls, public.match_sheet_entries, public.match_sheet_confirmations to authenticated;
alter table public.match_sheet_controls enable row level security;
alter table public.match_sheet_entries enable row level security;
alter table public.match_sheet_confirmations enable row level security;

drop policy if exists sheet_controls_read on public.match_sheet_controls;
create policy sheet_controls_read on public.match_sheet_controls for select to authenticated using (public.is_backoffice_user());
drop policy if exists sheet_controls_admin_write on public.match_sheet_controls;
drop policy if exists sheet_controls_admin_insert on public.match_sheet_controls;
drop policy if exists sheet_controls_admin_update on public.match_sheet_controls;
create policy sheet_controls_admin_insert on public.match_sheet_controls for insert to authenticated with check (public.is_tournament_administrator());
create policy sheet_controls_admin_update on public.match_sheet_controls for update to authenticated using (public.is_tournament_administrator()) with check (public.is_tournament_administrator());

drop policy if exists sheet_entries_read on public.match_sheet_entries;
create policy sheet_entries_read on public.match_sheet_entries for select to authenticated using (public.is_backoffice_user());
drop policy if exists sheet_entries_admin_or_open_referee_write on public.match_sheet_entries;
create policy sheet_entries_admin_or_open_referee_write on public.match_sheet_entries for update to authenticated
using (public.is_tournament_administrator() or (public.current_role_code() = 'REFEREE' and exists (select 1 from public.match_sheet_controls control where control.match_id = match_sheet_entries.match_id and control.status = 'OPEN')))
with check (public.is_tournament_administrator() or (public.current_role_code() = 'REFEREE' and exists (select 1 from public.match_sheet_controls control where control.match_id = match_sheet_entries.match_id and control.status = 'OPEN')));

drop policy if exists sheet_confirmations_read on public.match_sheet_confirmations;
create policy sheet_confirmations_read on public.match_sheet_confirmations for select to authenticated using (public.is_backoffice_user());
drop policy if exists sheet_confirmations_open_referee_or_admin_insert on public.match_sheet_confirmations;
create policy sheet_confirmations_open_referee_or_admin_insert on public.match_sheet_confirmations for insert to authenticated
with check (public.is_tournament_administrator() or (public.current_role_code() = 'REFEREE' and exists (select 1 from public.match_sheet_controls control where control.match_id = match_sheet_confirmations.match_id and control.status = 'OPEN')));

notify pgrst, 'reload schema';
