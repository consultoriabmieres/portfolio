import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const publicFileExists = (path: string) => existsSync(join(process.cwd(), 'public', path));

// Los marcadores TODO- se validan al generar las páginas (src/lib/placeholders.ts)
const httpsUrl = z.url({ protocol: /^https$/, message: 'La URL debe ser absoluta y empezar con https://' });

const link = z.object({
  type: z.enum(['repo', 'demo', 'other']),
  url: httpsUrl,
  label: z.string().trim().min(1).optional(),
});

const video = z.discriminatedUnion('source', [
  z.object({
    source: z.literal('file'),
    title: z.string().trim().min(1),
    path: z
      .string()
      .regex(/^\/.+\.mp4$/, 'El video debe ser un .mp4 con ruta desde public/, ej. /videos/<id>/demo.mp4')
      .refine(publicFileExists, { message: 'El archivo de video no existe en public/' }),
    poster: z
      .string()
      .startsWith('/')
      .refine(publicFileExists, { message: 'El poster no existe en public/' })
      .optional(),
  }),
  z.object({
    source: z.literal('youtube'),
    title: z.string().trim().min(1),
    videoId: z.string().regex(/^[\w-]{11}$/, 'El ID de YouTube tiene 11 caracteres'),
  }),
  z.object({
    source: z.literal('link'),
    title: z.string().trim().min(1),
    url: httpsUrl,
  }),
]);

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '*/index.md' }),
  schema: ({ image }) => {
    const media = z.object({
      src: image(),
      alt: z.string().trim().min(1, 'Toda imagen necesita texto alternativo'),
    });

    // Campos comunes a proyectos personales y profesionales
    const base = {
      title: z.string().trim().min(1),
      summary: z.string().trim().min(1).max(200, 'El resumen admite máximo 200 caracteres'),
      stack: z.array(z.string().trim().min(1)).min(1, 'Indica al menos una tecnología'),
      cover: media,
      images: z.array(media).default([]),
      videos: z.array(video).default([]),
      order: z.number().int(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
    };

    return z.discriminatedUnion('kind', [
      z.object({
        kind: z.literal('personal'),
        ...base,
        links: z
          .array(link)
          .min(1, 'Un proyecto personal necesita al menos un enlace')
          .refine((links) => links.some((l) => l.type === 'repo'), {
            message: 'Un proyecto personal necesita un enlace de tipo repo',
          }),
      }),
      z.object({
        kind: z.literal('professional'),
        ...base,
        company: z.string().trim().min(1),
        period: z.string().trim().min(1),
        links: z
          .array(link)
          .refine((links) => links.every((l) => l.type !== 'repo'), {
            message: 'Un proyecto profesional no puede enlazar código de la empresa',
          })
          .default([]),
      }),
    ]);
  },
});

export const collections = { projects };
