// PDF completo: la autorización firmada + los documentos subidos, en un solo archivo.
//
// Se monta aquí, en el navegador, al descargar. Así el PDF firmado que se guardó
// no cambia (es la prueba, con su huella SHA-256), no se gasta espacio extra en
// Supabase y cada archivo se pide con su propia descarga, que queda registrada.
//
// No depende de Supabase: recibe { PDFLib, bajar } para poder probarlo aparte.
//   bajar(inscripcionId, recurso) → Uint8Array   (recurso: 'expediente' | tipo de documento)
import { tipoReal } from './compartido/archivos.js';
import { huecosDocumentos } from './compartido/textos-legales.js';

const A4 = [595.28, 841.89];
const MARGEN = 40;
const LADO_MAXIMO = 2000; // px: se lee bien un DNI y el PDF no se dispara de peso

// Letras que no se descomponen en letra + tilde (nombres extranjeros).
const OTRAS_LETRAS = { 'Ł': 'L', 'ł': 'l', 'Đ': 'D', 'đ': 'd', 'Ħ': 'H', 'ħ': 'h', 'ı': 'i', 'Ŧ': 'T', 'ŧ': 't' };

export const tieneFirma = (f) => ['firmada', 'validada'].includes(f.estado);
const nombreDe = (f) => `${f.educandos?.apellidos ?? ''}, ${f.educandos?.nombre ?? ''}`.replace(/^, |, $/g, '');

/** Una inscripción: su autorización firmada seguida de sus documentos. */
export async function pdfDeUna({ PDFLib, bajar }, f, ronda) {
  const c = await preparar(PDFLib);
  await anadirInscripcion(c, f, bajar);
  c.doc.setTitle(c.texto(`Autorizaciones ${ronda} · ${nombreDe(f)}`));
  return {
    bytes: await c.doc.save(),
    nombre: nombreArchivo(`${f.educandos?.apellidos ?? ''} ${f.educandos?.nombre ?? ''} - ${f.secciones?.nombre ?? ''} - ${ronda}`),
  };
}

/**
 * Varias inscripciones en un solo PDF, con un índice al principio.
 * Si alguna falla, se sigue con las demás y se apunta en el índice.
 */
export async function pdfDeVarias({ PDFLib, bajar }, filas, { ronda = '', titulo = '', progreso } = {}) {
  const c = await preparar(PDFLib);
  const incluidas = [];
  const fallidas = [];
  for (const [i, f] of filas.entries()) {
    progreso?.(i + 1, filas.length);
    const inicio = c.doc.getPageCount();
    try {
      await anadirInscripcion(c, f, bajar);
      incluidas.push({ f, inicio });
    } catch (e) {
      while (c.doc.getPageCount() > inicio) c.doc.removePage(c.doc.getPageCount() - 1);
      fallidas.push({ f, motivo: e?.message || 'Error desconocido' });
    }
  }
  if (!incluidas.length) throw new Error(`No se ha podido incluir ninguna autorización. ${fallidas[0]?.motivo ?? ''}`.trim());
  indice(c, incluidas, fallidas, { ronda, titulo });
  c.doc.setTitle(c.texto(`Autorizaciones ${ronda} · ${titulo}`));
  return {
    bytes: await c.doc.save(),
    nombre: nombreArchivo(`Autorizaciones - ${titulo || 'Grupo'} - ${ronda}`),
    fallidas: fallidas.length,
  };
}

/** Descarga los bytes como archivo. */
export function guardarPdf(bytes, nombre) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ---------------------------------------------------------------------

