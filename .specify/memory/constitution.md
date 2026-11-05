# Portfolio Constitution

## Core Principles

### I. Sitio estático por defecto

- Las páginas MUST compilarse a HTML estático (salida `static` de Astro). No hay SSR, base de
  datos ni backend propio.
- **Única excepción**: un Worker de Cloudflare atiende `/api/contact` para el formulario de
  contacto (validar, verificar Turnstile y enviar el mensaje al dueño). Cualquier otro endpoint
  requiere enmendar esta constitución.
- Fuera de alcance: blog, autenticación, analítica con cookies, almacenar los mensajes.
- El JavaScript del cliente MUST limitarse a lo que una spec aprobada justifique. Por defecto,
  una página no envía JS.

Razón: el sitio solo muestra proyectos. Lo estático es más rápido, más barato y no tiene nada
que mantener. El formulario existe para no publicar el email ni el teléfono del dueño (enmienda
2.0.0).

### II. El contenido es datos

- Cada proyecto MUST ser un único archivo Markdown dentro de una content collection de Astro,
  con frontmatter validado por un schema tipado.
- Agregar, editar o quitar un proyecto MUST requerir solo tocar su archivo y sus medios, nunca
  componentes ni páginas.
- Cada proyecto incluye como mínimo: título, resumen y stack. Los proyectos personales MUST
  tener al menos un enlace. Los proyectos profesionales (hechos para un empleador) MUST NOT
  enlazar ni mostrar código de la empresa. Las imágenes, los videos y el resto de los campos los
  define la spec.

Razón: el portfolio crece agregando archivos, sin tocar código.

### III. Medios livianos y accesibles

- Las imágenes locales MUST pasar por `astro:assets` para que el build genere tamaños y formatos
  optimizados. Toda imagen MUST tener texto alternativo.
- Videos: solo clips cortos en `.mp4` comprimido dentro del repo, o un enlace o embed externo
  (YouTube/Vimeo) para lo largo. El límite de peso por archivo lo fija el plan.
- Ningún video se reproduce con sonido automáticamente.

Razón: los medios pesados hacen lentos el sitio y cada deploy.

### IV. Spec antes que código (NO NEGOCIABLE)

- No se escribe código de la aplicación sin spec, plan y tareas aprobados por el usuario.
- Cada etapa (constitución → spec → plan → tareas → implementación) se aprueba antes de pasar a
  la siguiente.
- Un cambio de comportamiento se corrige primero en la spec y después en el código.

Razón: las decisiones quedan escritas y versionadas, no dispersas en conversaciones.

### V. Stack cerrado y simplicidad

- Stack: Astro + TypeScript en modo estricto. Usar los estilos nativos de Astro (CSS con alcance
  por componente) salvo que el plan apruebe otra cosa.
- No se agregan dependencias, integraciones ni frameworks de UI (React, Vue, Svelte, Tailwind,
  etc.) sin preguntar al usuario y dejarlo justificado en el plan.
- Ante dos soluciones, se elige la que tenga menos piezas.

Razón: el proyecto existe para aprender Astro a fondo, no para acumular capas.

## Restricciones técnicas y de despliegue

- Hosting: un Cloudflare Worker con archivos estáticos (Workers static assets), en el dominio
  propio `bmieres.cl` (DNS en la misma cuenta de Cloudflare), con `www.bmieres.cl` redirigiendo al
  raíz. El sitio no corre en el VPS. Se usa Worker y no Pages porque Pages Functions no soporta el
  binding `send_email`.
- Datos de contacto: el email y el teléfono del dueño MUST NOT aparecer en el sitio ni en el
  repositorio. El destino de los mensajes es un secreto del Worker.
- El deploy (conectar el repo, publicar) lo hace el usuario. El asistente deja el proyecto listo
  para compilar.
- Idioma: el contenido del sitio va en español neutro. El código (nombres, archivos, rutas) va en
  inglés. Los comentarios en el código van en español.
- Secretos: solo el Worker los tiene (clave secreta de Turnstile, correo de destino). Se cargan en
  el panel de Cloudflare; nunca van en el repo ni en el código del cliente.
- Diseño responsive: el sitio MUST verse bien desde ancho de teléfono hasta escritorio, sin scroll
  horizontal.

## Flujo de trabajo y calidad

- Spec Kit se invoca desde la raíz del workspace (`ProyectosPersonales/`). Sus scripts se corren
  con `Portfolio/` como raíz.
- El usuario corre instalaciones (`npm install`), el servidor de desarrollo, el build y el deploy.
  El asistente corre chequeos puntuales sobre lo que tocó (`astro check`, lint).
- Una tarea se marca como hecha cuando su código existe y el chequeo de tipos pasa sin errores.
- Git: ramas y commits al cerrar cada etapa o tarea, sin `push`, `pull` ni reescribir historia.

## Governance

- Esta constitución prevalece sobre cualquier otra práctica del proyecto. Las specs, planes y
  tareas MUST respetarla, y `/speckit-analyze` la usa como referencia de cumplimiento.
- Para enmendarla: el usuario propone o aprueba el cambio, se edita con `/speckit-constitution` y
  se actualiza la versión.
- Versionado semántico: MAJOR si se quita o redefine un principio, MINOR si se agrega uno o una
  sección, PATCH si solo cambia la redacción.
- Las reglas generales del workspace (`ProyectosPersonales/CLAUDE.md`) siguen vigentes. Ante un
  conflicto, la regla más restrictiva gana y se avisa al usuario.

**Version**: 2.0.0 | **Ratified**: 2026-10-23 | **Last Amended**: 2026-11-05
