# Acceso al panel y RLS

La base tiene Row Level Security habilitado. Sin politicas, Supabase rechaza cualquier lectura desde la aplicacion con `permission denied`.

1. Ejecutar primero `database/migrations/20260810_profiles_roles.sql` y `20260907_seed_standard_roles.sql`.
2. Promover la cuenta de administracion a `SUPER_ADMIN` segun `docs/13-roles-setup.md`.
3. Ejecutar `database/migrations/20260810_backoffice_policies.sql` en SQL Editor.
4. Ejecutar el resto de `database/migrations` en orden, incluidas las de fixture, recursos, asistentes y vistas.
5. Cerrar sesión e ingresar nuevamente.

Las politicas permiten acceder al panel a `SUPER_ADMIN`, `TOURNAMENT_ADMIN`, `TEAM_MANAGER` y `REFEREE`. Los usuarios `PLAYER` nacen con acceso minimo y no pueden leer ni modificar el padron completo de jugadores.

Limitación conocida: `TEAM_MANAGER` todavía puede administrar datos amplios del torneo. Falta restringirlo a los equipos donde sea responsable y restringir al `REFEREE` a sus partidos asignados.
