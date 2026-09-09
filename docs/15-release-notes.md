# Historial de versiones

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
