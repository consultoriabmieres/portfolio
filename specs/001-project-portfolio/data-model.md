# Data Model: Portfolio de proyectos

No hay base de datos. Los datos son archivos del repo que se validan al compilar.

## Project (colección `projects`)

Una carpeta por proyecto en `src/content/projects/<id>/`, con `index.md` (frontmatter + cuerpo en
Markdown) y sus imágenes. El `id` es el nombre de la carpeta y forma la URL `/projects/<id>/`.

### Campos comunes

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `kind` | `'personal' \| 'professional'` | Sí | Define las reglas de enlaces (abajo) |
| `title` | string | Sí | No vacío |
| `summary` | string | Sí | Resumen para la tarjeta; máx. 200 caracteres |
| `stack` | string[] | Sí | Al menos 1 tecnología |
| `cover` | `{ src: image(), alt: string }` | Sí | La imagen debe existir; `alt` no vacío |
| `images` | `{ src: image(), alt: string }[]` | No (default `[]`) | Cada imagen debe existir; `alt` no vacío |
| `videos` | `Video[]` | No (default `[]`) | Ver `Video` |
| `links` | `Link[]` | Según `kind` | Ver reglas por tipo |
| `order` | number entero | Sí | Menor = aparece antes; se permiten empates (desempate por `title`) |
| `draft` | boolean | No (default `false`) | Si es `true`, no se publica |
| `featured` | boolean | No (default `false`) | Si es `true`, su tarjeta ocupa una celda grande en su sección |
| cuerpo del Markdown | Markdown | Sí | Descripción completa del detalle; no vacío |

### Reglas por tipo

| | `personal` | `professional` |
|---|---|---|
| `company` | No aplica | Obligatorio (ej. "Rendering") |
| `period` | No aplica | Obligatorio, texto libre (ej. "2024 – actualidad") |
| `links` | Mín. 1, y al menos uno de tipo `repo` | Opcional (default `[]`); tipo `repo` prohibido |

## Link

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `type` | `'repo' \| 'demo' \| 'other'` | Sí | |
| `url` | string | Sí | URL absoluta `https://`; en build de producción no puede contener `TODO-` |
| `label` | string | No | Texto del botón; por defecto según `type` ("Código", "Demo", "Enlace") |

## Video

Unión discriminada por `source`:

| Campo | `source: 'file'` | `source: 'youtube'` | `source: 'link'` |
|---|---|---|---|
| `title` | Obligatorio | Obligatorio | Obligatorio |
| `path` | Ruta bajo `public/`, ej. `/videos/gymapp/demo.mp4`; el archivo debe existir y ser `.mp4` | — | — |
| `poster` | Opcional, ruta bajo `public/` | — | — |
| `videoId` | — | ID de YouTube (11 caracteres) | — |
| `url` | — | — | URL `https://` (Vimeo u otra) |

## SiteProfile (`src/data/site.ts`)

| Campo | Valor inicial |
|---|---|
| `name` | Benjamín Mieres Méndez |
| `title` | Ingeniero Civil Informático |
| `bio` | 2 a 3 líneas desde el perfil profesional del CV |
| `githubUrl` | `https://github.com/TODO-github-user` hasta que exista la cuenta nueva |
| `linkedinUrl` | `https://www.linkedin.com/in/benjamin-mieres` |


## ContactMessage (no se guarda; solo viaja del formulario al correo del dueño)

| Campo | Regla |
|---|---|
| `name` | 1 a 100 caracteres, sin espacios al inicio ni al final |
| `email` | Formato de email válido, máx. 254 caracteres |
| `message` | 10 a 5000 caracteres |
| `website` | Campo trampa oculto: MUST venir vacío; si trae algo, se responde éxito sin enviar |
| `turnstileToken` | Token de Turnstile (`cf-turnstile-response`), verificado en el servidor |

El destino (correo del dueño) es el secreto `CONTACT_TO` del Worker; nunca está en el repo.

## Estados

Un proyecto solo tiene dos estados: **borrador** (`draft: true`, no genera tarjeta ni página) y
**publicado**. No hay transiciones automáticas; el dueño cambia el campo y vuelve a publicar.
