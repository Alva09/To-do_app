/** Convierte un byte 0–255 a dos hex minúsculas. */
function toHex2(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0');
}

/**
 * Interpreta lo que escribe el usuario y lo guarda como `#rrggbb`.
 * - Vacío → `null` (sin color / automático).
 * - Inválido → `undefined` (el llamador debe mostrar error).
 */
export function parseColorInputToHex(raw: string): string | null | undefined {
  const t = raw.trim();
  if (!t) {
    return null;
  }

  const hex6 = /^#([0-9A-Fa-f]{6})$/;
  if (hex6.test(t)) {
    return t.toLowerCase();
  }

  const hex3 = /^#([0-9A-Fa-f]{3})$/;
  if (hex3.test(t)) {
    const m = t.slice(1);
    return `#${m[0]}${m[0]}${m[1]}${m[1]}${m[2]}${m[2]}`.toLowerCase();
  }

  const rgbMatch = t.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i,
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    if ([r, g, b].some((v) => Number.isNaN(v) || v < 0 || v > 255)) {
      return undefined;
    }
    return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
  }

  return undefined;
}
