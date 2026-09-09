# Escudo Amistad

Aplicacion para administrar torneos de futbol. Esta entrega deja operativo el modulo de Equipos sobre el esquema actual de Supabase: equipos, categorias, zonas e inscripciones por categoria y zona.

## Puesta en marcha

1. Copiar `.env.example` a `.env.local`.
2. Completar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los datos del proyecto Supabase. No usar la clave `service_role`.
3. Ejecutar `pnpm install` y luego `pnpm dev`.

## Modulo Equipos

- Alta, edicion y baja logica de equipos (`deleted_at`).
- Datos compatibles con la tabla `teams`: responsable, telefono, correo, notas y estado activo.
- Varias inscripciones por equipo, sin repetir una combinacion categoria + zona en el formulario.
- Catalogos leidos desde `categories` y `zones` activos.

## Pendiente de Supabase

El archivo `lib/types/database.types.ts` pertenece a un esquema anterior y se excluyo de lint. Regenerarlo desde el proyecto real antes de emplearlo como tipado estricto, por ejemplo con `supabase gen types typescript --project-id <project-id> > lib/types/database.types.ts`.

La tabla `team_category_registrations` usa `registration_status_id`. El formulario confia en el valor por defecto configurado en la base; si no existe, debe definirse uno en Supabase o exponer el catalogo de estados en el formulario.
