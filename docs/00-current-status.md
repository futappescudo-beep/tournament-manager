# Estado actual — 2026-09-10

Versión de documentación: **0.2.45**. La aplicación está en una etapa funcional de operación asistida: el núcleo del torneo está implementado, mientras que automatizaciones y algunos módulos administrativos siguen pendientes.

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
| Playoffs flexibles | Implementado, requiere migración | El administrador crea cuadros de Oro, Plata o personalizados con instancias predefinidas: Octavos, Cuartos, Semifinal y Final. Admite pases directos por procedencia y final neutral. |
| Cuadro y avance de Play Off | Implementado, requiere migración | El fixture tiene una pestaña exclusiva de Play Off, filtros Torneo → Categoría → Instancia y un cuadro gráfico de cuatro columnas. Los cruces completos se publican sin fecha y el ganador avanza si la procedencia se declara como “Ganador del cruce N”. |
| Fixture automático regular | Implementado, requiere migración | Completa una única rueda todos contra todos dentro de una zona sin programación inicial. Conserva los partidos ya cargados, rellena los cruces faltantes en su fecha correspondiente y no duplica enfrentamientos. |
| Vistas de fixture | Implementado | Dos pestañas: Fase regular (Torneo → Categoría → Zona → Fase → Fecha) y Play Off (Torneo → Categoría → Instancia). La agenda general concentra todos los partidos que ya tienen día y hora. |
| Fixture automático interzonal / playoffs | Pendiente | Los interzonales y la programación de partidos desde un cruce de playoff se incorporarán en etapas posteriores. |
| Ciclo de torneo | Implementado, requiere migración | Eliminar un torneo oculta sus fechas y partidos; cerrar y archivar conserva el historial y bloquea cambios de fixture. |
| PWA, notificaciones, multi-organización | Pendiente | Fuera del alcance operativo actual. |

## Dependencias operativas

La base debe incluir las migraciones de `database/migrations` en orden. Para la versión actual son imprescindibles las migraciones `20260908` a `20260921`, en especial las vistas de fixture/posiciones, el estado `PLAYED`, `20260916_digital_match_sheet.sql`, `20260917_closed_sheet_result_lock.sql`, `20260918_flexible_playoff_brackets.sql`, `20260919_unscheduled_fixture_matches.sql`, `20260920_fixture_visibility_and_tournament_lifecycle.sql` y `20260921_playoff_progression.sql`. Los cuadros creados antes de ejecutar la última migración se publican con el botón **Publicar cruces**.

La publicación en Vercel está bloqueada externamente hasta iniciar sesión de nuevo en la cuenta con acceso al proyecto. El código y GitHub no dependen de esa autorización.
