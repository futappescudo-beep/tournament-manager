-- Modelo real: profiles.role_id -> roles.id.
-- Los usuarios nuevos reciben el rol PLAYER por defecto.

insert into public.roles (code, name, description, display_order)
select 'PLAYER', 'Jugador', 'Acceso basico para usuarios registrados', 5
where not exists (
  select 1 from public.roles where code = 'PLAYER'
);

-- Completa perfiles faltantes de usuarios que ya existian antes del trigger.
insert into public.profiles (id, role_id, first_name, last_name, active)
select
  auth_user.id,
  player_role.id,
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'first_name', ''), nullif(split_part(auth_user.email, '@', 1), ''), 'Jugador'),
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'last_name', ''), 'Sin apellido'),
  true
from auth.users auth_user
cross join public.roles player_role
where player_role.code = 'PLAYER'
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  player_role_id uuid;
  first_name_value text;
  last_name_value text;
begin
  select id into player_role_id from public.roles where code = 'PLAYER';
  if player_role_id is null then
    raise exception 'No existe el rol PLAYER';
  end if;

  first_name_value := coalesce(
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'Jugador'
  );
  last_name_value := coalesce(
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    'Sin apellido'
  );

  insert into public.profiles (id, role_id, first_name, last_name, active)
  values (new.id, player_role_id, first_name_value, last_name_value, true)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.profiles profile
    join public.roles role on role.id = profile.role_id
    where profile.id = auth.uid()
      and profile.active = true
      and role.code = 'SUPER_ADMIN'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_self_or_super_admin on public.profiles;
create policy profiles_select_self_or_super_admin
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_super_admin());

drop policy if exists profiles_update_super_admin on public.profiles;
create policy profiles_update_super_admin
on public.profiles for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create or replace function public.assign_profile_role(target_user_id uuid, new_role_code text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  target_role_id uuid;
begin
  if not public.is_super_admin() then
    raise exception 'Solo un SUPER_ADMIN puede asignar roles';
  end if;

  select id into target_role_id
  from public.roles
  where code = upper(trim(new_role_code));

  if target_role_id is null then
    raise exception 'Rol inexistente: %', new_role_code;
  end if;

  update public.profiles
  set role_id = target_role_id, updated_at = now()
  where id = target_user_id;

  if not found then
    raise exception 'Perfil no encontrado';
  end if;
end;
$$;
