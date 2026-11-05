# Implementation Plan: Portfolio de proyectos

**Branch**: `001-project-portfolio` | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-project-portfolio/spec.md`

## Summary

Sitio estático con Astro 7 que muestra una presentación personal y un listado de proyectos, cada
uno con su página de detalle. Los proyectos son carpetas con un `index.md` validado por un schema
de content collections que distingue proyectos personales (con repositorio) de profesionales (sin
código). Imágenes optimizadas con `astro:assets`, videos propios en `public/` o embebidos de
YouTube y JavaScript de cliente solo en el formulario de contacto. Se publica como Cloudflare
Worker con archivos estáticos en `bmieres.cl`; el Worker solo atiende `/api/contact`
([contracts/api-contact.md](contracts/api-contact.md)).

## Technical Context

**Language/Version**: TypeScript (modo `strict` de Astro) sobre Node.js ≥ 22.23.4

**Primary Dependencies**: `astro` 7. Desarrollo: `@astrojs/check` y `typescript` (para `astro check`)
y `@types/node` (tipos de `node:fs`/`node:path` usados por el schema para validar videos; aprobada
por el dueño el 2026-10-23). No se agrega ninguna otra.

**Storage**: archivos del repo (Markdown + imágenes + videos). Sin base de datos.

**Testing**: `astro check` + `astro build` (valida schema y medios) + escenarios manuales de
[quickstart.md](quickstart.md). Sin framework de tests ([research §10](research.md)).

**Target Platform**: navegadores modernos (móvil y escritorio); Cloudflare Worker con archivos estáticos.

**Project Type**: sitio web estático (single project).

**Performance Goals**: páginas sin JavaScript de cliente; imágenes servidas en formatos optimizados
por el build.

**Constraints**: salida 100 % estática; videos propios ≤ 10 MB c/u; sin cookies; responsive desde
360 px.

**Scale/Scope**: 3 páginas (`/`, `/projects/<id>/`, `/404`); 5 proyectos personales al lanzar más
los profesionales que el dueño agregue.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo se cumple | Estado |
|---|---|---|
| I. Sitio estático | Salida `static` por defecto, sin adaptador ni endpoints; ninguna página envía JS | ✅ |
| II. El contenido es datos | Carpeta + `index.md` por proyecto, schema tipado; personales con enlace, profesionales sin código (validado en el schema) | ✅ |
| III. Medios livianos | `<Image />` con `alt` obligatorio; videos ≤ 10 MB, sin `autoplay` | ✅ |
| IV. Spec antes que código | Este plan sigue a la spec aprobada; tareas en `/speckit-tasks` | ✅ |
| V. Stack cerrado | Solo `astro` + `@astrojs/check` + `typescript` (aprobadas por el dueño el 2026-10-23); CSS nativo | ✅ |
| Despliegue | Worker con static assets en `bmieres.cl`, único endpoint `/api/contact` (constitución 2.0.0); deploy del dueño | ✅ |
| Flujo | Dueño: Node, `npm install`, dev, build, deploy. Asistente: archivos y `astro check` | ✅ |

**Post-diseño**: sin cambios; no hay violaciones que justificar.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-portfolio/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── project-content.md
│   └── routes.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
Portfolio/web/                # creada con npm create astro (template minimal)
├── package.json              # scripts dev/build/preview/check
├── astro.config.mjs          # config mínima, salida estática
├── tsconfig.json             # extends astro/tsconfigs/strict
├── public/
│   ├── favicon.svg
│   └── videos/<id>/*.mp4     # clips propios
└── src/
    ├── content.config.ts     # colección "projects" + schema (unión personal/professional)
    ├── content/projects/
    │   └── <id>/index.md + imágenes
    ├── data/site.ts          # presentación: nombre, título, bio, enlaces
    ├── layouts/BaseLayout.astro   # <html>, meta, estilos globales
    ├── components/
    │   ├── ProfileHeader.astro    # presentación (FR-016)
    │   ├── ProjectCard.astro      # tarjeta del listado (FR-002)
    │   ├── ProjectLinks.astro     # botones de enlaces, oculto si no hay (edge case)
    │   ├── ProjectGallery.astro   # grilla de imágenes, sin JS
    │   └── ProjectVideos.astro    # <video> / embed YouTube / enlace
    ├── pages/
    │   ├── index.astro            # listado (getCollection + filtro draft + orden)
    │   ├── projects/[id].astro    # detalle (getStaticPaths + render)
    │   └── 404.astro
    └── styles/global.css          # variables, claro/oscuro, tipografía del sistema
```

**Structure Decision**: proyecto único de Astro en `Portfolio/web/`, creado con `npm create astro`
y separado de los artefactos de Spec Kit (`.specify/`, `specs/`) que quedan en la raíz de
`Portfolio/`. En Workers Builds, Root directory = `web` ([research §2](research.md)). Todas las rutas de
código de este plan y de los contratos son relativas a `web/`.

## Puntos de código clave

**Schema** (`src/content.config.ts`, resumen):

```ts
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '*/index.md' }),
  schema: ({ image }) => {
    const media = z.object({ src: image(), alt: z.string().min(1) });
    const base = { title, summary, stack, cover: media, images, videos, order, draft };
    return z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('personal'), ...base, links: personalLinks }),
      z.object({ kind: z.literal('professional'), ...base, company, period, links: professionalLinks }),
    ]);
  },
});
```

`personalLinks` exige al menos un `repo`; `professionalLinks` rechaza `repo`; las URLs rechazan
`TODO-` solo en producción; los videos `file` verifican con `fs.existsSync` que exista
`public/<path>`.

**Listado** (`src/pages/index.astro`): `getCollection('projects', ({ data }) => !data.draft)`,
ordenado por `order` y luego `title`. Si la lista queda vacía, muestra un mensaje.

**Detalle** (`src/pages/projects/[id].astro`): `getStaticPaths` devuelve
`{ params: { id }, props: { project } }` por cada proyecto publicado; el cuerpo se muestra con
`const { Content } = await render(project)`.

## Requisitos previos del dueño

1. **Actualizar Node.js** a ≥ 22.23.4: `winget upgrade --id OpenJS.NodeJS.22 -e` (hoy `v22.14.0`).
2. **Crear la app** desde `Portfolio/`:
   `npm create astro@latest web -- --template minimal --no-git --no-ai` (instala `astro`).
3. **Instalar las dependencias de desarrollo** en `web/` cuando la tarea lo pida:
   `npm install -D @astrojs/check typescript`.
4. Crear la cuenta de GitHub nueva antes de publicar (no bloquea el desarrollo).

## Complexity Tracking

Sin violaciones de la constitución.