async function preparar(PDFLib) {
  const doc = await PDFLib.PDFDocument.create();
  doc.setProducer('Grupo Scout Alba 601');
  doc.setCreator('Autorizaciones · Grupo Scout Alba 601');
  const fuente = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const negrita = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
  // Las fuentes estándar solo cubren WinAnsi (español incluido): el resto se
  // translitera o se cambia por "?" para que nunca falle por un nombre raro.
  const admitidos = new Set(fuente.getCharacterSet());
  const texto = (s) => Array.from(String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim())
    .map((ch) => {
      if (admitidos.has(ch.codePointAt(0))) return ch;
      const base = (OTRAS_LETRAS[ch] ?? ch).normalize('NFKD').replace(/\p{M}/gu, '');
      return base && Array.from(base).every((x) => admitidos.has(x.codePointAt(0))) ? base : '?';
    })
    .join('');
  const { rgb } = PDFLib;
  return {
    PDFLib, doc, fuente, negrita, texto,
    color: { negro: rgb(0.12, 0.14, 0.2), gris: rgb(0.42, 0.45, 0.52), linea: rgb(0.85, 0.87, 0.9), rojo: rgb(0.7, 0.12, 0.2) },
  };
}

async function anadirInscripcion(c, f, bajar) {
  const adulto = f.secciones?.adultos === true;
  const tutores = [...(f.tutores ?? [])].sort((x, y) => x.orden - y.orden);
  const huecos = huecosDocumentos(adulto, tutores, f.documentos ?? []).filter((h) => h.archivo);
  // Se piden todos a la vez. Si falla un documento se deja una hoja avisando;
  // si falla la autorización firmada, la inscripción entera no se incluye.
  const [firmado, ...archivos] = await Promise.all([
    bajar(f.id, 'expediente'),
    ...huecos.map((h) => bajar(f.id, h.tipo).catch((e) => (e instanceof Error ? e : new Error(String(e))))),
  ]);

  let origen;
  try {
    origen = await c.PDFLib.PDFDocument.load(firmado, { updateMetadata: false });
  } catch {
    throw new Error(`La autorización firmada de ${nombreDe(f)} no se puede leer`);
  }
  for (const p of await c.doc.copyPages(origen, origen.getPageIndices())) c.doc.addPage(p);

  // Cada documento con sus caras. Si delante y detrás son fotos, van en la
  // misma hoja (como una fotocopia del DNI por las dos caras).
  for (let i = 0; i < huecos.length; i++) {
    const h = huecos[i];
    const siguiente = huecos[i + 1];
    const fotos = (a) => !(a instanceof Error) && ['image/jpeg', 'image/png'].includes(tipoReal(a));
    if (h.cara === 'delante' && siguiente?.doc === h.doc && siguiente.cara === 'detras'
      && fotos(archivos[i]) && fotos(archivos[i + 1])) {
      const titulo = `${h.doc.corto} · ${nombreDe(f)}`;
      try {
        await paginaImagenes(c, [
          { bytes: archivos[i], tipo: tipoReal(archivos[i]), etiqueta: 'Delante' },
          { bytes: archivos[i + 1], tipo: tipoReal(archivos[i + 1]), etiqueta: 'Detrás' },
        ], titulo);
      } catch {
        paginaAviso(c, titulo, 'No se han podido incluir estas fotos. Descárgalas aparte desde el panel.');
      }
      i++;
      continue;
    }
    await anadirArchivo(c, archivos[i], `${h.cara === 'detras' ? h.corto : h.doc.corto} · ${nombreDe(f)}`);
  }
}

async function anadirArchivo(c, archivo, titulo) {
  if (archivo instanceof Error) {
    paginaAviso(c, titulo, `No se ha podido descargar este documento: ${archivo.message}`);
    return;
  }
  const tipo = tipoReal(archivo);
  try {
    if (tipo === 'application/pdf') await anadirPdf(c, archivo, titulo);
    else if (tipo === 'image/jpeg' || tipo === 'image/png') await paginaImagenes(c, [{ bytes: archivo, tipo }], titulo);
    else paginaAviso(c, titulo, 'Este archivo no es un PDF ni una imagen JPG/PNG.');
  } catch {
    paginaAviso(c, titulo, 'No se ha podido incluir este archivo. Descárgalo aparte desde el panel.');
  }
}

async function anadirPdf(c, bytes, titulo) {
  let origen;
  try {
    origen = await c.PDFLib.PDFDocument.load(bytes, { updateMetadata: false });
  } catch {
    paginaAviso(c, titulo, 'Este PDF está protegido con contraseña o dañado. Descárgalo aparte desde el panel.');
    return;
  }
  for (const p of await c.doc.copyPages(origen, origen.getPageIndices())) c.doc.addPage(p);
}

