# Guía para asistentes de desarrollo

1. Leer `00-current-status.md`, `PROJECT_MASTER.md` y el documento de dominio afectado antes de cambiar código.
2. Contrastar la propuesta con el esquema y las migraciones existentes; no asumir columnas ni vistas.
3. Para cambios de base, crear migración idempotente, actualizar `database.types.ts` si corresponde y documentar cómo ejecutarla.
4. Mantener los filtros dependientes torneo → categoría → zona y preservar bajas lógicas e historial.
5. Verificar lint/build de forma proporcional y actualizar `15-release-notes.md` antes de commit.
