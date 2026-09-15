# Roadmap vigente

## Estabilización previa a producción

1. Verificar en Supabase las migraciones hasta `20260922_cancel_draft_match_sheet.sql`.
2. Prueba completa de cada rol: administrador, delegado, árbitro, jugador y consulta pública; registrar los permisos que excedan el alcance.
3. Prueba de ciclo completo en una base limpia: torneo → equipos → planteles → rueda regular → resultados → Play Off → archivo.
4. Revisión móvil de fixture, planilla, resultados y formularios críticos.

## Próxima prioridad funcional recomendada

1. Endurecer RLS por equipo delegado y partido arbitral, más pruebas de roles. Es el bloqueo principal antes de abrir la operación a terceros.
2. Historial administrativo: torneos archivados, ficha de partido/observaciones, campeones por copa/categoría y ranking de títulos.
3. ABM de pagos: conceptos, vencimientos, estados, comprobantes y vista por equipo/zona.
4. Fixture interzonal opcional y criterios de clasificación configurables a Oro/Plata, con resaltado en posiciones.
5. Desempates reglamentarios, exportación/adjunto de planilla y ajustes visuales mobile-first.

## Posterior

Notificaciones, PWA instalable/offline, organizaciones y temporadas con aislamiento real.
