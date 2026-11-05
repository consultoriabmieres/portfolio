# Feature Specification: Portfolio de proyectos

**Feature Branch**: `001-project-portfolio`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Portfolio personal que resume mis proyectos. Un visitante ve un listado de proyectos y puede entrar al detalle de cada uno. Cada proyecto muestra un resumen, las tecnologías usadas, imágenes, videos y enlaces al proyecto específico (repositorio, demo). Nada más: sin contacto, sin blog. Se publica en Vercel con una URL de vercel.app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el listado de proyectos (Priority: P1)

Un visitante (reclutador, colega, cliente) abre la URL pública del portfolio y ve de inmediato
todos los proyectos publicados. Cada uno aparece como una tarjeta con su nombre, un resumen corto,
las tecnologías usadas y una imagen de portada. Desde la tarjeta puede ir a los enlaces del
proyecto o entrar a su detalle.

**Why this priority**: es lo mínimo que hace útil al sitio. Con solo esta página el visitante ya
sabe qué proyectos existen y puede llegar a cada uno.

**Independent Test**: publicar el sitio con dos proyectos cargados, abrir la URL raíz y verificar
que ambos aparecen con nombre, resumen, tecnologías, portada y enlaces que funcionan.

**Acceptance Scenarios**:

1. **Given** hay proyectos publicados, **When** el visitante abre la página principal, **Then** ve
   una tarjeta por proyecto con nombre, resumen, tecnologías e imagen de portada.
2. **Given** un proyecto tiene enlace a repositorio y a demo, **When** el visitante hace clic en
   uno, **Then** se abre el destino correcto en una pestaña nueva.
3. **Given** el visitante usa un teléfono, **When** abre la página principal, **Then** las tarjetas
   se leen completas sin desplazamiento horizontal.

---

### User Story 2 - Ver el detalle de un proyecto (Priority: P2)

El visitante entra al detalle de un proyecto y ve una descripción más completa, todas sus imágenes,
sus videos y sus enlaces. Desde ahí puede volver al listado.

**Why this priority**: el detalle es lo que muestra el trabajo de verdad (capturas, videos de uso),
pero el listado ya aporta valor sin él.

**Independent Test**: abrir la dirección de detalle de un proyecto con dos imágenes y un video, y
verificar que se ven la descripción, la galería, el video, los enlaces y el regreso al listado.

**Acceptance Scenarios**:

1. **Given** el visitante está en el listado, **When** abre un proyecto, **Then** llega a una página
   propia de ese proyecto con su descripción completa, imágenes, videos y enlaces.
2. **Given** un proyecto tiene un video propio, **When** el visitante abre el detalle, **Then** el
   video aparece pausado y en silencio hasta que el visitante lo reproduce.
3. **Given** un proyecto tiene un video alojado en una plataforma externa, **When** el visitante abre
   el detalle, **Then** el video se ve incrustado en la página o como enlace a esa plataforma.
4. **Given** el visitante comparte la dirección del detalle, **When** otra persona la abre
   directamente, **Then** ve el mismo proyecto sin pasar por el listado.
5. **Given** el visitante está en el detalle, **When** usa el enlace de regreso, **Then** vuelve al
   listado.

---

### User Story 3 - Agregar o editar un proyecto (Priority: P3)

El dueño del portfolio agrega un proyecto nuevo (o corrige uno existente) escribiendo un único
archivo de texto con sus datos y dejando sus imágenes y videos al lado, sin tocar el diseño ni el
resto del sitio. Al volver a publicar, el proyecto aparece en el listado y tiene su detalle.

**Why this priority**: hace sostenible el portfolio, pero el visitante no lo ve directamente.

**Independent Test**: agregar un proyecto nuevo con solo crear su archivo y sus medios, publicar y
verificar que aparece en el listado y en su detalle sin haber modificado ningún otro archivo.

**Acceptance Scenarios**:

1. **Given** el sitio tiene N proyectos, **When** el dueño agrega el archivo de un proyecto nuevo y
   publica, **Then** el listado muestra N+1 proyectos y el nuevo tiene su página de detalle.
2. **Given** al archivo de un proyecto le falta un dato obligatorio, **When** el dueño intenta
   publicar, **Then** la publicación falla con un mensaje que indica el proyecto y el dato faltante.
3. **Given** el dueño marca un proyecto como borrador, **When** publica, **Then** ese proyecto no
   aparece en el listado ni tiene página de detalle.

---

### Edge Cases

- Un proyecto sin demo pública (por ejemplo, de código privado o que solo corre en local): muestra
  solo los enlaces que tenga, sin botones vacíos ni rotos.
