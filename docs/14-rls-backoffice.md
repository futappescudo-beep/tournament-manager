# Acceso al panel y RLS

La base tiene Row Level Security habilitado. Sin politicas, Supabase rechaza cualquier lectura desde la aplicacion con `permission denied`.

1. Ejecutar primero `database/migrations/20260810_profiles_roles.sql`.
2. Promover la cuenta de administracion a `SUPER_ADMIN` segun `docs/13-roles-setup.md`.
3. Ejecutar `database/migrations/20260810_backoffice_policies.sql` en SQL Editor.
4. Cerrar sesion e ingresar nuevamente.

Las politicas permiten acceder al panel a `SUPER_ADMIN`, `TOURNAMENT_ADMIN`, `TEAM_MANAGER` y `REFEREE`. Los usuarios `PLAYER` nacen con acceso minimo y no pueden leer ni modificar el padron completo de jugadores.

Por ahora, `TEAM_MANAGER` puede administrar datos del torneo. El siguiente endurecimiento sera restringirlo unicamente a los equipos donde figure como `team_manager_profile_id`.
