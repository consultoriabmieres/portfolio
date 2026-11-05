---
kind: personal
title: App de tareas
summary: Gestor de tareas con espacios de trabajo y tableros, autenticación de usuarios y datos en Supabase.
stack: [Next.js, TypeScript, Supabase, PostgreSQL]
cover: { src: ./cover.svg, alt: Portada provisoria de la App de tareas }
links:
  - { type: repo, url: https://github.com/consultoriabmieres/tasks-app }
order: 2
---

Aplicación para organizar tareas en espacios de trabajo y tableros. Incluye registro, inicio de
sesión, recuperación de contraseña y perfil de usuario.

Está construida con Next.js y Supabase: la autenticación y la base de datos PostgreSQL viven en
Supabase, y la app usa `@supabase/ssr` para manejar la sesión en el servidor.
