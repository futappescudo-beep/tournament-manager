# Reglas de Negocio

* Victoria = 3 puntos
* Empate = 1 punto
* Derrota = 0 puntos
* La interfaz ordena por puntos; el desempate reglamentario completo no está automatizado.
* No hay límite de 30 jugadores validado por el sistema.
* Un jugador no puede pertenecer a dos equipos distintos del mismo torneo.
* Un jugador puede inscribirse en más de una zona cuando todas las inscripciones pertenecen al mismo equipo.
* El dashboard contabiliza únicamente equipos activos que no fueron dados de baja.
* 5 amarillas acumuladas = 1 fecha de suspensión
* Roja directa = 1 fecha de suspensión automática
* Un resultado guardado se marca como `PLAYED`; los históricos con goles requieren la migración de backfill.
* La autorización real depende de RLS y de los roles de Supabase; la restricción exclusiva al árbitro asignado requiere validación adicional.
