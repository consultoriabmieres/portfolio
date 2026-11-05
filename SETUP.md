# Portfolio: cómo se configuró

Registro de cómo se armó este proyecto: herramientas, pasos en orden y la lógica del sitio.
Las versiones son las instaladas el 2026-10-23.

## Qué es

| | |
|---|---|
| **Nombre** | Portfolio (Benjamín Mieres Méndez) |
| **Qué hace** | Sitio estático que resume proyectos personales y profesionales, con imágenes, videos, enlaces y contacto |
| **Stack** | Astro 7 + TypeScript estricto, CSS nativo, sin backend |
| **Forma de trabajo** | Spec-driven con GitHub Spec Kit |
| **Hosting** | Cloudflare Worker con archivos estáticos en `https://bmieres.cl` (pendiente de publicar) |

## Estructura

```text
Portfolio/
├── .git/                      # repo propio (rama main)
├── .claude/skills/speckit-*/  # skills de Spec Kit para Claude Code
├── .specify/                  # Spec Kit: constitución, plantillas, scripts PowerShell
│   └── memory/constitution.md # reglas fijas del proyecto (v1.1.0)
├── specs/001-project-portfolio/
│   ├── spec.md                # QUÉ hace el sitio (requisitos FR-001 a FR-029)
│   ├── plan.md                # CÓMO se construye
│   ├── research.md            # decisiones técnicas y por qué
│   ├── data-model.md          # campos de un proyecto
│   ├── contracts/             # formato de un proyecto y direcciones del sitio
│   ├── quickstart.md          # escenarios para validar a mano
│   └── tasks.md               # tareas, marcadas a medida que se completan
├── web/                       # la app Astro (todo el código vive aquí)
└── SETUP.md                   # este archivo
```

## Herramientas instaladas

| Herramienta | Versión | Para qué | Cómo se instaló |
|---|---|---|---|
| uv | 0.13.5 | Instalar la CLI de Spec Kit | `winget install --id=astral-sh.uv -e` |
| specify-cli | 1.2.3 | CLI de GitHub Spec Kit | `uv tool install specify-cli` |
| Node.js | 22.23.4 | Correr Astro (pide ≥ 22.23.4) | `winget upgrade --id OpenJS.NodeJS.22 -e` (estaba en 22.14.0) |
| astro | 7.4.2 | Framework del sitio | `npm create astro` (plantilla `minimal`) |
| @astrojs/check | 0.9.12 | `astro check` (diagnósticos de tipos) | `npm install -D` |
| typescript | 6.0.3 | Requisito de `astro check` | `npm install -D` |
| @types/node | 22.x | Tipos de `node:fs`/`node:path` usados por el schema | `npm install -D @types/node@22` |

`uv` y `specify` quedan en `C:\Users\usuario\.local\bin`, que se agregó al PATH del usuario con
`uv tool update-shell`.

## Pasos, en orden

### 1. Spec Kit

```powershell
cd C:\Users\usuario\OneDrive\Desktop\ProyectosPersonales
specify init Portfolio --integration claude --script ps --non-interactive
```

Creó `.specify/` (plantillas y scripts PowerShell) y 10 skills en `.claude/skills/`. Después:

```powershell
cd Portfolio
git init -b main
```

