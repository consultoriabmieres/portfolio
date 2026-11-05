// Marcador de datos pendientes (ej. cuenta de GitHub aún no creada).
// Se tolera en desarrollo; al generar las páginas en el build de producción hace fallar la publicación.
// No va en el schema porque `astro check` también sincroniza el contenido en modo producción.
export const PLACEHOLDER = 'TODO-';

export function assertNoPlaceholders(source: string, values: string[]): void {
  if (!import.meta.env.PROD) return;
  const pending = values.filter((value) => value.includes(PLACEHOLDER));
  if (pending.length > 0) {
    throw new Error(
      `${source}: tiene el marcador ${PLACEHOLDER} (${pending.join(', ')}); reemplázalo antes de publicar`,
    );
  }
}
