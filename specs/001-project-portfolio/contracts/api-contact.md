# Contrato: POST /api/contact

Lo atiende `web/worker/index.ts`. Mismo origen que el sitio (`https://bmieres.cl`), sin CORS.

## Request

`POST /api/contact` con `Content-Type: application/json`:

```json
{
  "name": "Ana Pérez",
  "email": "ana@example.com",
  "message": "Hola, vi tu portfolio y...",
  "website": "",
  "turnstileToken": "<cf-turnstile-response>"
}
```

## Responses

| Código | Cuerpo | Cuándo |
|---|---|---|
| `200` | `{ "ok": true }` | Mensaje enviado, o campo trampa `website` con contenido (no se envía nada) |
| `400` | `{ "ok": false, "error": "validation", "fields": ["email"] }` | Algún campo no cumple [data-model.md](../data-model.md) |
| `403` | `{ "ok": false, "error": "captcha" }` | Turnstile falta, venció o no es válido |
| `405` | `{ "ok": false, "error": "method" }` | Método distinto de `POST` |
| `500` | `{ "ok": false, "error": "send" }` | Falló el envío del correo |

Cualquier otra ruta bajo `/api/` responde `404`.

## Correo que recibe el dueño

- **De:** `Portfolio <formulario@bmieres.cl>`
- **Para:** el secreto `CONTACT_TO`
- **Asunto:** `Portfolio · Mensaje de <name>`
- **Texto:** nombre, email y mensaje de quien escribió, para responderle desde el propio correo.

## Configuración del Worker

| Nombre | Tipo | Dónde se define |
|---|---|---|
| `EMAIL` | Binding `send_email` | `web/wrangler.jsonc` |
| `ASSETS` | Binding de archivos estáticos | `web/wrangler.jsonc` |
| `CONTACT_TO` | Secreto | Panel de Cloudflare (o `.dev.vars` en local) |
| `TURNSTILE_SECRET` | Secreto | Panel de Cloudflare (o `.dev.vars` en local) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Variable de build (pública) | Variables de build de Workers Builds |
