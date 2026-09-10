# Historial de versiones

## 0.2.28 — Auditoría de alcance y documentación

- Se actualiza toda la documentación contra el código y migraciones vigentes.
- Se incorpora `00-current-status.md` con matriz de funcionalidades entregadas, parciales, pendientes y dependencias externas.
- Se documentan explícitamente fixture manual, resultado/posiciones, planteles por zona y los pendientes de planillas, fixture automático, PWA y ABM de pagos.

## 0.2.27 — Calendario del dashboard por fecha

- El dashboard separa los partidos en pestañas de Próximos, Hoy y Anteriores según la fecha actual de Argentina.
- Cada pestaña muestra el marcador apenas esté cargado; los encuentros pendientes conservan la indicación `VS`.

## 0.2.26 — Tipos explícitos de tabla de posiciones

- La migración de posiciones declara explícitamente como `bigint` todas las métricas acumuladas, compatible con la vista existente de Supabase.

## 0.2.25 — Compatibilidad de tipos en posiciones

- Se corrige la migración de posiciones para preservar los tipos `bigint` de la vista anterior y permitir su ejecución en Supabase.

## 0.2.24 — Recuperación de resultados históricos

- La migración `20260915_backfill_played_match_status.sql` marca como jugados los partidos históricos que ya tienen goles cargados.
- Los antiguos empates 0-0 se pueden confirmar desde Resultados para incorporarlos a la tabla.

## 0.2.23 — Resultados y posiciones actualizadas

- El dashboard muestra el marcador cuando un partido tiene resultado cargado.
- Al guardar un resultado, el partido pasa a estado **Jugado** y actualiza automáticamente las posiciones.
- La migración `20260914_dashboard_results_and_standings.sql` reconstruye `vw_standings` con los equipos e inscripciones actuales.

## 0.2.22 — Nombres de equipos en el fixture

- La migración `20260913_fix_fixture_team_names.sql` actualiza `vw_fixture` para leer las inscripciones actuales de local y visitante.
- Los partidos existentes recuperan sus nombres de equipo, cancha y árbitro sin necesidad de cargarlos nuevamente.

## 0.2.21 — Fechas por categoría y zona

- Se incluye la migración `20260912_matchdays_category_zone.sql` para instalaciones anteriores que aún no tenían `category_id` y `zone_id` en `matchdays`.
- La migración conserva las fechas existentes y permite que el fixture asigne nuevas jornadas por torneo, categoría y zona.

## 0.2.20 — Equipo arbitral del partido

- El alta manual del fixture incorpora Árbitro, Asistente 1 y Asistente 2, tomados del maestro de árbitros.
- Se incluye la migración `20260911_match_assistant_referees.sql`, que agrega las columnas de asistentes y asegura permisos de escritura para partidos.

## 0.2.19 — Alta de fixture por categoría y zona

- El alta manual de partidos requiere el recorrido **Torneo → Categoría → Zona** antes de habilitar los equipos.
- Los equipos local y visitante se limitan a la zona seleccionada, y la fecha de jornada se guarda separada por torneo, categoría y zona.

## 0.2.18 — Filtros secuenciales del dashboard

- El dashboard exige el orden **Torneo → Categoría → Zona**: Categoría se habilita al seleccionar un torneo y Zona al seleccionar una categoría.
- No se muestran categorías ni zonas globales, y los parámetros fuera de ese orden se ignoran para evitar filtros inversos.

## 0.2.17 — Asignación de jugadores por categoría y zona

- El alta y la asignación de jugadores ahora presentan equipo, categoría y zona en selectores separados y encadenados.
- La opción **Ver plantel** usa los mismos selectores para incorporar jugadores al equipo.
- Se ocultan opciones duplicadas históricas de categoría y zona en estos flujos.

## 0.2.16 — Filtros dinámicos en el dashboard

- Los filtros de torneo, categoría y zona se aplican automáticamente, sin requerir un botón adicional.
- Las opciones son dependientes: al elegir un torneo se actualizan las categorías y al elegir una categoría se actualizan las zonas disponibles.
- El catálogo del dashboard unifica rótulos duplicados históricos aunque tengan diferencias de espacios, tildes o formato.

## 0.2.15 — Recursos para programar el fixture

* Configuración incorpora maestros de Canchas y Árbitros, con alta y baja lógica.
* Las canchas y árbitros activos quedan disponibles en el formulario de alta manual de partidos.
* Requiere ejecutar la migración `20260910_fixture_resources_access.sql` en Supabase para habilitar las altas y bajas.

## 0.2.14 — Maestro de zonas

