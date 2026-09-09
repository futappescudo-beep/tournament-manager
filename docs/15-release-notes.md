# Historial de versiones

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
