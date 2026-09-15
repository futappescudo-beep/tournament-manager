# Estándares de Código

* TypeScript `strict: true`
* Prohibido `any`
* Componentes en PascalCase
* Hooks en camelCase con prefijo `use`
* Server Actions en `lib/actions`.
* Servicios de BD en `lib/service` y repositorios en `lib/repositories`.
* Esquemas Zod en `lib/validations`.
* Import alias `@/*`
* Validación con Zod en `lib/validations`.
* Ejecutar los binarios locales de TypeScript, ESLint y `next build` antes de un release funcional cuando el entorno lo permita.
* Un commit por funcionalidad
* Toda modificación de esquema requiere una nueva migración SQL idempotente y documentación del orden de ejecución.
