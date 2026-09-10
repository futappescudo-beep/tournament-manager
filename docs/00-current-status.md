# Estado actual — 2026-09-10

Versión de documentación: **0.2.36**. La aplicación está en una etapa funcional de operación asistida: el núcleo del torneo está implementado, mientras que automatizaciones y algunos módulos administrativos siguen pendientes.

| Área | Estado | Alcance actual |
| --- | --- | --- |
| Acceso y roles | Implementado | Auth, recuperación de clave, roles y administración de usuarios. |
| Catálogos | Implementado | Torneos, categorías, zonas A–E, cupos, canchas y árbitros. |
| Equipos y planteles | Implementado | Alta, baja lógica, inscripciones, foto y jugadores por categoría/zona. |
| Fixture | Implementado manual | Partido por torneo, categoría, zona, fecha, cancha y terna arbitral. |
| Resultados y estadísticas | Implementado | Marcadores, eventos, goleadores, sanciones y posiciones. |
| Dashboard / posiciones / público | Implementado | Filtros encadenados y partidos próximos, de hoy y anteriores; Posiciones muestra la tabla completa del alcance seleccionado. |
| Pagos | Parcial | Solo consulta de pagos existentes; no hay ABM. |
| Planilla digital | Implementado, requiere migraciones | Preliminar → Abierta → Cerrada, planteles precargados, presentismo, eventos y confirmaciones; el cierre bloquea resultados hasta reapertura administrativa. |
| Playoffs flexibles | Implementado, requiere migración | El administrador puede crear cuadros de Oro, Plata o personalizados, con cruces manuales, pases directos por procedencia y final neutral. La programación de partidos desde el cuadro queda pendiente. |
| Fixture automático regular | Implementado | Genera una única rueda todos contra todos dentro de una zona, con fecha inicial, intervalo entre fechas y horario base; no duplica un fixture existente del mismo alcance. |
| Fixture automático interzonal / playoffs | Pendiente | Los interzonales y la programación de partidos desde un cruce de playoff se incorporarán en etapas posteriores. |
| PWA, notificaciones, multi-organización | Pendiente | Fuera del alcance operativo actual. |

## Dependencias operativas

La base debe incluir las migraciones de `database/migrations` en orden. Para la versión actual son imprescindibles las migraciones `20260908` a `20260918`, en especial las vistas de fixture/posiciones, el estado `PLAYED`, `20260916_digital_match_sheet.sql`, `20260917_closed_sheet_result_lock.sql` y `20260918_flexible_playoff_brackets.sql`.

La publicación en Vercel está bloqueada externamente hasta iniciar sesión de nuevo en la cuenta con acceso al proyecto. El código y GitHub no dependen de esa autorización.
