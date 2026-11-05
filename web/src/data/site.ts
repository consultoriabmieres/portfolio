import { assertNoPlaceholders } from '../lib/placeholders';

// Presentación personal que se muestra en la cabecera del sitio
export interface SiteProfile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
}

export const site: SiteProfile = {
  name: 'Benjamín Mieres Méndez',
  title: 'Ingeniero Civil Informático',
  tagline: 'Software, IA aplicada, automatización e infraestructura cloud.',
  bio:
    'Desarrollo software, inteligencia artificial aplicada y automatización de procesos. ' +
    'Diseño y opero soluciones de extremo a extremo: aplicaciones web y móviles, agentes de IA, ' +
    'integraciones de datos e infraestructura cloud.',
  githubUrl: 'https://github.com/consultoriabmieres',
  linkedinUrl: 'https://www.linkedin.com/in/benjamin-mieres',
};

// Clave pública de Turnstile. En desarrollo se usa la clave de prueba de Cloudflare (siempre aprueba);
// en producción viene de la variable de build PUBLIC_TURNSTILE_SITE_KEY y es obligatoria.
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';
export const turnstileSiteKey: string = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? TURNSTILE_TEST_SITE_KEY;

if (import.meta.env.PROD && !import.meta.env.PUBLIC_TURNSTILE_SITE_KEY) {
  throw new Error('Falta la variable de build PUBLIC_TURNSTILE_SITE_KEY (clave pública de Turnstile)');
}

// No se publica con datos pendientes (cuenta de GitHub nueva aún sin crear)
assertNoPlaceholders('src/data/site.ts', Object.values(site));