**Cómo se usan las skills.** El workspace se abre desde `ProyectosPersonales/` para conservar la
`.claude/` raíz (denies de secretos, bloqueo de `git push`, hook de solo lectura). Desde ahí el menú
`/` no muestra las skills de `Portfolio/.claude/skills/`, pero Claude Code las carga apenas se
trabaja con un archivo de `Portfolio/`. Se piden por nombre ("corre la constitución", "pasa a
specify") y Claude las invoca.

### 2. Flujo spec-driven

Cada etapa produce un archivo, se aprueba y recién ahí se pasa a la siguiente:

| Etapa | Skill | Resultado |
|---|---|---|
| Constitución | `speckit-constitution` | `.specify/memory/constitution.md`: sitio estático, contenido como datos, medios livianos, spec antes que código, stack cerrado |
| Especificación | `speckit-specify` | `spec.md`: historias de usuario, requisitos, criterios de éxito |
| Plan | `speckit-plan` | `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` |
| Tareas | `speckit-tasks` | `tasks.md` |
| Implementación | `speckit-implement` | Código en `web/` y tareas marcadas `[X]` |

Los cambios de alcance posteriores (rediseño oscuro, contacto) se escribieron primero en la spec y
las tareas, y después en el código.

### 3. App Astro

```powershell
cd C:\Users\usuario\OneDrive\Desktop\ProyectosPersonales\Portfolio
npm create astro@latest web -- --template minimal --no-git --no-ai --install --yes --skip-houston
cd web
npm install -D @astrojs/check typescript
npm install -D @types/node@22
```

- `web/` separa la app de los archivos de Spec Kit.
- `--no-git` porque `Portfolio/` ya es un repo; `--no-ai` porque los archivos para agentes los
  define Spec Kit.
- Se agregó el script `"check": "astro check"` a `web/package.json`.

## Lógica del sitio

### Contenido como datos

Cada proyecto es una carpeta `web/src/content/projects/<id>/` con `index.md` (frontmatter + texto)
y sus imágenes. El nombre de la carpeta es la URL del detalle: `/projects/<id>/`. Para agregar un
proyecto solo se crea una carpeta; no se toca código.

El schema está en `web/src/content.config.ts` y el build falla si un proyecto no lo cumple:

| Regla | Dónde se valida |
|---|---|
| Dos tipos: `personal` y `professional` | Unión discriminada por `kind` |
| Personal: al menos un enlace, y uno de tipo `repo` | `refine` sobre `links` |
| Profesional: `company` y `period` obligatorios, **nunca** enlace `repo` | `refine` sobre `links` |
| Resumen de máximo 200 caracteres; al menos una tecnología | `max(200)`, `min(1)` |
| Toda imagen con texto alternativo y archivo existente | `image()` de Astro + `alt` obligatorio |
| Videos propios `.mp4` en `public/` que existan | `refine` con `fs.existsSync` |
| `order` para el orden, `draft` para ocultar, `featured` para la tarjeta grande | Campos con default |

### Marcadores pendientes

Mientras no exista la cuenta nueva de GitHub, las URLs usan `TODO-github-user`.
`web/src/lib/placeholders.ts` hace fallar `npm run build` si queda alguno; `npm run dev` funciona
igual. No está en el schema porque `astro check` también sincroniza el contenido en modo producción
y fallaría.

### Contacto

`web/src/components/Contact.astro`: formulario (nombre, email, mensaje) con widget de Turnstile,
campo trampa oculto y enlace a LinkedIn. Envía por `fetch` a `POST /api/contact`, que atiende
`web/worker/index.ts`: valida los campos, verifica Turnstile en `siteverify` y manda el correo con
el binding `send_email` desde `formulario@bmieres.cl` al secreto `CONTACT_TO`. El email y el
teléfono del dueño no están en el sitio ni en el repo. Contrato:
`specs/001-project-portfolio/contracts/api-contact.md`.

### Diseño

- Tema oscuro estilo tech en `web/src/styles/global.css` (variables de color, brillos de fondo,
  grilla sutil).
- Fuentes Inter y JetBrains Mono con la Fonts API integrada de Astro (`astro.config.mjs`): se
  descargan al compilar y se sirven desde el propio sitio.
- Animación de entrada al hacer scroll solo con CSS, desactivada si el sistema pide reducir
  movimiento.
- El único JavaScript del sitio es el del formulario de contacto (envío y widget de Turnstile).

### Páginas y componentes

| Archivo | Qué hace |
|---|---|
| `src/pages/index.astro` | Hero, secciones "Experiencia profesional" y "Proyectos personales", contacto |
| `src/layouts/BaseLayout.astro` | `<html lang="es">`, fuentes, navegación y pie |
| `src/components/SiteNav.astro` | Barra fija con botón "Contacto" destacado |
| `src/components/Hero.astro` | Presentación con "Contáctame" como acción principal |
| `src/components/ProjectCard.astro` | Tarjeta de proyecto (variante destacada) |
| `src/components/ProjectLinks.astro` | Botones de enlaces; no muestra nada si no hay |
| `src/components/Contact.astro` | Sección de contacto |
| `src/components/SiteFooter.astro` | Pie |
| `src/data/site.ts` | Nombre, título, bio, enlaces y clave pública de Turnstile |
| `src/pages/projects/[id].astro` | Detalle de cada proyecto (portada, texto, galería, videos, enlaces) |
| `src/pages/404.astro` | Página "no encontrada" (la usa el Worker con `not_found_handling`) |
| `worker/index.ts` | Worker: `POST /api/contact`; el resto lo sirven los assets |

## Decisiones

El detalle con alternativas evaluadas está en `specs/001-project-portfolio/research.md`.

| Decisión | Por qué | Descartado |
|---|---|---|
| Astro en vez de Next.js o SvelteKit | Un portfolio es casi todo contenido; Astro envía HTML sin JS y amplía el stack con una arquitectura nueva (islands) | SvelteKit (pensado para apps interactivas) |
| Spec Kit oficial en vez de plantillas propias | Flujo estándar y versionado; se pidió uno "profesional" | Skills hechas a mano |
| Workspace abierto desde la raíz | Conserva los denies de secretos, el bloqueo de `git push` y el hook de la `.claude/` raíz, que no se heredan | Abrir `Portfolio/` sola (menú `/` completo, pero sin esas protecciones) |
| App en `web/` creada con `npm create astro` | Separa código de artefactos de Spec Kit y usa el generador oficial | Archivos base escritos a mano en la raíz |
| Sitio 100 % estático, sin adaptador | Nada que mantener ni pagar; Pages lo sirve sin configuración | SSR o funciones serverless |
| Cloudflare en `bmieres.cl` en vez de Vercel `*.vercel.app` | El DNS ya está en Cloudflare: el dominio y el HTTPS se conectan solos, y queda todo en una cuenta junto a R2 | Vercel (registros DNS a mano); servirlo desde el VPS (gasta RAM) |
| Formulario de contacto en vez de email y WhatsApp visibles | Codificar el email en el HTML solo frena bots simples; con formulario, el email y el teléfono no están en el sitio ni en el repo | Email y teléfono codificados; formulario con un servicio externo |
| Worker con archivos estáticos en vez de Pages | Pages Functions no soporta el binding `send_email`; el Worker sí, y envía gratis a direcciones verificadas | Pages + otro servicio de correo; API en el VPS (depende del servidor y de una clave SMTP) |
| Un Markdown por proyecto con schema tipado | Agregar un proyecto es crear una carpeta; los errores se detectan al compilar | Un JSON único; MDX (dependencia extra) |
| Proyectos personales vs profesionales | Los de Rendering se muestran sin código de la empresa; el schema lo garantiza | Dos colecciones separadas |
| Videos propios en `public/` o embed de YouTube sin cookies | `astro:assets` no procesa video; `youtube-nocookie` evita cookies de seguimiento | Reproductor JS |
| Bloqueo de `TODO-` al generar páginas, no en el schema | `astro check` corre en modo producción y fallaba con el schema | Validarlo en el schema |
| Tema solo oscuro, Inter + JetBrains Mono | El primer diseño (claro/oscuro, fuente del sistema) se vio básico; las fuentes vienen con la Fonts API de Astro, sin dependencias | Tailwind; Google Fonts por `<link>` |
| Contacto como acción principal | Lo más importante para quien llega al sitio: botón en la barra y primera acción del hero | — |
| `@types/node` como única dependencia extra | Los tipos que exige `astro check` para validar que los videos existan | Quitar esa validación |

## Comandos

Todos se corren dentro de `Portfolio/web/`.

| Comando | Qué hace | Quién lo corre |
|---|---|---|
| `npm run dev` | Servidor local en `http://localhost:4321` con recarga automática | Benjamín |
| `npm run check` | Diagnósticos de tipos (`astro check`) | Claude |
| `npm run build` | Valida el contenido y genera el sitio en `dist/` | Claude |
| `npm run preview` | Sirve el build final en local | Benjamín |

## Publicación (pendiente)

1. ✅ Cuenta de GitHub `consultoriabmieres`; `TODO-github-user` reemplazado (el build ya pasa).
2. Crear el repo `consultoriabmieres/portfolio` y subir `Portfolio/`.
3. Cloudflare → **Email Routing** en `bmieres.cl` y verificar el correo de destino.
4. Cloudflare → **Turnstile**: widget para `bmieres.cl` (clave pública y secreta).
5. Cloudflare → Workers & Pages → crear el Worker `portfolio` desde el repo (Workers Builds):
   root `web`, build `npm run build`, deploy `npx wrangler deploy`. Variable de build
   `PUBLIC_TURNSTILE_SITE_KEY`; secretos `CONTACT_TO` y `TURNSTILE_SECRET`.
6. `wrangler.jsonc` ya declara `bmieres.cl` como Custom Domain. `www.bmieres.cl` se redirige al
   raíz con una Redirect Rule.

El Worker solo corre para `/api/*` (`run_worker_first`); las páginas se sirven directo de `dist/`.
Para probarlo en local: copiar `web/.dev.vars.example` a `web/.dev.vars` y correr
`npm run worker:dev` (usa las claves de prueba de Turnstile).

## Estado

| Hecho | Pendiente |
|---|---|
| Constitución (2.0.0), spec, plan y tareas | Publicación en Cloudflare |
| Página de detalle de cada proyecto y 404 (US2) | |
| Formulario de contacto con Worker y Turnstile | |
| Listado con rediseño oscuro | Guía para agregar proyectos (US3) |
| 5 proyectos personales y 5 profesionales con texto y portadas provisorias | Capturas y videos reales |
| Sección de contacto | Repo en GitHub, deploy en Cloudflare Pages (`bmieres.cl`), CI/CD |

Historial: `git log --oneline` dentro de `Portfolio/`.