// Una o varias fotos en una hoja A4, una debajo de otra.
async function paginaImagenes(c, fotos, titulo) {
  const imagenes = [];
  for (const f of fotos) {
    const n = await normalizarImagen(f.bytes, f.tipo);
    imagenes.push({
      img: n.tipo === 'image/png' ? await c.doc.embedPng(n.bytes) : await c.doc.embedJpg(n.bytes),
      etiqueta: f.etiqueta,
    });
  }
  const page = c.doc.addPage(A4);
  const [W, H] = A4;
  cabecera(c, page, titulo);
  const HUECO = 18;
  const ETIQUETA = imagenes.some((x) => x.etiqueta) ? 16 : 0;
  const maxW = W - 2 * MARGEN;
  const total = H - 2 * MARGEN - 30;
  const alto = (total - HUECO * (imagenes.length - 1)) / imagenes.length - ETIQUETA;
  let y = H - MARGEN - 30;
  for (const { img, etiqueta } of imagenes) {
    if (etiqueta) {
      page.drawText(c.texto(etiqueta), { x: MARGEN, y: y - 10, size: 9, font: c.negrita, color: c.color.gris });
    }
    const k = Math.min(maxW / img.width, alto / img.height);
    const w = img.width * k;
    const h = img.height * k;
    page.drawImage(img, { x: (W - w) / 2, y: y - ETIQUETA - h, width: w, height: h });
    y -= ETIQUETA + alto + HUECO;
  }
}

// Las fotos del móvil: se enderezan según su EXIF, se reducen y pasan a JPG.
// Si el navegador no puede, se usa la imagen tal cual.
async function normalizarImagen(bytes, tipo) {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return { bytes, tipo };
  try {
    const bmp = await createImageBitmap(new Blob([bytes], { type: tipo }), { imageOrientation: 'from-image' });
    const k = Math.min(1, LADO_MAXIMO / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * k));
    const h = Math.max(1, Math.round(bmp.height * k));
    const lienzo = document.createElement('canvas');
    lienzo.width = w;
    lienzo.height = h;
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    const blob = await new Promise((r) => lienzo.toBlob(r, 'image/jpeg', 0.85));
    lienzo.width = 0;
    lienzo.height = 0;
    return blob ? { bytes: new Uint8Array(await blob.arrayBuffer()), tipo: 'image/jpeg' } : { bytes, tipo };
  } catch {
    return { bytes, tipo };
  }
}

function cabecera(c, page, titulo) {
  const W = page.getWidth();
  const H = page.getHeight();
  page.drawText(ajustar(c, titulo, c.negrita, 10, W - 2 * MARGEN), {
    x: MARGEN, y: H - MARGEN - 10, size: 10, font: c.negrita, color: c.color.negro,
  });
  page.drawLine({
    start: { x: MARGEN, y: H - MARGEN - 18 }, end: { x: W - MARGEN, y: H - MARGEN - 18 },
    thickness: 0.6, color: c.color.linea,
  });
}

function paginaAviso(c, titulo, mensaje) {
  const page = c.doc.addPage(A4);
  const [W, H] = A4;
  cabecera(c, page, titulo);
  let y = H - MARGEN - 50;
  for (const linea of partir(c, mensaje, c.fuente, 11, W - 2 * MARGEN)) {
    page.drawText(linea, { x: MARGEN, y, size: 11, font: c.fuente, color: c.color.rojo });
    y -= 16;
  }
}

