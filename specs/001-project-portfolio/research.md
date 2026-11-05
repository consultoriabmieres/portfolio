# Research: Portfolio de proyectos

Fuentes: documentación oficial de Astro (content collections, images, install, deploy en Vercel,
CLI reference, routing) y README de `create-astro`, consultadas el 2026-10-23.

## 1. Versión de Astro y Node.js

- **Decision**: Astro 7 (última estable al 2026-10-23), Node.js LTS ≥ 22.23.4.
- **Rationale**: la guía de instalación exige "Node.js `v22.23.4` or higher" y no soporta versiones
  impares. La máquina del dueño tiene `v22.14.0`, que no alcanza: **actualizar Node es requisito
  previo**.
- **Alternatives considered**: fijar una versión anterior de Astro para usar Node 22.14. Se
  descarta porque el proyecto existe para aprender la versión actual.

## 2. Cómo crear el proyecto

- **Decision**: la app vive en `Portfolio/web/`, creada por el dueño con el generador oficial:
  `npm create astro@latest web -- --template minimal --no-git --no-ai`. Spec Kit queda en la raíz
  de `Portfolio/`.
- **Rationale**: `create-astro` arma una carpeta nueva sin chocar con `.specify/` ni `specs/`; se
  usa la plantilla oficial (TypeScript `strict` por defecto). `--no-git` porque `Portfolio/` ya es
  un repo; `--no-ai` porque los archivos para agentes ya los define Spec Kit.
- **Consecuencias**: en Cloudflare Pages se configura **Root directory: `web`**; `npm install`, `dev` y
  `build` se corren dentro de `web/`.
- **Alternatives considered**: escribir los archivos base a mano en la raíz de `Portfolio/` (mezcla
  la app con los artefactos de Spec Kit y se pierde el generador oficial).

## 3. Modelo de contenido

- **Decision**: una content collection `projects` en `src/content.config.ts` con
  `glob({ base: './src/content/projects', pattern: '*/index.md' })`. Cada proyecto es una carpeta
  con su `index.md` y sus imágenes al lado. El schema usa `z` de `astro/zod` y el helper `image()`.
- **Rationale**: la carpeta por proyecto cumple FR-010 (todo lo del proyecto vive junto). El helper
  `image()` valida que la imagen exista y la optimiza; si falta, el build falla (FR-011).
- **Alternatives considered**: un único JSON/YAML con todos los proyectos (rompe FR-010); MDX
  (agrega una integración sin necesidad, viola el principio V).

## 4. Tipos personal / profesional

- **Decision**: unión discriminada de Zod por el campo `kind`: `personal` exige al menos un enlace
  y uno de tipo `repo`; `professional` exige `company` y `period`, los enlaces son opcionales y el
  tipo `repo` está prohibido.
- **Rationale**: la regla de FR-004 y FR-019 queda garantizada por el build, no por disciplina.
- **Alternatives considered**: dos colecciones separadas (duplica páginas y componentes).

## 5. Videos

- **Decision**: dos variantes por video. **Archivo propio**: `.mp4` en `public/videos/<id>/`,
  referenciado por ruta y mostrado con `<video controls muted playsinline preload="metadata">`, sin
  `autoplay`. **Externo**: YouTube vía `youtube-nocookie.com/embed/<id>` con `loading="lazy"`, o un
  enlace simple para otras plataformas. Límite propuesto: **10 MB por archivo de video en el
  repo** (decisión del proyecto, ajustable por el dueño).
- **Rationale**: `astro:assets` no procesa video, así que los archivos van en `public/`. Como el
  schema no puede usar `image()` para ellos, un `refine` comprueba con `fs.existsSync` que el
  archivo exista (FR-011). `youtube-nocookie` evita cookies de seguimiento (constitución, principio I).
- **Alternatives considered**: alojar todos los videos en YouTube (obliga a subir clips cortos
  como videos públicos o no listados); un reproductor JS (envía JS sin necesidad).

## 6. Imágenes y galería

- **Decision**: portada y galería con `<Image />` de `astro:assets`. La galería es una grilla CSS
  sin JavaScript; cada imagen abre su archivo original en una pestaña nueva.
- **Rationale**: `alt` es obligatorio en `<Image />` y en el schema (FR-007, SC-003). Cero JS de
  cliente (principio I).
- **Alternatives considered**: lightbox con JS (se puede agregar en otra feature si hace falta).

## 7. Presentación personal

- **Decision**: datos en `src/data/site.ts` (nombre, título, bio, enlaces a GitHub y LinkedIn),
  usados por el componente `Header`.
- **Rationale**: es contenido único, no una colección; un módulo tipado es lo más simple.

## 8. Marcadores pendientes (cuenta de GitHub nueva)

- **Decision**: mientras la cuenta no exista, las URLs usan el usuario `TODO-github-user`. Un
  chequeo al generar las páginas (`src/lib/placeholders.ts`, usado por `site.ts` y por los
  componentes que muestran enlaces) hace fallar el **build de producción** si queda ese marcador;
  en desarrollo (`astro dev`) solo se muestra. No va en el schema porque `astro check` sincroniza
  el contenido en modo producción y fallaría también (verificado al implementar).
