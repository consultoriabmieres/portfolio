---
description: "Tareas de implementación del portfolio de proyectos"
---

# Tasks: Portfolio de proyectos

**Input**: Design documents from `/specs/001-project-portfolio/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: la spec no pide tests automatizados. La verificación es `astro check`, `astro build`
(valida el schema) y los escenarios de [quickstart.md](quickstart.md).

**Organization**: tareas agrupadas por historia de usuario.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia a la que pertenece (US1, US2, US3)
- **(dueño)**: la corre el dueño (instalaciones, dev server, build, deploy). El resto, el asistente.

## Path Conventions

Todas las rutas de código son relativas a `Portfolio/web/` salvo que digan otra cosa.

---

## Phase 1: Setup

**Purpose**: entorno y proyecto Astro creado

- [X] T001 (dueño) Actualizar Node.js con `winget upgrade --id OpenJS.NodeJS.22 -e` y confirmar en
  una terminal nueva que `node --version` sea ≥ 22.23.4
- [X] T002 (dueño) Desde `Portfolio/`, crear la app con
  `npm create astro@latest web -- --template minimal --no-git --no-ai` (instala `astro`)
- [X] T003 (dueño) En `Portfolio/web/`, instalar `npm install -D @astrojs/check typescript`
- [X] T004 Revisar lo generado y ajustar: `tsconfig.json` extiende `astro/tsconfigs/strict`;
  `astro.config.mjs` sin adaptador ni `output: 'server'`; agregar el script `"check": "astro check"`
  en `package.json`; borrar el contenido de ejemplo de `src/pages/index.astro`

---

## Phase 2: Foundational

**Purpose**: estilos, layout, schema y contenido que usan todas las historias

**⚠️ CRITICAL**: ninguna historia empieza antes de terminar esta fase

- [X] T005 [P] Crear `src/styles/global.css`: variables de color, espacio y tipografía en `:root`;
  modo oscuro con `@media (prefers-color-scheme: dark)`; tipografía del sistema; contenedor con ancho
  máximo; `img, video, iframe { max-width: 100% }` para no tener desplazamiento horizontal a 360 px
- [X] T006 Crear `src/layouts/BaseLayout.astro`: `<html lang="es">`, meta `viewport` y `description`,
  props `title` y `description`, importa `global.css`, `<main>` con `<slot />`
- [X] T007 Crear `src/content.config.ts` con la colección `projects`:
  `glob({ base: './src/content/projects', pattern: '*/index.md' })`, `z` de `astro/zod`, schema con
  `({ image })`, `z.discriminatedUnion('kind', …)`. Reglas de [data-model.md](data-model.md):
  `summary` "máx. 200 caracteres"; `stack` "Al menos 1 tecnología"; `cover`/`images` con
  `{ src: image(), alt: z.string().min(1) }`; `images` y `videos` default `[]`; `order` "número
  entero"; `draft` "default `false`"; `personal`: links "Mín. 1, y al menos uno de tipo `repo`";
  `professional`: `company` y `period` obligatorios, links "Opcional (default `[]`); tipo `repo`
  prohibido"; `Link.url` "URL absoluta `https://`; en build de producción no puede contener
  `TODO-`" (usar `import.meta.env.PROD`); `Video` unión por `source` (`file` | `youtube` | `link`),
  `file.path` "el archivo debe existir y ser `.mp4`" (verificar `public/<path>` con
  `fs.existsSync`), `youtube.videoId` "ID de YouTube (11 caracteres)"
- [X] T008 [P] Crear `src/data/site.ts` con `SiteProfile` tipado: nombre "Benjamín Mieres Méndez",
  título "Ingeniero Civil Informático", bio de 2 a 3 líneas desde el perfil del CV, `githubUrl`
  `https://github.com/TODO-github-user`, `linkedinUrl` `https://www.linkedin.com/in/benjamin-mieres`.
  Lanzar error si `import.meta.env.PROD` y alguna URL contiene `TODO-`
- [X] T009 [P] Crear el contenido inicial en `src/content/projects/`: carpetas `gym-app`,
  `gym-app-v2`, `tasks-app`, `trading-panel` y `portfolio`, cada una con `index.md` (kind
  `personal`, título, resumen, stack y descripción redactados desde el código y la doc de cada
  proyecto en `ProyectosPersonales/`, enlace `repo` a `https://github.com/TODO-github-user/<id>`,
  `order` del 1 al 5) y una portada provisoria `cover.svg` con el nombre del proyecto. El dueño
  revisa los textos

**Checkpoint**: `npx astro check` sin errores y el schema acepta los 5 proyectos

---

## Phase 3: User Story 1 - Ver el listado de proyectos (Priority: P1) 🎯 MVP

**Goal**: la página principal muestra la presentación y una tarjeta por proyecto publicado

**Independent Test**: escenarios 1 y 2 de [quickstart.md](quickstart.md)

- [X] T010 [P] [US1] Crear `src/components/ProfileHeader.astro`: nombre, título, bio y enlaces a
  GitHub y LinkedIn desde `src/data/site.ts`; sin teléfono ni email (FR-016)
