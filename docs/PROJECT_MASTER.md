# PROJECT_MASTER

## Proyecto y fuente de verdad

**Tournament Manager** administra torneos de fútbol amateur. El estado verificable al 15/09/2026 está en [00-current-status.md](00-current-status.md); el contraste funcional completo está en [16-scope-audit-20260915.md](16-scope-audit-20260915.md).

## Alcance entregado

* Autenticación Supabase, recuperación de contraseña y roles.
* Catálogo de torneos, categorías y zonas A–E; cupos, canchas y árbitros.
* Equipos, baja lógica, logos, inscripciones y lista de buena fe por categoría/zona.
* Jugadores con DNI, fecha de nacimiento, foto y asignación al mismo equipo en distintas zonas.
* Fixture manual y automático de una rueda por zona; los cruces se crean primero y se programan después con fecha, hora, cancha, terna arbitral y veedor opcional.
* Fase regular y Play Off separados, con cuadro flexible de Copa de Oro, Plata o personalizado, avance de ganadores y final neutral configurable.
* Planilla digital móvil: preliminar, abierta y cerrada; convocatoria precargada, presentismo, eventos, confirmaciones digitales y cancelación de preliminar. El superadministrador designa un delegado Jugador único por equipo para confirmar sólo sus propios partidos.
* Resultados, eventos, goleadores, sanciones, tabla y dashboard filtrable; equipos con cero partidos visibles en su zona.
* Consulta pública global de fixture y posiciones; ciclo de torneo con eliminación lógica y archivo.

## Pendiente de producto

Adjuntos/exportación de planilla, fixture interzonal, ABM de pagos, notificaciones, PWA efectiva, historial administrativo, títulos/ranking, multi-organización, temporadas con aislamiento real y restricción individual de la cuenta arbitral por designación.

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
