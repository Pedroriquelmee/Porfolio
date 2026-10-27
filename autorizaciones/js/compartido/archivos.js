// COPIA generada por `npm run construir`. Edita el original en supabase/functions/_shared/
// Utilidades de archivos compartidas por navegador y servidor (Deno).

export const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
export const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB

// Detecta el tipo REAL por los primeros bytes ("magic bytes"), sin fiarse
// de la extensión ni del tipo que declara el navegador. Un .exe renombrado
// a .pdf no pasa este control.
export function tipoReal(b) {
  if (!b || b.length < 8) return null;
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d) {
    return 'application/pdf'; // %PDF-
  }
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return 'image/png';
  }
  return null;
}

export const EXTENSION = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Huella SHA-256 en hexadecimal (Web Crypto: navegador, Deno y Node 20+).
export async function sha256Hex(bytes) {
  if (!globalThis.crypto?.subtle) return null; // navegador sin HTTPS: sin huella
  const h = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(h), (x) => x.toString(16).padStart(2, '0')).join('');
}

export function formatoTamano(n) {
  if (n == null) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// Deja solo caracteres seguros en un nombre de archivo.
export function nombreSeguro(nombre) {
  return String(nombre || 'archivo')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .slice(-120);
}
