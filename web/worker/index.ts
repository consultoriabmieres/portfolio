// Worker del Portfolio: las páginas salen de dist/ (assets) y este código solo atiende /api/*.
// Contrato: specs/001-project-portfolio/contracts/api-contact.md

interface SendEmail {
  send(message: { to: string; from: string; subject: string; text: string }): Promise<unknown>;
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  EMAIL: SendEmail;
  // Secretos cargados en el panel de Cloudflare (o en .dev.vars en local)
  CONTACT_TO: string;
  TURNSTILE_SECRET: string;
}

interface ContactInput {
  name: string;
  email: string;
  message: string;
  website: string;
  turnstileToken: string;
}

const SENDER = 'formulario@bmieres.cl';
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseInput(raw: Record<string, unknown>): ContactInput {
  return {
    // Sin saltos de línea: el nombre va en el asunto del correo
    name: readString(raw.name).replace(/[\r\n]+/g, ' '),
    email: readString(raw.email),
    message: readString(raw.message),
    website: readString(raw.website),
    turnstileToken: readString(raw.turnstileToken),
  };
}

function invalidFields(input: ContactInput): string[] {
  const fields: string[] = [];
  if (input.name.length < 1 || input.name.length > 100) fields.push('name');
  if (input.email.length > 254 || !EMAIL_PATTERN.test(input.email)) fields.push('email');
  if (input.message.length < 10 || input.message.length > 5000) fields.push('message');
  return fields;
}

async function isHuman(token: string, secret: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const response = await fetch(SITEVERIFY_URL, { method: 'POST', body });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { ok: false, error: 'validation', fields: [] });
  }
  if (typeof raw !== 'object' || raw === null) {
    return json(400, { ok: false, error: 'validation', fields: [] });
  }

  const input = parseInput(raw as Record<string, unknown>);

  // Campo trampa: un humano no lo ve; si viene con algo es un bot. Se responde éxito sin enviar.
  if (input.website) return json(200, { ok: true });

  const fields = invalidFields(input);
  if (fields.length > 0) return json(400, { ok: false, error: 'validation', fields });

  const human = await isHuman(input.turnstileToken, env.TURNSTILE_SECRET, request.headers.get('CF-Connecting-IP'));
  if (!human) return json(403, { ok: false, error: 'captcha' });

  try {
    await env.EMAIL.send({
      to: env.CONTACT_TO,
      from: SENDER,
      subject: `Portfolio · Mensaje de ${input.name}`,
      text: [
        `Nombre: ${input.name}`,
        `Email: ${input.email}`,
        '',
        input.message,
        '',
        '— Enviado desde el formulario de bmieres.cl',
      ].join('\n'),
    });
  } catch (error) {
    console.error('Falló el envío del correo de contacto', error);
    return json(500, { ok: false, error: 'send' });
  }

  return json(200, { ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') return handleContact(request, env);
    if (pathname.startsWith('/api/')) return json(404, { ok: false, error: 'not_found' });
    return env.ASSETS.fetch(request);
  },
};
