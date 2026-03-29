import type { Category } from '../models/category.model';

/** Paleta para categorías sin color definido (tonos distintos, legibles en UI). */
const ACCENT_PALETTE = [
  '#3880ff',
  '#2dd36f',
  '#ffc409',
  '#eb445a',
  '#9260ff',
  '#ff6b35',
  '#00bcd4',
  '#7c4dff',
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Color de acento estable a partir del id (si no hay `color` en la categoría). */
export function accentFromCategoryId(id: string): string {
  return ACCENT_PALETTE[hashString(id) % ACCENT_PALETTE.length];
}

/** Resuelve el hex de acento (#RRGGBB) para una categoría. */
export function resolveCategoryAccent(category: Category | undefined): string {
  if (!category) {
    return '#3880ff';
  }
  const raw = category.color?.trim();
  if (raw && /^#[0-9A-Fa-f]{6}$/.test(raw)) {
    return raw.toLowerCase();
  }
  return accentFromCategoryId(category.id);
}

/** Mezcla el acento con blanco para fondos suaves (menos contraste). */
export function softBackgroundFromAccent(hex: string, whiteMix = 0.60): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const w = whiteMix;
  const nr = Math.round(255 * w + r * (1 - w));
  const ng = Math.round(255 * w + g * (1 - w));
  const nb = Math.round(255 * w + b * (1 - w));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

const DONE_TINT = 'rgb(232, 248, 239)';

/** Estilos inline para la tarjeta de tarea: sin categoría = blanco; con categoría = tinte suave del color. */
export function taskCardSurfaceStyles(
  categoryId: string | undefined,
  categories: Category[],
  completed: boolean,
): Record<string, string> {
  if (categoryId == null || categoryId === '') {
    const base = '#ffffff';
    if (completed) {
      return {
        background: `linear-gradient(135deg, ${base} 0%, ${DONE_TINT} 100%)`,
      };
    }
    return { background: base };
  }
  const cat = categories.find((c) => c.id === categoryId);
  const soft = softBackgroundFromAccent(resolveCategoryAccent(cat));
  if (completed) {
    return {
      background: `linear-gradient(135deg, ${soft} 0%, ${DONE_TINT} 100%)`,
    };
  }
  return { background: soft };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Color de primer plano legible sobre el acento completo (listado de categorías).
 * No se usa en la lista de tareas (ahí el fondo es el tinte suave).
 */
export function contrastingForegroundForAccent(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const linearize = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const L =
    0.2126 * linearize(r) +
    0.7152 * linearize(g) +
    0.0722 * linearize(b);
  return L > 0.55 ? '#1a1a1a' : '#ffffff';
}

/**
 * Estilos para tarjetas en la pantalla **Categorías**: color elegido por el usuario
 * (o paleta automática) **sin** mezcla con blanco. El tinte suave queda solo en tareas.
 */
export function categoryListCardSurface(category: Category): Record<string, string> {
  const accent = resolveCategoryAccent(category);
  const fg = contrastingForegroundForAccent(accent);
  return {
    background: accent,
    color: fg,
    '--category-card-fg': fg,
  } as Record<string, string>;
}