- [X] T011 [P] [US1] Crear `src/components/ProjectLinks.astro`: recibe `links`; no renderiza nada si
  está vacío; texto por defecto según `type` ("Código", "Demo", "Enlace"); todos con
  `target="_blank" rel="noopener noreferrer"` (FR-004)
- [X] T012 [US1] Crear `src/components/ProjectCard.astro`: portada con `<Image />` de
  `astro:assets` y su `alt`, título, resumen, stack como etiquetas, distintivo "Personal" o
  "`company` · `period`" si es profesional, enlace al detalle `/projects/<id>/` y `ProjectLinks`
  (FR-002, FR-017)
- [X] T013 [US1] Reemplazar `src/pages/index.astro`: `BaseLayout` + `ProfileHeader` +
  `getCollection('projects', ({ data }) => !data.draft)` ordenado por `order` y luego `title`,
  grilla responsive de `ProjectCard`; mensaje si no hay proyectos (FR-001, FR-008, edge case)
- [ ] T014 [US1] (dueño) `npm run dev` y validar escenarios 1 y 2 del quickstart

**Checkpoint**: el listado funciona solo; los enlaces "ver detalle" todavía dan 404

### Rediseño visual del listado (FR-020 a FR-025, agregado tras la revisión del MVP)

- [X] T013a [US1] Configurar la Fonts API en `astro.config.mjs`: Inter (400, 500, 600, 700) como
  `--font-sans` y JetBrains Mono (400, 500) como `--font-mono`, provider `fontProviders.fontsource()`
- [X] T013b [US1] Rehacer `src/styles/global.css` como tema oscuro tech: tokens de color con
  acento, fondo con brillos radiales y grilla sutil, escala tipográfica, clase `.reveal` con
  `animation-timeline: view()` dentro de `@supports` y `prefers-reduced-motion`
- [X] T013c [US1] Agregar `featured: z.boolean().default(false)` al schema en
  `src/content.config.ts` y marcar `featured: true` en `trading-panel`
- [X] T013d [P] [US1] Crear `src/components/SiteNav.astro` (FR-021) y `src/components/SiteFooter.astro`
  (FR-025); incluirlos con `<Font />` en `src/layouts/BaseLayout.astro`
- [X] T013e [P] [US1] Reemplazar `ProfileHeader.astro` por `src/components/Hero.astro` (FR-022) y
  borrar `ProfileHeader.astro`
- [X] T013f [US1] Rehacer `src/components/ProjectCard.astro` con variante destacada, hover con
  elevación y borde iluminado (FR-023, FR-024)
- [X] T013g [US1] Rehacer `src/pages/index.astro` con secciones "Experiencia profesional" y
  "Proyectos personales" en grilla bento (FR-023)
- [X] T013h [P] [US1] Rehacer las portadas provisorias `cover.svg` con el estilo oscuro del sitio
- [ ] T013i [US1] (dueño) `npm run dev` y revisar el rediseño

### Contacto como llamada a la acción principal (FR-026 a FR-029)

- [X] T013j [US1] Agregar `email` y `whatsappUrl` a `src/data/site.ts` y crear
  `src/lib/obfuscate.ts` que codifica un texto como entidades HTML (FR-028)
- [X] T013k [US1] Crear `src/components/Contact.astro`: sección `#contacto` con email visible
  codificado, botones "Escribir email", "Copiar email" (script mínimo con `navigator.clipboard` y
  selección de respaldo, FR-029), WhatsApp y LinkedIn
- [X] T013l [US1] Agregar el botón destacado "Contacto" en `SiteNav.astro` y cambiar la primera
  llamada a la acción de `Hero.astro` a "Contáctame" (FR-027); incluir `Contact` al final de
  `src/pages/index.astro`

### Formulario de contacto con Worker (FR-026, FR-028 a FR-031; constitución 2.0.0)

T013j y T013k quedan reemplazadas por estas: el email y el WhatsApp salen del sitio.

- [X] T013m [US1] (aprobada) Instalar `wrangler` como dependencia de desarrollo en `web/`
- [X] T013n [US1] Crear `web/wrangler.jsonc` (assets `./dist`, `run_worker_first: ["/api/*"]`,
  binding `send_email` `EMAIL`) y `web/.dev.vars.example` con las claves de prueba de Turnstile
- [X] T013o [US1] Crear `web/worker/index.ts` según [contracts/api-contact.md](contracts/api-contact.md):
  validación (nombre 1–100, email válido ≤254, mensaje 10–5000), campo trampa, verificación de
  Turnstile en siteverify, envío con `env.EMAIL.send`
- [X] T013p [US1] Rehacer `src/components/Contact.astro` como formulario con widget de Turnstile,
  validación en el navegador, estados enviando / éxito / error (FR-030) y enlace a LinkedIn
- [X] T013q [US1] Eliminar la cadena anterior: `src/lib/obfuscate.ts`, `email` y `whatsappUrl` de
  `src/data/site.ts`

---

## Phase 4: User Story 2 - Ver el detalle de un proyecto (Priority: P2)