- Un proyecto profesional sin ningún enlace: la tarjeta y el detalle no muestran una zona de
  enlaces vacía; el acceso al detalle sigue disponible.
- Un proyecto sin videos: el detalle no muestra una sección de videos vacía.
- Un proyecto con una sola imagen: el detalle no muestra controles de galería innecesarios.
- No hay ningún proyecto publicado: la página principal muestra un mensaje en lugar de una lista vacía.
- El visitante abre la dirección de un proyecto que no existe o que se quitó: ve una página de "no
  encontrado" con un enlace al listado.
- Una imagen referenciada en el archivo de un proyecto no existe: la publicación falla indicando
  qué archivo falta, en vez de publicar una imagen rota.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sitio MUST tener una página principal con el listado de todos los proyectos
  publicados.
- **FR-002**: Cada proyecto del listado MUST mostrar nombre, resumen corto, tecnologías usadas,
  imagen de portada y acceso a su detalle.
- **FR-003**: Cada proyecto MUST tener una página de detalle propia, con dirección estable y
  compartible, que muestre nombre, descripción completa, tecnologías, imágenes, videos y enlaces.
- **FR-004**: Cada proyecto personal MUST tener al menos un enlace (repositorio, demo u otro). Un
  proyecto profesional MAY no tener enlaces. Los enlaces externos MUST abrirse en una pestaña nueva.
- **FR-005**: Un proyecto MAY tener cero o más videos. Cada video es un archivo propio del sitio o
  una referencia a una plataforma externa de video.
- **FR-006**: Ningún video MUST reproducirse automáticamente con sonido.
- **FR-007**: Toda imagen MUST tener un texto alternativo que la describa.
- **FR-008**: Los proyectos MUST mostrarse en un orden que el dueño controla explícitamente.
- **FR-009**: El dueño MUST poder marcar un proyecto como borrador para que no se publique.
- **FR-010**: Agregar, editar o quitar un proyecto MUST requerir solo cambiar el archivo de ese
  proyecto y sus medios.
- **FR-011**: La publicación MUST fallar con un mensaje claro si a un proyecto le falta un dato
  obligatorio o un medio referenciado.
- **FR-012**: El sitio MUST mostrar una página de "no encontrado" para direcciones inexistentes,
  con enlace al listado.
- **FR-013**: El sitio MUST mostrarse correctamente desde ancho de teléfono hasta escritorio, sin
  desplazamiento horizontal.
- **FR-014**: Todo el contenido visible del sitio MUST estar en español.
- **FR-014b**: El dueño MUST poder marcar un proyecto como destacado.
- **FR-015** (enmendado 2026-11-05): El sitio MUST publicarse con HTTPS en el dominio propio
  `https://bmieres.cl`, y `www.bmieres.cl` MUST redirigir al dominio raíz.
- **FR-016**: El sitio MUST mostrar una presentación con nombre (Benjamín Mieres Méndez), título
  (Ingeniero Civil Informático), una bio de 2 a 3 líneas y enlaces a GitHub y LinkedIn. El email y
  el teléfono del dueño MUST NOT aparecer en el sitio (ver FR-026).
- **FR-017**: Cada proyecto MUST ser de uno de dos tipos, visible en su tarjeta y su detalle:
  **personal** (código propio, con enlace a su repositorio) o **profesional** (hecho para un
  empleador, con el nombre de la empresa y el período, sin código ni repositorio).
- **FR-018**: Al lanzar, el sitio MUST incluir los proyectos personales de `ProyectosPersonales/`
  (GymApp, GymApp2, app de tareas, panel de Trading y este Portfolio), cada uno con enlace a su
  repositorio en la cuenta personal de GitHub del dueño, y los proyectos profesionales de Rendering
  que el dueño elija.
- **FR-019**: Un proyecto profesional MUST NOT enlazar ni mostrar código de la empresa. Se presenta
  con descripción, avances, imágenes y videos.

#### Diseño visual (agregado 2026-10-23 tras revisar el MVP: el usuario lo encontró básico)

- **FR-020**: El sitio MUST tener una estética oscura de estilo tecnológico (referencia: sitios de
  Linear o Vercel): fondo oscuro con un brillo de color sutil, un color de acento, tipografía sans
  moderna y una tipografía monoespaciada para las tecnologías.
- **FR-021**: Toda página MUST tener una barra de navegación fija arriba, con fondo translúcido, las
  iniciales del dueño (enlace al inicio) y accesos a Proyectos, GitHub y LinkedIn.
