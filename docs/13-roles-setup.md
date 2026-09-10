# Configuracion de roles

## Arquitectura real

`profiles` no tiene una columna `role`. Su campo `role_id` referencia a la tabla `roles`.

Roles disponibles despues de aplicar la migracion:

- `SUPER_ADMIN`: acceso total y asignacion de roles.
- `TOURNAMENT_ADMIN`: administra el torneo.
- `REFEREE`: carga resultados y planillas.
- `TEAM_MANAGER`: delegado de equipo.
- `PLAYER`: rol minimo para todo usuario nuevo.

## Aplicar la migracion

1. En Supabase abrir **SQL Editor**.
2. Ejecutar `database/migrations/20260810_profiles_roles.sql` y luego `20260907_seed_standard_roles.sql`.
3. Ejecutar las migraciones posteriores en orden cronológico.
4. Todo registro nuevo creara una fila en `profiles` con el rol `PLAYER`.

## Promover el primer administrador

Reemplazar el email y ejecutar en SQL Editor:

```sql
update public.profiles profile
set role_id = role.id
from public.roles role
where profile.id = (select id from auth.users where email = 'tu-email@ejemplo.com')
  and role.code = 'SUPER_ADMIN';
```

## Asignar roles después

Ingresando como `SUPER_ADMIN`, ejecutar:

```sql
select public.assign_profile_role(
  (select id from auth.users where email = 'organizador@ejemplo.com'),
  'TOURNAMENT_ADMIN'
);
```

Para borrar usuarios desde Configuración se requiere `SUPABASE_SERVICE_ROLE_KEY` únicamente en el entorno servidor de Vercel; nunca debe exponerse como variable `NEXT_PUBLIC_*`.