- **Rationale**: cumple el supuesto de la spec ("el sitio no se publica con marcadores pendientes")
  sin bloquear el desarrollo local.

## 9. Despliegue: Cloudflare Worker con archivos estáticos (revisado 2026-11-05)

- **Decision final**: un Worker con static assets. `web/wrangler.jsonc` declara `assets.directory:
  ./dist` y `run_worker_first: ["/api/*"]`: las páginas se sirven directo desde `dist/` y solo
  `/api/*` ejecuta `web/worker/index.ts`. Deploy con **Workers Builds** (integración de GitHub),
  root `web`, build `npm run build`, deploy `npx wrangler deploy`. Dominio `bmieres.cl` como Custom
  Domain del Worker; `www` redirigido con una Redirect Rule de Cloudflare.
- **Por qué no Pages**: la página de bindings de Pages Functions dice "Pages Functions only support
  a subset of all bindings" y `send_email` no está en la lista. Workers sí lo soporta.
- **Envío de correo**: binding `send_email` sin restricción de destino en el código; el destino sale
  del secreto `CONTACT_TO`. Según la doc de Email Service, sin dominio de envío "onboarded" solo se
  puede enviar a direcciones verificadas de la cuenta, y esos envíos "are always free". Remitente
  `formulario@bmieres.cl` (debe ser del dominio con Email Routing). Se usa la API estructurada
  `env.EMAIL.send({ to, from, subject, text })`, la recomendada "for new code".
- **Turnstile**: widget con `https://challenges.cloudflare.com/turnstile/v0/api.js` (no se puede
  proxiar ni cachear) y verificación obligatoria en `POST
  https://challenges.cloudflare.com/turnstile/v0/siteverify` con `secret` y `response`. El token
  dura 300 s y es de un solo uso. En desarrollo se usan las claves de prueba públicas de Cloudflare.

### 9a. (histórico) Cloudflare Pages, descartado el mismo día

- **Decision**: Cloudflare Pages con integración de GitHub, salida estática sin adaptador, dominio
  `bmieres.cl` y `www` redirigido al raíz. Configuración: Root directory `web`, build command
  `npm run build`, build output `dist`, variable `NODE_VERSION=22.23.4`.
- **Rationale**: el DNS de `bmieres.cl` ya está en Cloudflare, así que Pages crea el registro del
  dominio raíz solo ("Cloudflare will proceed by creating a CNAME record for you"). La guía de
  Astro en Pages usa `npm run build` y `dist`; el adaptador `@astrojs/cloudflare` es solo para SSR,
  que la constitución prohíbe. La imagen de build v3 trae Node 22.23.4, el mínimo de Astro 7; la
  variable lo fija por si cambia el default. Además concentra DNS, sitio y R2 en una cuenta
  (ver `OVH/decisiones.html`).
- **Alternatives considered**: Vercel (habría que crear a mano los registros en Cloudflare);
  servirlo desde el VPS con Dokploy (gasta RAM del servidor sin necesidad).
- **Requisito**: el repo debe estar en GitHub (`consultoriabmieres`).

## 10. Verificación

- **Decision**: `astro check` (tipos y diagnósticos de `.astro`) + `astro build` (valida el schema
  de cada proyecto y genera el sitio) + la guía manual de `quickstart.md`. Sin framework de tests.
- **Rationale**: el sitio no tiene lógica propia más allá del schema, y el build ya falla ante datos
  inválidos. Un framework de tests agregaría una dependencia sin cubrir nada nuevo.
- **Pendiente de confirmar al instalar**: la doc consultada no dice qué paquetes necesita
  `astro check`. Si al correrlo pide `@astrojs/check` y `typescript`, se agregan como dependencias
  de desarrollo (ya incluidas en la lista de dependencias del plan).

## 11. Estilos

- **Decision** (revisada 2026-10-23, FR-020 a FR-025): CSS nativo de Astro con un `global.css` de
  variables; tema **solo oscuro** estilo tech (fondo casi negro, brillos radiales de acento, grilla
  sutil de fondo). Tipografías **Inter** (texto) y **JetBrains Mono** (tecnologías) con la **Fonts
  API integrada de Astro** (`fonts` en `astro.config.mjs` + `<Font />` de `astro:assets`, provider
  Fontsource): se descargan al compilar y se sirven desde el propio sitio. Animación de entrada
  con `animation-timeline: view()` dentro de `@supports` y `prefers-reduced-motion`.
- **Rationale**: el MVP con tipografía del sistema y tarjetas planas se veía básico. La Fonts API
  es parte de Astro (no suma dependencias, principio V) y no hace pedidos a Google en el navegador
  (sin cookies, principio I). Las animaciones por CSS mantienen cero JS.
- **Alternatives considered**: Tailwind (dependencia y otra sintaxis, principio V); Google Fonts
  por `<link>` (pedido a terceros en cada visita); animaciones con JS (IntersectionObserver).
