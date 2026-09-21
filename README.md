# Escudo Amistad — Tournament Manager

Aplicación web responsive para administrar torneos de fútbol amateur. Incluye operación de torneos, equipos, planteles, fixture regular, Play Off, resultados, planilla digital, archivo de torneos y consulta pública.

## Puesta en marcha

1. Copiar `.env.example` a `.env.local`.
2. Completar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los datos del proyecto Supabase. No usar la clave `service_role`.
3. Ejecutar `pnpm install` y luego `pnpm dev`.

## Capacidades actuales

- Torneos activos con categorías, zonas, cupos, canchas y árbitros.
- Equipos, jugadores, logos/fotos e inscripciones por categoría y zona; alta completa desde Jugadores o desde el plantel, y asignación separada de jugadores ya existentes.
- Fixture manual y generación automática de una rueda regular por zona; programación posterior de día, horario, cancha y terna arbitral.
- Play Off flexible de Oro, Plata u otra copa, con llaves y avance de ganadores.
- Resultados, eventos, sanciones, goleadores, dashboard y posiciones.
- Planilla digital con estados preliminar, abierta y cerrada; presentismo y confirmaciones digitales.
- Archivo de torneo que lo excluye de la operación activa sin borrar sus datos.

## Pendientes principales

- Permisos granulares por equipo delegado y partido arbitral.
- Historial administrativo, campeones y ranking de títulos.
- ABM de pagos, interzonales, adjuntos/PDF de planilla, notificaciones y PWA.

## Migraciones de Supabase

Ejecutar los archivos de `database/migrations` en orden cronológico, hasta `20260926_player_registration_permissions.sql`. Las migraciones son parte del release: desplegar solo el código sin aplicar la migración correspondiente puede dejar una acción visible sin permiso en la base.

La documentación funcional y el plan de continuidad están en [`docs/00-current-status.md`](docs/00-current-status.md) y [`docs/16-scope-audit-20260915.md`](docs/16-scope-audit-20260915.md).