- **FR-022**: La página principal MUST abrir con una sección de presentación de alto impacto: nombre
  en tamaño grande, rol, bio y llamadas a la acción ("Contáctame", "Ver proyectos", GitHub).
- **FR-023**: El listado MUST agrupar los proyectos en "Experiencia profesional" (primero, si hay) y
  "Proyectos personales", en una grilla donde un proyecto marcado como destacado ocupa una tarjeta
  más grande que el resto.
- **FR-024**: Las tarjetas MUST reaccionar al pasar el mouse (se elevan y su borde se ilumina) y las
  secciones MUST aparecer con una animación suave al hacer scroll, sin JavaScript y sin animación
  si el visitante pidió reducir movimiento.
- **FR-025**: Toda página MUST cerrar con un pie con el nombre del dueño y sus enlaces.

#### Contacto (agregado 2026-10-26; rehecho 2026-11-05 como formulario)

- **FR-026**: La página principal MUST tener una sección de contacto con un **formulario** (nombre,
  email de quien escribe y mensaje) y un enlace a LinkedIn. El email y el teléfono del dueño MUST
  NOT aparecer en el sitio ni en el repositorio. Sin WhatsApp.
- **FR-027**: El contacto MUST ser la acción más visible del sitio: botón destacado "Contacto" en la
  barra de navegación y "Contáctame" como primera llamada a la acción de la presentación, ambos
  llevando a la sección de contacto.
- **FR-028**: El formulario MUST validar los campos antes de enviar (nombre de 1 a 100 caracteres,
  email con formato válido, mensaje de 10 a 5000 caracteres) y el servidor MUST volver a validarlos.
- **FR-029**: El envío MUST estar protegido contra bots con Cloudflare Turnstile, verificado en el
  servidor, y con un campo trampa oculto que los humanos no completan.
- **FR-030**: Al enviar, el visitante MUST ver un mensaje claro de éxito ("Mensaje enviado") o de
  error con qué corregir o que lo intente de nuevo. El botón se desactiva mientras se envía.
- **FR-031**: Cada mensaje válido MUST llegar al correo del dueño con el nombre, el email y el texto
  de quien escribió. El sitio no guarda los mensajes.

Fuera de alcance: blog, buscador, filtros, comentarios, cuentas de
usuario, varios idiomas, guardar los mensajes de contacto, sección de experiencia laboral separada de los proyectos,
descarga del CV, código o repositorios de la empresa.

### Key Entities

- **Proyecto**: un trabajo del dueño. Tiene tipo (personal o profesional), nombre, resumen corto
  (para la tarjeta), descripción completa (para el detalle), tecnologías, imagen de portada,
  imágenes adicionales, videos, enlaces, posición en el orden y estado de borrador. Si es
  profesional, además tiene empresa y período.
- **Medio**: una imagen (con texto alternativo) o un video (archivo propio o referencia externa,
  con título) que pertenece a un proyecto.
- **Enlace**: un destino externo del proyecto, con tipo (repositorio, demo, otro) y dirección.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desde la página principal, un visitante llega al repositorio o la demo de cualquier
  proyecto con 2 clics o menos.
- **SC-002**: Agregar un proyecto nuevo modifica 0 archivos fuera de su archivo de datos y su carpeta
  de medios.
- **SC-003**: El 100 % de las imágenes publicadas tiene texto alternativo.
- **SC-004**: Ninguna página muestra desplazamiento horizontal en un ancho de 360 px.
- **SC-005**: Ninguna página publicada contiene enlaces internos rotos ni imágenes rotas.
- **SC-006**: Cada página de detalle se puede abrir directamente desde su dirección compartida.

## Assumptions

- El público son reclutadores, colegas y posibles clientes que llegan con el enlace del portfolio.
- El dueño escribe el contenido (textos, capturas, videos) de cada proyecto; el sitio no lo genera.
- Los videos largos se alojan en una plataforma externa; dentro del sitio solo van clips cortos.
- No hay datos personales de visitantes: el sitio no recolecta información ni usa cookies.
- El orden por defecto lo fija el dueño; no hay orden por fecha ni por popularidad.
- El dueño creará una cuenta de GitHub nueva para todos los proyectos de `ProyectosPersonales/`.
  Hasta que exista, su usuario y las direcciones de los repositorios quedan como marcador a
  completar; el sitio no se publica con marcadores pendientes.
- La bio se redacta a partir del perfil profesional del CV del dueño.
- Las imágenes y videos de proyectos profesionales no muestran datos de clientes ni información
  interna de la empresa; el dueño es responsable de que se puedan publicar.
- El contacto es por el formulario o por LinkedIn. El dueño responde desde su propio correo al
  email que dejó quien escribió.
