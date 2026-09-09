-- RLS en profiles conserva la restricción: cada usuario ve su perfil y
-- SUPER_ADMIN puede ver todos. Este GRANT habilita la lectura que la política permite.
grant select on public.profiles to authenticated;
