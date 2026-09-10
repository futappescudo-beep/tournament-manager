# Estado actual — 2026-09-10

Versión de documentación: **0.2.29**. La aplicación está en una etapa funcional de operación asistida: el núcleo del torneo está implementado, mientras que automatizaciones y algunos módulos administrativos siguen pendientes.

| Área | Estado | Alcance actual |
| --- | --- | --- |
| Acceso y roles | Implementado | Auth, recuperación de clave, roles y administración de usuarios. |
| Catálogos | Implementado | Torneos, categorías, zonas A–E, cupos, canchas y árbitros. |
| Equipos y planteles | Implementado | Alta, baja lógica, inscripciones, foto y jugadores por categoría/zona. |
| Fixture | Implementado manual | Partido por torneo, categoría, zona, fecha, cancha y terna arbitral. |
| Resultados y estadísticas | Implementado | Marcadores, eventos, goleadores, sanciones y posiciones. |
| Dashboard / público | Implementado | Filtros encadenados y partidos próximos, de hoy y anteriores. |
| Pagos | Parcial | Solo consulta de pagos existentes; no hay ABM. |
| Planilla digital | Implementado, requiere migración | Preliminar → Abierta → Cerrada, planteles precargados, presentismo, eventos y confirmaciones; PDF/QR siguen pendientes. |
| Fixture automático | Pendiente | No hay generación round-robin ni validación de cruces. |
| PWA, notificaciones, multi-organización | Pendiente | Fuera del alcance operativo actual. |

## Dependencias operativas

La base debe incluir las migraciones de `database/migrations` en orden. Para la versión actual son imprescindibles las migraciones `20260908` a `20260916`, en especial las vistas de fixture/posiciones, el estado `PLAYED` y `20260916_digital_match_sheet.sql`.

La publicación en Vercel está bloqueada externamente hasta iniciar sesión de nuevo en la cuenta con acceso al proyecto. El código y GitHub no dependen de esa autorización.
