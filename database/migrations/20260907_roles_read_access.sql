-- El panel de SUPER_ADMIN necesita listar los roles disponibles para asignarlos.
-- La mutación sigue protegida por public.assign_profile_role(), que valida SUPER_ADMIN.
grant select on public.roles to authenticated;
