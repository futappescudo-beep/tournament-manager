# Acceso al panel y RLS

La base tiene Row Level Security habilitado. Sin politicas, Supabase rechaza cualquier lectura desde la aplicacion con `permission denied`.

1. Ejecutar primero `database/migrations/20260810_profiles_roles.sql` y `20260907_seed_standard_roles.sql`.
2. Promover la cuenta de administracion a `SUPER_ADMIN` segun `docs/13-roles-setup.md`.
3. Ejecutar `database/migrations/20260810_backoffice_policies.sql` en SQL Editor.
4. Ejecutar el resto de `database/migrations` en orden, incluidas las de fixture, recursos, asistentes y vistas.
5. Cerrar sesión e ingresar nuevamente.

Las políticas permiten acceder al panel a `SUPER_ADMIN`, `TOURNAMENT_ADMIN`, `TEAM_MANAGER` y `REFEREE`. Los usuarios `PLAYER` nacen con acceso mínimo y no pueden leer ni modificar el padrón completo de jugadores.

Limitaciones conocidas:

* `TEAM_MANAGER` todavía puede administrar datos amplios de equipos y planteles por la política `can_manage_tournament()`.
* La cuenta `REFEREE` es compartida por decisión operativa. La identidad del árbitro o veedor físico debe quedar registrada en la designación del partido y verificarse en la prueba de aceptación.
* La interfaz no debe considerarse una barrera de seguridad: la restricción debe residir en RLS y en las acciones de servidor.
