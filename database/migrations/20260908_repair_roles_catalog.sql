-- Ejecutar en el SQL Editor del proyecto Supabase usado por la aplicación.
-- Restaura permisos del catálogo y garantiza los cinco roles operativos.
grant select on public.roles to authenticated;
grant select, insert, update, delete on public.roles to service_role;

insert into public.roles (code, name, description, display_order)
select 'SUPER_ADMIN', 'Super administrador', 'Acceso total y gestión de roles', 1
where not exists (select 1 from public.roles where code = 'SUPER_ADMIN');

insert into public.roles (code, name, description, display_order)
select 'TOURNAMENT_ADMIN', 'Administrador del torneo', 'Administración operativa del torneo', 2
where not exists (select 1 from public.roles where code = 'TOURNAMENT_ADMIN');

insert into public.roles (code, name, description, display_order)
select 'TEAM_MANAGER', 'Delegado de equipo', 'Gestión de equipos y planteles', 3
where not exists (select 1 from public.roles where code = 'TEAM_MANAGER');

insert into public.roles (code, name, description, display_order)
select 'REFEREE', 'Árbitro', 'Consulta y carga de información deportiva', 4
where not exists (select 1 from public.roles where code = 'REFEREE');

insert into public.roles (code, name, description, display_order)
select 'PLAYER', 'Jugador', 'Acceso básico para usuarios registrados', 5
where not exists (select 1 from public.roles where code = 'PLAYER');

select code, name, display_order
from public.roles
order by display_order;
