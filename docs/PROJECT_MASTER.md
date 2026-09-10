# PROJECT_MASTER

## Proyecto y fuente de verdad

**Tournament Manager** administra torneos de fútbol amateur. El estado verificable al 10/09/2026 está en [00-current-status.md](00-current-status.md); este documento define el alcance vigente.

## Alcance entregado

* Autenticación Supabase, recuperación de contraseña y roles.
* Catálogo de torneos, categorías y zonas A–E; cupos, canchas y árbitros.
* Equipos, baja lógica, logos, inscripciones y lista de buena fe por categoría/zona.
* Jugadores con DNI, fecha de nacimiento, foto y asignación al mismo equipo en distintas zonas.
* Fixture manual por torneo → categoría → zona → fecha, con cancha y terna arbitral.
* Resultados, eventos, goleadores, sanciones, tabla y dashboard filtrable.
* Consulta pública de fixture y posiciones.

## Pendiente de producto

Planillas adjuntas, fixture automático, ABM de pagos, notificaciones, PWA efectiva, multi-organización, temporadas operativas y firma digital.

## Stack real

* Next.js 16.2.10 (App Router)
* TypeScript (strict)
* Tailwind CSS
* shadcn/ui
* Supabase (Auth + PostgreSQL + Storage)
* Vercel para despliegue

## Principios

* Mobile-first
* Server Actions
* Validación con Zod
* No usar `any`
* No lógica de negocio en componentes UI; servicios y Server Actions en `lib/`.
* Las migraciones se ejecutan manualmente en Supabase y son parte del release.

La documentación describe el alcance; el código, las migraciones y el estado de Supabase determinan la capacidad efectiva.
