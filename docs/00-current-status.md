# Estado actual — 2026-09-15

Versión de documentación: **0.2.54**. La aplicación está en una etapa funcional de operación asistida: el núcleo del torneo está implementado, mientras que automatizaciones y algunos módulos administrativos siguen pendientes.

| Área | Estado | Alcance actual |
| --- | --- | --- |
| Acceso y roles | Implementado con brechas | Auth, recuperación de clave, roles y administración de usuarios. Falta restringir `TEAM_MANAGER` a sus equipos y `REFEREE` a sus partidos asignados. |
| Catálogos | Implementado | Torneos, categorías, zonas A–E, cupos, canchas y árbitros. |
| Equipos y planteles | Implementado | Alta, baja lógica, inscripciones, foto y jugadores por categoría/zona. Los torneos archivados solo permanecen como historial: no se ofrecen para nuevas inscripciones. |
| Fixture | Implementado manual | Partido por torneo, categoría, zona, fecha, cancha, terna arbitral y veedor opcional. Los encuentros de torneos archivados o eliminados no se muestran en vistas activas. |
| Resultados y estadísticas | Implementado | Marcadores, eventos, goleadores, sanciones y posiciones. La tabla incluye equipos inscriptos con estadísticas en cero antes de disputar partidos. |
| Dashboard / posiciones / público | Implementado | Dashboard con filtros encadenados y pestañas Próximos / Hoy / Anteriores. Posiciones exige Torneo → Categoría → Zona y muestra equipos aun sin partidos. La consulta pública es global y de solo lectura. |
| Pagos | Parcial | Solo consulta de pagos existentes; no hay ABM. |
| Planilla digital | Implementado, requiere migraciones | Preliminar → Abierta → Cerrada, planteles precargados, presentismo, eventos y confirmaciones de árbitro, veedor y delegados. Una preliminar puede cancelarse antes de abrirse; el cierre bloquea resultados hasta reapertura administrativa. |
| Playoffs flexibles | Implementado, requiere migración | El administrador crea cuadros de Oro, Plata o personalizados con instancias predefinidas: Octavos, Cuartos, Semifinal y Final. Admite pases directos por procedencia y final neutral. |
| Cuadro y avance de Play Off | Implementado, requiere migración | El fixture tiene una pestaña exclusiva de Play Off, filtros Torneo → Categoría → Instancia y un cuadro gráfico de cuatro columnas. Solo expone cuadros vinculados a torneos activos; los cruces completos se publican sin fecha y el ganador avanza si la procedencia se declara como “Ganador del cruce N”. |
| Fixture automático regular | Implementado, requiere migración | Completa una única rueda todos contra todos dentro de una zona sin programación inicial. Conserva los partidos ya cargados, rellena los cruces faltantes en su fecha correspondiente y no duplica enfrentamientos. |
| Vistas de fixture | Implementado | Dos pestañas: Fase regular (Torneo → Categoría → Zona → Fase → Fecha) y Play Off (Torneo → Categoría → Instancia). La agenda general concentra todos los partidos que ya tienen día y hora. |
| Fixture automático interzonal / playoffs | Pendiente | Los interzonales y la programación de partidos desde un cruce de playoff se incorporarán en etapas posteriores. |
| Ciclo de torneo | Implementado, requiere migración | Eliminar un torneo oculta sus fechas y partidos; cerrar y archivar conserva el historial y bloquea cambios de fixture. |
| Historial, títulos y ranking | Pendiente | Los datos de un torneo archivado se conservan, pero aún no hay pantalla administrativa de consulta histórica, registro de campeones ni ranking de títulos. |
| Permisos granulares | Pendiente | La interfaz y las políticas siguen siendo amplias para delegado y árbitro; requiere vincular responsables a equipos y árbitros a partidos. |
| PWA, notificaciones, multi-organización | Pendiente | No hay manifest, service worker, instalación, notificaciones push ni aislamiento por organización. |

## Dependencias operativas

La base debe incluir las migraciones de `database/migrations` en orden. Para la versión actual son imprescindibles las migraciones `20260908` a `20260923`, en especial las vistas de fixture/posiciones, el estado `PLAYED`, `20260916_digital_match_sheet.sql`, `20260917_closed_sheet_result_lock.sql`, `20260918_flexible_playoff_brackets.sql`, `20260919_unscheduled_fixture_matches.sql`, `20260920_fixture_visibility_and_tournament_lifecycle.sql`, `20260921_playoff_progression.sql`, `20260922_cancel_draft_match_sheet.sql` y `20260923_match_supervisor.sql`. Los cuadros creados antes de ejecutar la última migración se publican con el botón **Publicar cruces**.

El repositorio `main` es la fuente de despliegue de Vercel. Antes de una prueba funcional, confirmar que Vercel haya publicado el commit más reciente y ejecutar las migraciones pendientes en el mismo proyecto de Supabase.
