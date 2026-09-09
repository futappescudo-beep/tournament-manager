-- El catálogo de roles puede ser leído por usuarios autenticados.
-- Cambiar asignaciones sigue protegido por public.assign_profile_role(),
-- que exige que el usuario actual sea SUPER_ADMIN.
alter table public.roles enable row level security;

drop policy if exists roles_read_authenticated on public.roles;
create policy roles_read_authenticated
on public.roles
for select
to authenticated
using (true);

grant select on public.roles to authenticated;