function indice(c, incluidas, fallidas, { ronda, titulo }) {
  const [W, H] = A4;
  const ALTO = 17;
  const arriba = H - MARGEN - 78;
  const porPagina = Math.floor((arriba - MARGEN) / ALTO);
  const filas = [
    ...incluidas,
    ...(fallidas.length ? [{ aparte: 'No incluidas (descárgalas aparte desde el panel):' }, ...fallidas] : []),
  ];
  const total = Math.max(1, Math.ceil(filas.length / porPagina));
  const colSeccion = MARGEN + 270;
  const colPagina = W - MARGEN;
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  for (let p = 0; p < total; p++) {
    const page = c.doc.insertPage(p, A4);
    page.drawText(c.texto(`Autorizaciones${ronda ? ` · Ronda ${ronda}` : ''}`), {
      x: MARGEN, y: H - MARGEN - 18, size: 17, font: c.negrita, color: c.color.negro,
    });
    const n = incluidas.length;
    const sub = [titulo, `${n} ${n === 1 ? 'inscripción' : 'inscripciones'}`, `generado el ${fecha}`].filter(Boolean).join(' · ');
    page.drawText(ajustar(c, sub, c.fuente, 9.5, W - 2 * MARGEN - 70), {
      x: MARGEN, y: H - MARGEN - 36, size: 9.5, font: c.fuente, color: c.color.gris,
    });
    if (total > 1) {
      const t = `Índice ${p + 1}/${total}`;
      page.drawText(c.texto(t), { x: colPagina - c.fuente.widthOfTextAtSize(c.texto(t), 8.5), y: H - MARGEN - 36, size: 8.5, font: c.fuente, color: c.color.gris });
    }
    const yCab = H - MARGEN - 60;
    page.drawText('NOMBRE', { x: MARGEN, y: yCab, size: 7.5, font: c.negrita, color: c.color.gris });
    page.drawText(c.texto('SECCIÓN'), { x: colSeccion, y: yCab, size: 7.5, font: c.negrita, color: c.color.gris });
    page.drawText(c.texto('PÁGINA'), { x: colPagina - c.negrita.widthOfTextAtSize(c.texto('PÁGINA'), 7.5), y: yCab, size: 7.5, font: c.negrita, color: c.color.gris });
    page.drawLine({ start: { x: MARGEN, y: yCab - 6 }, end: { x: colPagina, y: yCab - 6 }, thickness: 0.6, color: c.color.linea });

    let y = arriba;
    for (const fila of filas.slice(p * porPagina, (p + 1) * porPagina)) {
      if (fila.aparte) {
        page.drawText(c.texto(fila.aparte), { x: MARGEN, y: y - 4, size: 9.5, font: c.negrita, color: c.color.rojo });
      } else {
        const fallo = fila.inicio === undefined;
        const tinta = fallo ? c.color.rojo : c.color.negro;
        page.drawText(ajustar(c, nombreDe(fila.f), c.fuente, 10, colSeccion - MARGEN - 12), { x: MARGEN, y, size: 10, font: c.fuente, color: tinta });
        page.drawText(ajustar(c, fila.f.secciones?.nombre ?? '', c.fuente, 9, colPagina - colSeccion - 50), { x: colSeccion, y, size: 9, font: c.fuente, color: c.color.gris });
        const pag = fallo ? '—' : String(fila.inicio + total + 1);
        page.drawText(pag, { x: colPagina - c.negrita.widthOfTextAtSize(pag, 10), y, size: 10, font: c.negrita, color: tinta });
      }
      y -= ALTO;
    }
  }
}

function ajustar(c, s, fuente, tam, ancho) {
  let t = c.texto(s);
  if (fuente.widthOfTextAtSize(t, tam) <= ancho) return t;
  while (t.length > 1 && fuente.widthOfTextAtSize(`${t}...`, tam) > ancho) t = t.slice(0, -1);
  return `${t.trimEnd()}...`;
}

function partir(c, s, fuente, tam, ancho) {
  const lineas = [];
  let actual = '';
  for (const palabra of c.texto(s).split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (fuente.widthOfTextAtSize(prueba, tam) > ancho && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

// Sin tildes ni eñes: algunos navegadores descartan el nombre si no es ASCII.
function nombreArchivo(s) {
  const limpio = Array.from(String(s)).map((ch) => OTRAS_LETRAS[ch] ?? ch).join('')
    .normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/[^\x20-\x7e]/g, '').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
  return `${limpio.slice(0, 120) || 'autorizaciones'}.pdf`;
}
