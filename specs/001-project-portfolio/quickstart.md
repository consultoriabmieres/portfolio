# Quickstart: validar el portfolio

## Requisitos

- Node.js ≥ 22.23.4 (`node --version`).
- App creada en `Portfolio/web/` y dependencias instaladas. Todos los comandos y rutas de esta guía
  son relativos a `web/`.

## Comandos

| Comando | Quién lo corre | Qué valida |
|---|---|---|
| `npm run dev` | Dueño | Ver el sitio en local mientras se edita |
| `npx astro check` | Asistente | Tipos y diagnósticos sin errores |
| `npm run build` | Dueño | Schema de todos los proyectos válido y sitio generado en `dist/` |
| `npm run preview` | Dueño | Ver el build final antes de publicar |

## Escenarios

1. **Listado (US1)**: abrir `/`. Se ve la presentación y una tarjeta por proyecto publicado, en el
   orden de `order`, con nombre, resumen, stack, portada y enlaces. Los proyectos profesionales
   muestran empresa y período.
2. **Responsive (FR-013, SC-004)**: en las herramientas del navegador, ancho 360 px. No hay
   desplazamiento horizontal en `/` ni en un detalle.
3. **Detalle (US2)**: abrir un proyecto. Se ven descripción, galería, videos y enlaces. El video
   propio aparece pausado y en silencio. El enlace de regreso vuelve a `/`.
4. **Enlace directo (SC-006)**: abrir `/projects/<id>/` en una pestaña nueva; carga sin pasar por `/`.
5. **No encontrado (FR-012)**: abrir `/projects/no-existe/`; aparece la página 404 con enlace a `/`.
6. **Agregar proyecto (US3, SC-002)**: crear una carpeta nueva con `index.md` y su portada,
   `npm run build`. `git status` muestra solo archivos dentro de esa carpeta (y `public/videos/<id>/`
   si tiene videos) y el proyecto aparece en el sitio.
7. **Dato faltante (FR-011)**: borrar `summary` de un proyecto y correr `npm run build`. Falla
   nombrando el archivo y el campo. Restaurarlo.
8. **Borrador (FR-009)**: poner `draft: true` en un proyecto; desaparece del listado y su dirección
   da 404.
9. **Profesional sin código (FR-019)**: agregar un enlace `type: repo` a un proyecto profesional y
   correr `npm run build`. Falla. Quitarlo.
10. **Marcadores (supuesto de la spec)**: con `TODO-github-user` en algún enlace, `npm run build`
    falla; `npm run dev` funciona.

## Publicación

1. Crear el repo en la cuenta nueva de GitHub y subir `Portfolio/` (lo hace el dueño).
2. En Cloudflare: Email Routing con el correo de destino verificado, widget de Turnstile, y el
   Worker `portfolio` con Workers Builds (root `web`, build `npm run build`, deploy
   `npx wrangler deploy`), variable `PUBLIC_TURNSTILE_SITE_KEY` y secretos `CONTACT_TO` y
   `TURNSTILE_SECRET`. Redirect Rule de `www.bmieres.cl` al raíz.
2b. **Formulario (FR-026 a FR-031)**: enviar un mensaje de prueba desde `https://bmieres.cl/#contacto`
   y confirmar que llega al correo con nombre, email y texto. Probar también un email inválido
   (debe pedir corregirlo).
3. Repetir los escenarios 1 a 5 sobre `https://bmieres.cl`, y comprobar que `https://www.bmieres.cl`
   redirige al raíz.