* Al crear una categoría se elige entre una y cinco zonas; el sistema genera automáticamente Zona A hasta Zona E.
* Se elimina el alta manual de zonas para evitar nombres repetidos. El cupo de equipos permanece editable por zona en Configuración.

## 0.2.13 — Catálogo de filtros sin repeticiones

* El dashboard muestra una única opción por categoría y por zona dentro de cada categoría, aun si existían registros históricos duplicados.
* Las zonas se presentan una sola vez por nombre, sin replicar opciones existentes.

## 0.2.12 — Reactivación de inscripciones

* Al volver a marcar una zona previamente dada de baja para un equipo, se reactiva su inscripción existente en lugar de crear un duplicado.

## 0.2.11 — Inscripción de equipos sin pérdida de datos

* Al editar zonas de un equipo, las nuevas inscripciones se guardan antes de cerrar las anteriores; un error ya no puede dejar al equipo sin zona.
* Se elimina la validación de disponibilidad que estaba rechazando zonas activas visibles en la pantalla.

## 0.2.10 — Guardado robusto de zonas

* La validación de cupos de zona ya no depende de una respuesta de fila única de Supabase, evitando el error técnico al guardar una inscripción.

## 0.2.9 — Mensajes claros al inscribir equipos

* Al guardar una zona de un equipo, los rechazos de validación se muestran en pantalla con su motivo real, incluido el cupo máximo de la zona.

## 0.2.8 — Visibilidad de equipos sin zona

* El selector de Jugadores muestra todos los equipos activos, aun si todavía no tienen una zona vigente.
* Si un equipo no tiene zona activa, el selector de zona lo informa y evita una asignación incompleta.

## 0.2.7 — Asignación por equipo y zona

* En Jugadores, el alta y la asignación usan dos selectores: primero Equipo y luego Zona.
* Las zonas se filtran de acuerdo con el equipo elegido y la asignación se guarda en la inscripción correcta.

## 0.2.6 — Inscripciones claras y limpieza de catálogo

* El alta de equipo muestra sus posibles inscripciones en una tabla con Torneo, Categoría, Zona y estado de participación.
* Configuración permite dar de baja categorías y zonas; las inscripciones y jugadores activos relacionados se cierran y el historial se conserva.
* Se previene el alta de categorías duplicadas en un torneo y de zonas duplicadas dentro de una categoría.

## 0.2.5 — Carga por zona desde el plantel

* **Equipos → Ver plantel** ofrece siempre la acción **Agregar jugador**.
* La asignación desde el plantel permite elegir el jugador existente y la categoría/zona en la que juega con ese equipo.
* El modal para crear o editar equipos reduce su ancho y permite desplazamiento vertical en pantallas con poca altura.

## 0.2.4 — Baja consistente de equipos

* El selector de equipos para jugadores excluye equipos inactivos y dados de baja, incluso si conservaban inscripciones históricas.
* Al dar de baja un equipo, también se cierran sus inscripciones y las asignaciones activas de jugadores.
* Se incorpora una migración para limpiar inscripciones activas residuales de equipos que ya estaban dados de baja.

## 0.2.3 — Simplificación de la asignación de jugadores

* El alta de jugador usa Nombre, Apellido, DNI numérico, Fecha de nacimiento y Equipo.
* Se eliminan dorsal, capitán y arquero de los formularios de alta y asignación.
* El plantel vacío permite elegir solo jugadores que pueden incorporarse al equipo actual, evitando errores por clubes incompatibles.

## 0.2.2 — Selector de inscripción y errores de jugador

* El selector de alta muestra `Torneo · Equipo · Categoría · Zona`.
* Los documentos duplicados y asignaciones inválidas se informan como avisos dentro de la interfaz, sin mostrar un error técnico de servidor.

## 0.2.1 — Corrección del flujo de planteles

* En **Jugadores** queda una única acción de alta: **Nuevo jugador**.
* **Equipos → Ver plantel** deja de iniciar altas de jugador y muestra exclusivamente el plantel del equipo.
* Cuando un plantel está vacío, permite asignar un jugador existente a una de sus zonas.

## 0.2.0 — Gestión de planteles por zona

* Se corrige el conteo del dashboard para excluir equipos inactivos o dados de baja.
* El alta de jugador permite seleccionar en el mismo formulario el equipo, categoría y zona.
* Un jugador puede integrar más de una zona del mismo equipo; no puede estar activo en equipos distintos.
* Desde **Equipos → Ver plantel** se puede iniciar el alta de un jugador con la inscripción de equipo/zona ya seleccionada.

## 0.1.0 — MVP inicial

* Gestión de torneos, equipos, jugadores, fixture, resultados, eventos y goleadores.
