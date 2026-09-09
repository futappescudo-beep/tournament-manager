# PROJECT_MASTER

## Proyecto

Tournament Manager

## Objetivo

MVP funcional en 24 horas para administrar un torneo de fútbol amateur.

## Funcionalidades obligatorias del MVP

* Login con Supabase Auth
* Dashboard responsive
* Crear y editar equipos
* Crear y editar jugadores
* Gestionar lista de buena fe
* Cargar planillas (PDF o imagen)
* Crear fixture manual
* Registrar resultados
* Ver próximos partidos
* Ver tabla de posiciones automática
* Ver goleadores automáticos
* Registrar tarjetas amarillas y rojas
* Registrar sanciones simples

## Fuera del MVP (Semana 2)

* IA y RAG de reglamentos
* Firma digital
* Pagos y cuotas
* Notificaciones
* Multi-organización
* Multi-temporada

## Stack

* Next.js 15 (App Router)
* TypeScript (strict)
* Tailwind CSS
* shadcn/ui
* Supabase (Auth + PostgreSQL + Storage)
* Vercel

## Principios

* Mobile-first
* Server Actions
* Validación con Zod
* No usar `any`
* No lógica de negocio en componentes UI
* Todas las consultas a BD en `services/`

## Fuente de verdad

Claude Code debe usar exclusivamente los archivos dentro de `docs/` como contexto del proyecto.