**Goal**: cada proyecto tiene su página con descripción, imágenes, videos y enlaces

**Independent Test**: escenarios 3, 4 y 5 de [quickstart.md](quickstart.md)

- [X] T015 [P] [US2] Crear `src/components/ProjectGallery.astro`: grilla CSS de `<Image />` con
  `alt`; cada imagen enlaza a su archivo original en pestaña nueva; no renderiza nada sin imágenes;
  con una sola imagen no muestra grilla
- [X] T016 [P] [US2] Crear `src/components/ProjectVideos.astro`: `source: file` →
  `<video controls muted playsinline preload="metadata">` sin `autoplay`, con `poster` si existe;
  `source: youtube` → `<iframe src="https://www.youtube-nocookie.com/embed/<videoId>"
  loading="lazy" title=…>` con relación de aspecto 16:9; `source: link` → enlace externo con su
  título; no renderiza nada sin videos (FR-005, FR-006)
- [X] T017 [US2] Crear `src/pages/projects/[id].astro`: `getStaticPaths` con los proyectos no
  borrador → `{ params: { id }, props: { project } }`; `const { Content } = await render(project)`;
  muestra título, distintivo personal/profesional, stack, portada, `<Content />`,
  `ProjectGallery`, `ProjectVideos`, `ProjectLinks` y enlace "Volver a proyectos" (FR-003, FR-019)
- [X] T018 [P] [US2] Crear `src/pages/404.astro` con `BaseLayout`, mensaje "Página no encontrada" y
  enlace a `/` (FR-012)
- [ ] T019 [US2] (dueño) `npm run dev` y validar escenarios 3, 4 y 5 del quickstart

**Checkpoint**: listado y detalle funcionan

---

## Phase 5: User Story 3 - Agregar o editar un proyecto (Priority: P3)

**Goal**: el dueño agrega un proyecto creando solo su carpeta, y el build lo protege de errores

**Independent Test**: escenarios 6 a 10 de [quickstart.md](quickstart.md)

- [ ] T020 [US3] Crear `src/content/projects/README.md` con la guía corta para agregar un proyecto
  (personal y profesional), enlazando a `specs/001-project-portfolio/contracts/project-content.md`.
  Confirmar que el glob `*/index.md` no toma el README como proyecto
- [ ] T021 [US3] (dueño) `npm run build` y validar escenarios 6 a 10 del quickstart (el 10 debe
  fallar mientras exista `TODO-github-user`)

**Checkpoint**: las tres historias funcionan

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T022 [P] Crear `Portfolio/CLAUDE.md` corto: dónde está la app (`web/`), comandos, cómo invocar
  Spec Kit desde la raíz del workspace y que el deploy usa Root Directory `web`
- [ ] T023 Correr `npx astro check` en `web/` y dejarlo sin errores
- [ ] T024 (dueño) Reemplazar lo provisorio: portadas `cover.svg` por capturas reales, agregar
  imágenes y videos, crear la cuenta de GitHub y reemplazar `TODO-github-user`, agregar los
  proyectos de Rendering que elija
- [ ] T025 (dueño) Subir el repo a GitHub (`consultoriabmieres/portfolio`); en Cloudflare activar
  Email Routing y verificar el correo de destino, crear el widget de Turnstile, crear el Worker con
  Workers Builds (root `web`, build `npm run build`, deploy `npx wrangler deploy`), cargar
  `CONTACT_TO`, `TURNSTILE_SECRET` y `PUBLIC_TURNSTILE_SITE_KEY`; dominio `bmieres.cl` y
  redirección de `www`; validar escenarios 1 a 5 y enviar un mensaje de prueba

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T004)**: en orden; T002 necesita T001, T004 necesita T002 y T003
- **Foundational (T005–T009)**: después de Setup; bloquea todas las historias. T006 usa T005
- **US1 (T010–T014)**: después de Foundational
- **US2 (T015–T019)**: después de Foundational; reusa `ProjectLinks` (T011)
- **US3 (T020–T021)**: después de US1 y US2 (los escenarios validan listado y detalle)
- **Polish (T022–T025)**: T024 y T025 al final; T025 necesita T024

### Parallel Opportunities

- Foundational: T005, T008 y T009 en paralelo; T007 en paralelo con T005
- US1: T010 y T011 en paralelo; luego T012 y T013
- US2: T015, T016 y T018 en paralelo; luego T017

## Parallel Example: User Story 2

```text
Task: "Crear src/components/ProjectGallery.astro"
Task: "Crear src/components/ProjectVideos.astro"
Task: "Crear src/pages/404.astro"
```

## Implementation Strategy

### MVP (User Story 1)

1. Setup + Foundational
2. US1 → validar el listado (T014)
3. Parar y revisar con el dueño antes de seguir

### Entrega incremental

1. US1 → listado visible en local
2. US2 → detalle de cada proyecto
3. US3 → guía y validaciones del build
4. Polish → contenido real y deploy en Cloudflare Pages (`bmieres.cl`)

## Notes

- Commit al cerrar cada fase, sin `push`
- Las tareas (dueño) bloquean a las siguientes: el asistente avisa y espera
