# Matriz de aceptación previa a producción

Usar dos torneos ficticios separados, ambos con dos zonas, cuatro equipos, una planilla abierta y otra cerrada. Registrar fecha, cuenta usada, resultado esperado y resultado real de cada caso.

- `QA - Prueba Operativa 2026`: entorno cambiante para detectar fallas.
- `DEMO - Tutoriales 2026`: recorrido estable para capturas y videos. No reutilizarlo para pruebas que alteren resultados.

Usar únicamente equipos, jugadores e identificadores ficticios. Nunca cargar DNI, fotos ni otros datos personales reales para una demostración.

| Perfil | Debe poder | No debe poder |
| --- | --- | --- |
| SUPER_ADMIN | Gestionar catálogos, roles, equipos, fixture, planillas, resultados, Play Off y archivo | — |
| TOURNAMENT_ADMIN | Operar torneo, fixture, planillas y resultados activos | Cambiar roles globales o configuración exclusiva de superadmin |
| REFEREE compartido | Consultar y editar una planilla abierta, marcar partido finalizado y confirmar como árbitro/veedor cuando corresponda | Gestionar equipos, jugadores, configuración, cerrar/reabrir planilla o editar resultado cerrado |
| Delegado (PLAYER asignado) | Consultar y confirmar la planilla finalizada de su equipo, con comentario o reclamo | Ver o confirmar planillas de otro equipo; editar convocatoria, eventos o resultados |
| PLAYER | Aplicar filtros y consultar Principal, Fixture, Resultados, Posiciones, Goleadores, Sanciones y Reglamento | Crear/editar equipos, jugadores, fixture, resultados, pagos, configuración o planillas ajenas |
| Invitado | Consultar `/public`, cambiar filtros y navegar en modo lectura | Acceder a rutas privadas, modificar datos o consultar tablas administrativas |

## Ciclo funcional

1. Crear torneo, categoría y dos zonas; cargar canchas y oficiales.
2. Crear cuatro equipos, asignarlos a zona y registrar jugadores existentes o nuevos.
   - Desde **Jugadores** y desde **Plantel**, elegir un equipo recién creado y comprobar que se habilitan su categoría y zona.
3. Generar los cruces regulares, comprobar que no duplica partidos y programar día, hora y cancha.
4. Crear planilla preliminar, cancelarla una vez, recrearla, abrirla y operar presentes/eventos. Buscar un jugador por DNI y por nombre; validar DNI, nacimiento, edad, número y titularidad.
5. Marcar **Partido finalizado**. Confirmar ambos delegados (uno con comentario/reclamo), después árbitro y finalmente veedor; cerrar la planilla y comprobar que el resultado queda bloqueado.
6. Reabrir como administrador, ajustar el resultado por reclamo y volver a cerrar.
7. Confirmar resultado, posiciones, goleadores y sanciones; crear y publicar un cuadro de Play Off.
8. Archivar el torneo y verificar que desaparece de las operaciones activas, pero sus datos se preservan para el futuro módulo histórico.

## Criterio de salida

No abrir la aplicación a terceros hasta que todos los casos del cuadro estén aprobados en desktop y teléfono, y Vercel/Supabase correspondan al mismo release y conjunto de migraciones.

## Cierre de la prueba

- Al finalizar una ronda de QA, archivar el torneo si se quiere conservar su contexto para investigar una falla.
- Al terminar la grabación, archivar `DEMO - Tutoriales 2026`: queda disponible para una futura consulta histórica y no permite modificaciones.
- Si el torneo de QA se debe retirar por completo de la operación, usar sólo [`database/admin/retire_one_demo_tournament.sql`](../database/admin/retire_one_demo_tournament.sql) con su UUID exacto. El script se niega a actuar sobre torneos sin `QA`, `DEMO`, `PRUEBA` o `TUTORIAL` en el nombre y no afecta jugadores ni torneos ajenos.
- No ejecutar `reset_competition_keep_player_registry.sql` cuando existan torneos operativos: es un reinicio global.
