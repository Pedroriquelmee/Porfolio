// COPIA generada por `npm run construir`. Edita el original en supabase/functions/_shared/
// =====================================================================
// PDF firmado: las autorizaciones ORIGINALES del grupo, rellenadas.
// ---------------------------------------------------------------------
// Se parte del PDF de siempre (plantillas/autorizaciones-anuales.pdf) y
// se escribe encima de cada hueco, como si se rellenara a boli. Al final
// se añade un anexo con la documentación y las evidencias de la firma.
//
// pdf-lib y el PDF de plantilla se reciben como parámetros para que el
// MISMO código funcione en el servidor (Deno), en el navegador y en Node.
// =====================================================================

import {
  ORGANIZACION, PREGUNTAS_SANITARIAS, PREGUNTAS_ADULTOS, huecosDocumentos,
} from './textos-legales.js';
import { formatoTamano } from './archivos.js';

// ---------------------------------------------------------------------
// Mapa de huecos, medido sobre el PDF original con pdfplumber.
// x0/x1: horizontal desde la izquierda. top/bottom: vertical desde ARRIBA.
// Si cambiáis el PDF de las autorizaciones, hay que volver a medir esto.
// ---------------------------------------------------------------------
const H = (x0, x1, top, bottom) => ({ x0, x1, top, bottom });

const LINEA_RGPD = {
  lugar: H(133.5, 272.7, 384.4, 394.3),
  dia: H(282.2, 302.2, 384.4, 394.3),
  mes: H(312.3, 377.1, 384.4, 394.3),
  anio: H(399.7, 409.6, 384.4, 394.3),
  firma: H(118, 300, 430, 503),
};

const tutorAsistencia = (d) => ({
  documento: H(218.7, 290.4, 259.4 + d, 268.4 + d),
  nombre: H(322.6, 457.0, 259.4 + d, 268.4 + d),
  apellidos: H(136.6, 320.4, 270.5 + d, 279.5 + d),
  profesion: H(137.9, 339.4, 281.4 + d, 290.4 + d),
  telefono_fijo: H(149.3, 265.5, 292.5 + d, 301.5 + d),
  movil: H(288.2, 386.7, 292.5 + d, 301.5 + d),
  email: H(171.2, 345.8, 303.5 + d, 312.5 + d),
});

export const MAPA = {
  asistencia: {
    socio: {
      documento: H(218.7, 290.4, 153.2, 162.2),
      nombre: H(322.6, 457.0, 153.2, 162.2),
      apellidos: H(136.6, 320.3, 164.3, 173.3),
      fecha_nacimiento: H(398.2, 474.4, 164.3, 173.3),
      direccion: H(137.4, 338.9, 175.2, 184.2),
      poblacion: H(376.8, 470.9, 175.2, 184.2),
      provincia: H(136.7, 271.0, 186.2, 195.2),
      codigo_postal: H(314.0, 376.6, 186.2, 195.2),
      telefono_fijo: H(149.3, 265.5, 197.3, 206.3),
      movil: H(288.3, 386.7, 197.3, 206.3),
      email: H(171.2, 345.8, 208.2, 217.2),
    },
    tutores: [tutorAsistencia(0), tutorAsistencia(66)],
    rondaInicio: H(391.8, 400.8, 431.7, 440.7),
    rondaFin: H(412.8, 421.7, 431.7, 440.7),
    vueltaSi: H(111.1, 126.8, 570.8, 584.6),
    vueltaNo: H(221.4, 237.2, 571.0, 584.8),
    imagenSi: H(112.8, 128.6, 657.7, 671.5),
    imagenNo: H(265.6, 281.4, 657.7, 671.5),
  },
  ficha: {
    apellidos: H(165, 307, 178, 194),
    nombre: H(347, 456, 178, 194),
    documento: H(478, 547, 178, 194),
    fecha_nacimiento: H(165, 241, 195, 223),
    direccion: H(307, 547, 195, 223),
    tutores: H(165, 305, 224, 267),
    telefono1: H(347, 439, 224, 267),
    telefono2: H(478, 547, 224, 267),
    seguro: H(156, 347, 290, 320),
    numero_seguro: H(453, 548, 290, 320),
    // Posición de las letras "SI" y "NO" del texto "SI/NO" de cada pregunta.
    sino: {
      enuresis: { si: [43.2, 49.5], no: [53.0, 64.8], top: 350.2, bottom: 359.2 },
      sonambulismo: { si: [241.5, 247.8], no: [251.3, 263.0], top: 350.2, bottom: 359.2 },
      enfermedad_cronica: { si: [198.2, 204.5], no: [208.0, 219.7], top: 375.9, bottom: 384.9 },
      tratamiento_medico: { si: [193.6, 200.0], no: [203.4, 215.2], top: 431.7, bottom: 440.7 },
      dieta_especial: { si: [214.1, 220.5], no: [224.0, 235.7], top: 480.4, bottom: 489.4 },
      alergia_medicamentos: { si: [43.2, 49.5], no: [53.0, 64.8], top: 534.2, bottom: 543.2 },
    },
    cual: {
      enfermedad_cronica: H(273, 545, 374.5, 408),
      tratamiento_medico: H(273, 545, 423, 458),
      dieta_especial: H(273, 545, 472, 506),
      alergia_medicamentos: H(273, 545, 520.5, 554),
    },
    otras_alergias: H(112, 545, 576, 604),
    necesidades_educativas: H(45, 545, 631, 653),
  },
  firmaFicha: LINEA_RGPD,
  firmaAsistencia: LINEA_RGPD,
  medicacion: {
    rondaInicio: H(297.9, 330.6, 126.7, 138.2),
    rondaFin: H(338.5, 379.3, 126.7, 138.2),
    yo: H(95.2, 418.6, 239.5, 249.5),
    dni: H(85.1, 269.2, 251.6, 261.6),
    menor: H(85.1, 508.3, 263.9, 273.9),
    seccion: H(181.4, 405.2, 276.1, 286.1),
    lugar: H(97.5, 216.8, 361.6, 371.5),
    fecha: H(226.1, 340.6, 361.6, 371.5),
    anio: H(365.4, 385.7, 361.6, 371.5),
    firma: H(135, 315, 372, 432),
    sello: H(340, 510, 384, 420),
  },
  whatsapp: {
    dia: H(113.1, 125.1, 153.1, 165.1),
    mes: H(142.7, 208.4, 153.1, 165.1),
    anio: H(238.2, 250.1, 153.1, 165.1),
    nombre: H(105.6, 308.8, 182.4, 194.4),
    nif: H(442.0, 537.7, 182.4, 194.4),
    casillaSi: H(69.4, 75.0, 226.9, 233.6),
    seccionSi: H(301.0, 354.7, 227.1, 239.1),
    telefono: H(85.7, 193.4, 285.6, 297.6),
    casillaNo: H(69.4, 75.0, 470.4, 477.1),
    seccionNo: H(308.1, 361.9, 470.6, 482.6),
    firma: H(140, 330, 532, 600),
  },
  imagen1: {
    tutores: [
      { nombre: H(119.2, 354.0, 87.9, 99.9), documento: H(399.3, 503.1, 87.9, 99.9) },
      { nombre: H(119.2, 354.0, 128.9, 140.9), documento: H(399.3, 503.1, 128.9, 140.9) },
    ],
    menor: H(133.7, 346.9, 169.9, 181.9),
    menorDocumento: H(385.0, 488.9, 169.9, 181.9),
    direccion: H(75.6, 310.7, 531.9, 543.9),
    email: H(75.6, 179.6, 548.5, 560.5),
    imagen_canales_internos: { si: H(76.7, 88.2, 572.5, 584.0), no: H(106.0, 117.5, 572.5, 584.0) },
    imagen_redes_y_medios: { si: H(76.7, 88.2, 663.1, 674.6), no: H(106.0, 117.5, 663.1, 674.6) },
  },
  imagen2: {
    imagen_mensajeria: { si: H(76.7, 88.2, 51.0, 62.5), no: H(106.0, 117.5, 51.0, 62.5) },
    lugar: H(322.2, 382.3, 150.1, 162.1),
    dia: H(396.0, 406.9, 150.1, 162.1),
    mes: H(423.3, 461.6, 150.1, 162.1),
    anio: H(488.9, 499.8, 150.1, 162.1),
    firma: H(82, 282, 198, 296),
    rgpd: {
      lugar: H(124.1, 263.2, 624.9, 634.8),
      dia: H(272.7, 292.7, 624.9, 634.8),
      mes: H(302.8, 367.6, 624.9, 634.8),
      anio: H(390.2, 400.1, 624.9, 634.8),
    },
  },
};

// --- Mayores de edad (plantillas/autorizaciones-adultos.pdf, 3 páginas) ---
// En la ficha, cada pareja "SÍ / NO" es una imagen de 81 pt de ancho: las
// casillas están siempre en la misma posición dentro de ella.
const SN = (x0, top) => ({
  si: H(x0 + 1.0, x0 + 17.3, top + 1.4, top + 18.0),
  no: H(x0 + 45.6, x0 + 61.9, top + 1.4, top + 18.0),
});

export const MAPA_ADULTOS = {
  ficha: {
    apellidos: H(163, 305, 151, 181),
    nombre: H(354, 425, 151, 181),
    documento: H(475, 548, 151, 181),
    fecha_nacimiento: H(163, 238, 182, 210),
    direccion: H(305, 548, 182, 210),
    contacto: H(163, 305, 211, 245),
    telefono1: H(354, 425, 211, 245),
    telefono2: H(475, 548, 211, 245),
    casillas: {
      alergia_medicamentos: SN(98.8, 291.9),
      otras_alergias_tiene: SN(98.2, 338.6),
      enfermedad_cronica: SN(98.2, 388.9),
      anticonceptivo: SN(98.8, 444.7),
      dieta_especial: SN(99.3, 489.0),
      fumador: SN(99.5, 534.4),
      alcohol: SN(256.9, 534.1),
      gafas_lentillas: SN(449.4, 534.3),
    },
    cual: {
      alergia_medicamentos: H(277, 545, 273, 318),
      otras_alergias_tiene: H(288, 545, 322.5, 366),
      enfermedad_cronica: H(241, 545, 385, 415),
      dieta_especial: H(277, 545, 468, 512),
    },
    embarazo: H(241, 545, 435, 464),
  },
  firmaFicha: {
    lugar: H(133.5, 272.7, 402.6, 412.6),
    dia: H(282.2, 302.2, 402.6, 412.6),
    mes: H(312.3, 377.1, 402.6, 412.6),
    anio: H(399.7, 409.6, 402.6, 412.6),
    firma: H(118, 300, 448, 521),
  },
  imagen: {
    nombre: H(111.2, 346.6, 83.3, 94.3),
    documento: H(373.7, 477.8, 83.3, 94.3),
    direccion: H(75.6, 311.1, 356.9, 368.0),
    email: H(75.6, 179.7, 373.1, 384.2),
    imagen_canales_internos: { si: H(76.7, 87.9, 396.2, 407.3), no: H(102.9, 114.0, 396.2, 407.3) },
    imagen_redes_y_medios: { si: H(76.7, 87.9, 484.7, 495.9), no: H(102.9, 114.0, 484.7, 495.9) },
    imagen_mensajeria: { si: H(76.7, 87.9, 573.3, 584.5), no: H(102.9, 114.0, 573.3, 584.5) },
    lugar: H(325.9, 386.2, 646.9, 657.9),
    dia: H(399.2, 410.1, 646.9, 657.9),
    mes: H(426.3, 464.7, 646.9, 657.9),
    anio: H(492.0, 502.9, 646.9, 657.9),
    nombreFirma: H(115.5, 263.3, 672.7, 683.7),
    firma: H(120, 286, 684.5, 713),
  },
};

/**
 * @param PDFLib    módulo pdf-lib
 * @param d         { id, ronda, seccion, educando, tutores[], ficha, autorizaciones, documentos[],
 *                    firma?: {nombre, documento, lugar, fecha, png}, evidencias?: {email, ip, user_agent, fecha} }
 * @param opciones  { plantilla: bytes del PDF original (obligatorio), marcaAgua?: string }
 * @returns Uint8Array con el PDF
 */
export async function generarExpediente(PDFLib, d, opciones = {}) {
  const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
  if (!opciones.plantilla) throw new Error('Falta el PDF de plantilla de las autorizaciones');

  const TINTA = rgb(0.06, 0.16, 0.5); // azul bolígrafo: se distingue lo rellenado
  const GRIS = rgb(0.42, 0.42, 0.45);
  const NEGRO = rgb(0.11, 0.11, 0.12);
  const LINEA = rgb(0.84, 0.84, 0.86);

  const pdf = await PDFDocument.load(opciones.plantilla);
  const f = await pdf.embedFont(StandardFonts.Helvetica);
  const fb = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fm = await pdf.embedFont(StandardFonts.Courier);

  // Las fuentes estándar solo cubren WinAnsi (español incluido). El resto se
  // translitera o se cambia por "?" para que la generación no falle nunca.
  const admitidos = new Set(f.getCharacterSet());
  const limpiar = (s) =>
    Array.from(String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim())
      .map((c) => {
        if (admitidos.has(c.codePointAt(0))) return c;
        const base = c.normalize('NFKD').replace(/[̀-ͯ]/g, '');
        return base && Array.from(base).every((x) => admitidos.has(x.codePointAt(0))) ? base : '?';
      })
      .join('');

  const e = d.educando || {};
  const a = d.autorizaciones || {};
  const s = d.ficha || {};
  const tutores = (d.tutores || []).slice(0, 2);
  const nombreDe = (p) => `${p?.nombre || ''} ${p?.apellidos || ''}`.trim();
  const nombreEducando = nombreDe(e);
  const adulto = d.adulto === true;
  const firmante = d.firma?.nombre || (adulto ? nombreEducando : nombreDe(tutores[0]));
  const firmanteDoc = d.firma?.documento || (adulto ? e.documento : tutores[0]?.documento) || '';
  const [rondaA = '', rondaB = ''] = String(d.ronda || '').split('-');
  const fecha = d.firma?.fecha ? partesFecha(d.firma.fecha) : null;
  const fechaCorta = (iso) => {
    if (!iso) return '';
    const [y, m, dd] = String(iso).slice(0, 10).split('-');
    return `${dd}/${m}/${y}`;
  };
  const desbordes = [];
  const NOMBRES_CAMPO = {
    documento: 'DNI / NIE', nombre: 'Nombre', apellidos: 'Apellidos', fecha_nacimiento: 'Fecha de nacimiento',
    direccion: 'Dirección', poblacion: 'Población', provincia: 'Provincia', codigo_postal: 'Código postal',
    telefono_fijo: 'Teléfono fijo', movil: 'Móvil', email: 'Correo electrónico', profesion: 'Profesión',
  };

  // ---------- Escritura sobre la plantilla ----------
  const altura = (pagina) => pagina.getHeight();

  // Texto sobre una línea de puntos: se reduce la letra si no cabe; si ni
  // así cabe, se corta y el texto completo va al anexo.
  function enLinea(pagina, hueco, valor, etiqueta) {
    const t = limpiar(valor);
    if (!t) return;
    const max = hueco.x1 - hueco.x0 - 2;
    let size = Math.min(9.5, (hueco.bottom - hueco.top) * 0.95);
    while (size > 6 && f.widthOfTextAtSize(t, size) > max) size -= 0.25;
    let final = t;
    if (f.widthOfTextAtSize(t, size) > max) {
      while (final.length > 1 && f.widthOfTextAtSize(`${final}…`, size) > max) final = final.slice(0, -1);
      final = `${final}…`;
      if (etiqueta) desbordes.push([etiqueta, t]);
    }
    const tamOriginal = hueco.bottom - hueco.top;
    pagina.drawText(final, {
      x: hueco.x0 + 1.5,
      y: altura(pagina) - hueco.bottom + tamOriginal * 0.21 + 1.6,
      size, font: f, color: TINTA,
    });
  }

  // Texto dentro de una celda, en varias líneas si hace falta.
  function enCelda(pagina, hueco, valor, etiqueta, { arriba = false } = {}) {
    const t = limpiar(valor);
    if (!t) return;
    const ancho = hueco.x1 - hueco.x0 - 6;
    const alto = hueco.bottom - hueco.top - 3;
    let size = 8.6;
    let lineas;
    for (;;) {
      lineas = partir(t, f, size, ancho);
      if (lineas.length * size * 1.2 <= alto || size <= 6) break;
      size -= 0.3;
    }
    const caben = Math.max(1, Math.floor(alto / (size * 1.2)));
    if (lineas.length > caben) {
      lineas = lineas.slice(0, caben);
      lineas[caben - 1] = `${lineas[caben - 1].replace(/.$/, '')}…`;
      if (etiqueta) desbordes.push([etiqueta, t]);
    }
    const lh = size * 1.2;
    const bloque = lineas.length * lh;
    const inicio = arriba ? hueco.top + 2 : hueco.top + (hueco.bottom - hueco.top - bloque) / 2;
    lineas.forEach((l, i) => {
      pagina.drawText(l, {
        x: hueco.x0 + 3, y: altura(pagina) - inicio - size * 0.92 - i * lh, size, font: f, color: TINTA,
      });
    });
  }

  // Aspa dentro de una casilla.
  function marcar(pagina, c) {
    const H0 = altura(pagina);
    const m = Math.max(1.2, (c.x1 - c.x0) * 0.16);
    const opts = { thickness: 1.4, color: TINTA };
    pagina.drawLine({ start: { x: c.x0 + m, y: H0 - c.top - m }, end: { x: c.x1 - m, y: H0 - c.bottom + m }, ...opts });
    pagina.drawLine({ start: { x: c.x0 + m, y: H0 - c.bottom + m }, end: { x: c.x1 - m, y: H0 - c.top - m }, ...opts });
  }

  // Aspa más grande, para casillas diminutas (WhatsApp).
  function marcarGrande(pagina, c) {
    marcar(pagina, { x0: c.x0 - 1.8, x1: c.x1 + 1.8, top: c.top - 1.8, bottom: c.bottom + 1.8 });
  }

  // Rodea "SI" o "NO" como se haría a mano.
  function rodear(pagina, [x0, x1], top, bottom) {
    const H0 = altura(pagina);
    pagina.drawEllipse({
      x: (x0 + x1) / 2, y: H0 - (top + bottom) / 2 - 0.4,
      xScale: (x1 - x0) / 2 + 3, yScale: (bottom - top) / 2 + 1.2,
      borderColor: TINTA, borderWidth: 1.1,
    });
  }

  const pngFirma = d.firma?.png ? await pdf.embedPng(d.firma.png) : null;
  function firmar(pagina, caja) {
    if (!pngFirma) return;
    const H0 = altura(pagina);
    const dim = pngFirma.scaleToFit(caja.x1 - caja.x0, caja.bottom - caja.top);
    pagina.drawImage(pngFirma, { x: caja.x0, y: H0 - caja.bottom, ...dim }); // apoyada abajo, como sobre la línea
  }

  function fechaEn(pagina, huecos, conLugar = true) {
    if (conLugar) enLinea(pagina, huecos.lugar, d.firma?.lugar);
    if (!fecha) return;
    enLinea(pagina, huecos.dia, fecha.dia);
    enLinea(pagina, huecos.mes, fecha.mes);
    enLinea(pagina, huecos.anio, fecha.anio2);
  }

  if (adulto) rellenarAdultos();
  else await rellenarMenores();

  // ---------- Menores: 8 páginas (+1 de WhatsApp si hay segundo tutor/a) ----------
  async function rellenarMenores() {
    // ---------- Páginas de la plantilla ----------
    const paginas = pdf.getPages();
    if (paginas.length < 8) throw new Error('La plantilla no tiene las 8 páginas esperadas');
    const [pAsis, pAsisFirma, pFicha, pFichaFirma, pMed, pWa1, pImg1, pImg2] = paginas;

    // Segunda página de WhatsApp para el segundo tutor/a (es personal).
    let pWa2 = null;
    if (tutores.length > 1) {
      const fuente = await PDFDocument.load(opciones.plantilla);
      [pWa2] = await pdf.copyPages(fuente, [5]);
      pdf.insertPage(6, pWa2);
    }

    // 1. Asistencia y participación
    const M1 = MAPA.asistencia;
    const socio = { ...e, fecha_nacimiento: fechaCorta(e.fecha_nacimiento) };
    for (const [campo, hueco] of Object.entries(M1.socio)) enLinea(pAsis, hueco, socio[campo], `Socio/a · ${NOMBRES_CAMPO[campo]}`);
    tutores.forEach((t, i) => {
      for (const [campo, hueco] of Object.entries(M1.tutores[i])) enLinea(pAsis, hueco, t[campo], `Tutor/a ${i + 1} · ${NOMBRES_CAMPO[campo]}`);
    });
    enLinea(pAsis, M1.rondaInicio, rondaA.slice(2));
    enLinea(pAsis, M1.rondaFin, rondaB.slice(2));
    if (a.vuelve_solo === true) marcar(pAsis, M1.vueltaSi);
    if (a.vuelve_solo === false) marcar(pAsis, M1.vueltaNo);
    // La autorización general pide la misma imagen en web y redes que la
    // opción "redes sociales y medios" de la cesión de imagen.
    if (a.imagen_redes_y_medios === true) marcar(pAsis, M1.imagenSi);
    if (a.imagen_redes_y_medios === false) marcar(pAsis, M1.imagenNo);
    fechaEn(pAsisFirma, MAPA.firmaAsistencia);
    firmar(pAsisFirma, MAPA.firmaAsistencia.firma);

    // 2. Ficha sanitaria
    const MF = MAPA.ficha;
    enCelda(pFicha, MF.apellidos, e.apellidos, 'Ficha · apellidos');
    enCelda(pFicha, MF.nombre, e.nombre, 'Ficha · nombre');
    enCelda(pFicha, MF.documento, e.documento, 'Ficha · DNI');
    enCelda(pFicha, MF.fecha_nacimiento, fechaCorta(e.fecha_nacimiento));
    enCelda(pFicha, MF.direccion,
      [e.direccion, [e.codigo_postal, e.poblacion].filter(Boolean).join(' '), e.provincia].filter(Boolean).join(', '),
      'Ficha · dirección');
    enCelda(pFicha, MF.tutores,
      tutores.map((t) => `${nombreDe(t)}${t.documento ? ` · ${t.documento}` : ''}`).join(' / '),
      'Ficha · padre, madre o tutor/a');
    enCelda(pFicha, MF.telefono1, tutores[0]?.movil || tutores[0]?.telefono_fijo);
    enCelda(pFicha, MF.telefono2, tutores[1]?.movil || tutores[0]?.telefono_fijo);
    enCelda(pFicha, MF.seguro, s.seguro, 'Ficha · seguro');
    enCelda(pFicha, MF.numero_seguro, s.numero_seguro, 'Ficha · número del seguro');
    for (const p of PREGUNTAS_SANITARIAS) {
      const pos = MF.sino[p.campo];
      if (s[p.campo] === true) rodear(pFicha, pos.si, pos.top, pos.bottom);
      if (s[p.campo] === false) rodear(pFicha, pos.no, pos.top, pos.bottom);
      if (p.cual && s[p.campo] === true) enCelda(pFicha, MF.cual[p.campo], s[`${p.campo}_cual`], `Ficha · ${p.texto}`, { arriba: true });
    }
    enCelda(pFicha, MF.otras_alergias, s.otras_alergias, 'Ficha · otras alergias', { arriba: true });
    enCelda(pFicha, MF.necesidades_educativas, s.necesidades_educativas, 'Ficha · necesidades educativas', { arriba: true });
    fechaEn(pFichaFirma, MAPA.firmaFicha);
    firmar(pFichaFirma, MAPA.firmaFicha.firma);

    // 3. Medicamentos
    const MM = MAPA.medicacion;
    enLinea(pMed, MM.rondaInicio, rondaA);
    enLinea(pMed, MM.rondaFin, rondaB);
    enLinea(pMed, MM.yo, firmante, 'Medicamentos · nombre');
    enLinea(pMed, MM.dni, firmanteDoc);
    enLinea(pMed, MM.menor, nombreEducando, 'Medicamentos · menor');
    enLinea(pMed, MM.seccion, d.seccion);
    enLinea(pMed, MM.lugar, d.firma?.lugar);
    if (fecha) {
      enLinea(pMed, MM.fecha, `${fecha.dia} de ${fecha.mes}`);
      enLinea(pMed, MM.anio, fecha.anio2);
    }
    firmar(pMed, MM.firma);
    if (a.autoriza_medicacion === false) {
      const H0 = altura(pMed);
      const c = MM.sello;
      pMed.drawRectangle({
        x: c.x0, y: H0 - c.bottom, width: c.x1 - c.x0, height: c.bottom - c.top, borderColor: TINTA, borderWidth: 1.2,
      });
      pMed.drawText('NO AUTORIZA', { x: c.x0 + 8, y: H0 - c.top - 15, size: 11, font: fb, color: TINTA });
      pMed.drawText(limpiar('la administración de medicamentos'), { x: c.x0 + 8, y: H0 - c.top - 28, size: 8, font: f, color: TINTA });
    }

    // 4. WhatsApp (una página por tutor/a)
    const MW = MAPA.whatsapp;
    [pWa1, pWa2].forEach((pagina, i) => {
      const t = tutores[i];
      if (!pagina || !t) return;
      if (fecha) {
        enLinea(pagina, MW.dia, fecha.dia);
        enLinea(pagina, MW.mes, fecha.mes);
        enLinea(pagina, MW.anio, fecha.anio2);
      }
      enLinea(pagina, MW.nombre, nombreDe(t), `WhatsApp · tutor/a ${i + 1}`);
      enLinea(pagina, MW.nif, t.documento);
      if (t.whatsapp_autoriza === true) {
        marcarGrande(pagina, MW.casillaSi);
        enLinea(pagina, MW.seccionSi, d.seccion);
        enLinea(pagina, MW.telefono, t.whatsapp_telefono);
      } else if (t.whatsapp_autoriza === false) {
        marcarGrande(pagina, MW.casillaNo);
        enLinea(pagina, MW.seccionNo, d.seccion);
      }
      firmar(pagina, MW.firma);
      if (i === 1 && pngFirma) {
        const H0 = altura(pagina);
        pagina.drawText(limpiar(`Respuesta indicada por ${firmante} al firmar la inscripción.`), {
          x: MW.firma.x0, y: H0 - MW.firma.bottom - 8, size: 7, font: f, color: TINTA,
        });
      }
    });

    // 5. Cesión de imagen
    const MI = MAPA.imagen1;
    tutores.forEach((t, i) => {
      enLinea(pImg1, MI.tutores[i].nombre, nombreDe(t), `Cesión de imagen · tutor/a ${i + 1}`);
      enLinea(pImg1, MI.tutores[i].documento, t.documento);
    });
    enLinea(pImg1, MI.menor, nombreEducando, 'Cesión de imagen · menor');
    enLinea(pImg1, MI.menorDocumento, e.documento);
    enLinea(pImg1, MI.direccion, ORGANIZACION.direccion);
    enLinea(pImg1, MI.email, ORGANIZACION.email);
    for (const campo of ['imagen_canales_internos', 'imagen_redes_y_medios']) {
      if (a[campo] === true) marcar(pImg1, MI[campo].si);
      if (a[campo] === false) marcar(pImg1, MI[campo].no);
    }
    const MI2 = MAPA.imagen2;
    if (a.imagen_mensajeria === true) marcar(pImg2, MI2.imagen_mensajeria.si);
    if (a.imagen_mensajeria === false) marcar(pImg2, MI2.imagen_mensajeria.no);
    fechaEn(pImg2, MI2);
    firmar(pImg2, MI2.firma);
    fechaEn(pImg2, MI2.rgpd);
  }

  // ---------- Mayores de edad: ficha, protección de datos e imagen ----------
  function rellenarAdultos() {
    const paginas = pdf.getPages();
    if (paginas.length < 3) throw new Error('La plantilla de adultos no tiene las 3 páginas esperadas');
    const [pFicha, pFirma, pImg] = paginas;
    const MA = MAPA_ADULTOS.ficha;
    const c = d.contacto || {};
    enCelda(pFicha, MA.apellidos, e.apellidos, 'Ficha · apellidos');
    enCelda(pFicha, MA.nombre, e.nombre, 'Ficha · nombre');
    enCelda(pFicha, MA.documento, e.documento, 'Ficha · DNI');
    enCelda(pFicha, MA.fecha_nacimiento, fechaCorta(e.fecha_nacimiento));
    enCelda(pFicha, MA.direccion,
      [e.direccion, [e.codigo_postal, e.poblacion].filter(Boolean).join(' '), e.provincia].filter(Boolean).join(', '),
      'Ficha · dirección');
    enCelda(pFicha, MA.contacto, c.nombre, 'Ficha · contacto');
    enCelda(pFicha, MA.telefono1, c.telefono1);
    enCelda(pFicha, MA.telefono2, c.telefono2);
    for (const p of PREGUNTAS_ADULTOS) {
      const casilla = MA.casillas[p.campo];
      if (casilla && s[p.campo] === true) marcar(pFicha, casilla.si);
      if (casilla && s[p.campo] === false) marcar(pFicha, casilla.no);
      if (p.cual && s[p.campo] === true) {
        enCelda(pFicha, MA.cual[p.campo], s[p.campoCual || `${p.campo}_cual`], `Ficha · ${p.texto}`, { arriba: true });
      }
    }
    if (s.embarazo === true || s.embarazo === false) enCelda(pFicha, MA.embarazo, s.embarazo ? 'Sí' : 'No', null, { arriba: true });
    fechaEn(pFirma, MAPA_ADULTOS.firmaFicha);
    firmar(pFirma, MAPA_ADULTOS.firmaFicha.firma);

    const MI = MAPA_ADULTOS.imagen;
    enLinea(pImg, MI.nombre, nombreEducando, 'Cesión de imagen · nombre');
    enLinea(pImg, MI.documento, e.documento);
    enLinea(pImg, MI.direccion, ORGANIZACION.direccion);
    enLinea(pImg, MI.email, ORGANIZACION.email);
    for (const campo of ['imagen_canales_internos', 'imagen_redes_y_medios', 'imagen_mensajeria']) {
      if (a[campo] === true) marcar(pImg, MI[campo].si);
      if (a[campo] === false) marcar(pImg, MI[campo].no);
    }
    fechaEn(pImg, MI);
    enLinea(pImg, MI.nombreFirma, nombreEducando);
    firmar(pImg, MI.firma);
  }

  // ---------- Anexo ----------
  await anexo();

  // ---------- Pie y marca de agua en todas las páginas ----------
  const todas = pdf.getPages();
  const estado = d.evidencias?.fecha
    ? `Firmado electrónicamente el ${partesFecha(d.evidencias.fecha).texto}`
    : 'Borrador sin firmar';
  todas.forEach((p, i) => {
    const pie = limpiar(`${ORGANIZACION.nombreCorto} · ${nombreEducando} · Ronda ${d.ronda} · ${estado} · Página ${i + 1} de ${todas.length}`);
    const w = f.widthOfTextAtSize(pie, 6.3);
    p.drawText(pie, { x: (p.getWidth() - w) / 2, y: 12, size: 6.3, font: f, color: GRIS });
    if (opciones.marcaAgua) {
      p.drawText(limpiar(opciones.marcaAgua), {
        x: 120, y: 250, size: 42, font: fb, color: rgb(0.75, 0.75, 0.78), rotate: degrees(38), opacity: 0.4,
      });
    }
  });

  pdf.setTitle(limpiar(`Autorizaciones ${d.ronda} · ${nombreEducando}`));
  pdf.setAuthor(ORGANIZACION.nombre);
  pdf.setSubject('Autorizaciones anuales, ficha sanitaria y documentación');
  pdf.setCreator('Gestor de inscripciones Alba 601');
  pdf.setProducer('Gestor de inscripciones Alba 601');
  const fechaDoc = new Date(d.evidencias?.fecha || d.firma?.fecha || Date.now());
  pdf.setCreationDate(fechaDoc);
  pdf.setModificationDate(fechaDoc);
  return pdf.save();

  // =====================================================================
  // Anexo: documentación, consentimientos digitales, textos completos y
  // evidencias de la firma. Maquetación propia en A4.
  // =====================================================================
  async function anexo() {
    const A4 = [595.28, 841.89];
    const MARGEN = 46;
    const ancho = A4[0] - 2 * MARGEN;
    let page;
    let y;
    const nueva = () => { page = pdf.addPage(A4); y = A4[1] - MARGEN; };
    const hueco = (h) => { if (y - h < MARGEN + 20) nueva(); };

    function parrafo(t, { size = 8.6, fuente = f, color = NEGRO, despues = 5 } = {}) {
      const lh = size * 1.4;
      for (const l of partir(limpiar(t), fuente, size, ancho)) {
        hueco(lh);
        page.drawText(l, { x: MARGEN, y: y - size, size, font: fuente, color });
        y -= lh;
      }
      y -= despues;
    }

    let n = 0;
    function seccion(titulo) {
      n += 1;
      hueco(70);
      y -= 10;
      page.drawRectangle({ x: MARGEN, y: y - 17, width: ancho, height: 17, color: rgb(0.14, 0.14, 0.15) });
      page.drawText(limpiar(`${n}. ${titulo}`).toUpperCase(), { x: MARGEN + 8, y: y - 12, size: 8.5, font: fb, color: rgb(1, 1, 1) });
      y -= 26;
    }

    function fila(etiqueta, valor) {
      const etiquetas = partir(limpiar(etiqueta), fb, 8, ancho * 0.33);
      const lineas = partir(limpiar(valor || '—'), f, 9, ancho * 0.62);
      const h = Math.max(etiquetas.length, lineas.length) * 12 + 6;
      hueco(h);
      etiquetas.forEach((l, i) => page.drawText(l, { x: MARGEN, y: y - 9 - i * 12, size: 8, font: fb, color: GRIS }));
      lineas.forEach((l, i) => page.drawText(l, { x: MARGEN + ancho * 0.36, y: y - 9 - i * 12, size: 9, font: f, color: NEGRO }));
      y -= h;
      page.drawLine({ start: { x: MARGEN, y: y + 3 }, end: { x: MARGEN + ancho, y: y + 3 }, thickness: 0.4, color: LINEA });
    }

    nueva();
    page.drawText(limpiar(ORGANIZACION.nombre).toUpperCase(), { x: MARGEN, y: y - 8, size: 8, font: fb, color: GRIS });
    y -= 16;
    page.drawText(limpiar('Anexo · Firma electrónica y documentación'), { x: MARGEN, y: y - 18, size: 17, font: fb, color: NEGRO });
    y -= 28;
    parrafo(`${nombreEducando} · Ronda ${d.ronda} · ${d.seccion || 'Sección sin asignar'}`, { size: 10, despues: 2 });
    parrafo(
      `Las páginas anteriores son las autorizaciones anuales del grupo${adulto ? ' para mayores de edad' : ''}, ` +
        'rellenadas con los datos introducidos en el formulario web (en azul). Este anexo recoge lo que no tiene ' +
        'sitio en el papel.',
      { size: 8.2, color: GRIS, despues: 4 },
    );

    seccion('Documentación aportada');
    for (const h of huecosDocumentos(adulto, adulto ? [] : d.tutores, d.documentos || [])) {
      const doc = h.archivo;
      if (h.cara === 'detras' && !doc) continue; // con un PDF no hace falta la de detrás
      hueco(36);
      const titulo = h.cara === 'delante' && !(d.documentos || []).some((x) => x.tipo === `${h.tipo}_reverso`)
        ? h.doc.nombre : h.nombre;
      page.drawText(limpiar(titulo), { x: MARGEN, y: y - 9, size: 9, font: fb, color: NEGRO });
      const info = limpiar(doc ? `${doc.nombre_archivo} · ${formatoTamano(doc.tamano)}` : 'No aportado');
      page.drawText(info, { x: MARGEN + ancho - f.widthOfTextAtSize(info, 8.2), y: y - 9, size: 8.2, font: f, color: GRIS });
      y -= 15;
      if (doc?.sha256) {
        page.drawText(`SHA-256  ${doc.sha256}`, { x: MARGEN, y: y - 7, size: 7, font: fm, color: GRIS });
        y -= 12;
      }
      page.drawLine({ start: { x: MARGEN, y: y - 1 }, end: { x: MARGEN + ancho, y: y - 1 }, thickness: 0.4, color: LINEA });
      y -= 8;
    }
    parrafo('La huella SHA-256 identifica cada archivo: si se modificara después, aunque fuera un píxel, dejaría de coincidir.',
      { size: 7.8, color: GRIS });

    seccion('Consentimientos recogidos en el formulario');
    const siNo = (v) => (v === true ? 'Sí' : v === false ? 'No' : '—');
    if (!adulto) fila('Asistencia y participación', siNo(a.acepta_participacion));
    fila('Ha leído la información de protección de datos', siNo(a.acepta_info_rgpd));
    fila('Consentimiento explícito para tratar los datos de salud', siNo(a.consiente_datos_salud));
    fila('Imagen: canales internos', siNo(a.imagen_canales_internos));
    fila('Imagen: redes, web y medios', siNo(a.imagen_redes_y_medios));
    fila('Imagen: grupos de mensajería', siNo(a.imagen_mensajeria));
    if (!adulto) fila('Administración de medicamentos', siNo(a.autoriza_medicacion));

    if (desbordes.length) {
      seccion('Textos completos que no cabían en el papel');
      const vistos = new Set();
      for (const [etiqueta, texto] of desbordes) {
        if (vistos.has(texto)) continue; // el mismo dato puede no caber en dos documentos
        vistos.add(texto);
        fila(etiqueta, texto);
      }
    }

    seccion('Firma');
    fila('Firmado por', `${firmante}${firmanteDoc ? ` · ${firmanteDoc}` : ''}`);
    fila('Lugar y fecha', `${d.firma?.lugar || '—'}${fecha ? `, ${fecha.texto}` : ''}`);
    fila('Firma', pngFirma ? 'En cada documento de las páginas anteriores' : 'Pendiente');

    if (d.evidencias) {
      const ev = d.evidencias;
      seccion('Evidencias de la firma electrónica');
      fila('Cuenta que firma (correo verificado)', ev.email);
      fila('Fecha y hora (reloj del servidor)', ev.fecha ? partesFecha(ev.fecha).conHora : '');
      fila('Dirección IP', ev.ip);
      fila('Navegador / dispositivo', ev.user_agent);
      fila('Identificador de la inscripción', d.id);
      parrafo(
        'Firma electrónica simple: la persona accedió con un enlace de un solo uso enviado a su correo, revisó ' +
          'los datos y firmó en pantalla. El servidor generó este PDF, calculó su huella SHA-256 y la guardó junto ' +
          'a la inscripción; cualquier cambio posterior en el archivo se puede detectar comparando la huella.',
        { size: 7.8, color: GRIS },
      );
    }
  }
}

// ---------------------------------------------------------------------
function partir(texto, fuente, size, max) {
  const lineas = [];
  let linea = '';
  for (const palabra of String(texto).split(' ').filter(Boolean)) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (fuente.widthOfTextAtSize(prueba, size) <= max) {
      linea = prueba;
      continue;
    }
    if (linea) lineas.push(linea);
    let resto = palabra;
    while (fuente.widthOfTextAtSize(resto, size) > max && resto.length > 1) {
      let i = resto.length - 1;
      while (i > 1 && fuente.widthOfTextAtSize(resto.slice(0, i), size) > max) i--;
      lineas.push(resto.slice(0, i));
      resto = resto.slice(i);
    }
    linea = resto;
  }
  if (linea) lineas.push(linea);
  return lineas;
}

function partesFecha(iso) {
  const fecha = new Date(iso);
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'long', year: 'numeric' })
      .formatToParts(fecha).map((x) => [x.type, x.value]),
  );
  return {
    dia: p.day,
    mes: p.month,
    anio: p.year,
    anio2: String(p.year).slice(2),
    texto: `${p.day} de ${p.month} de ${p.year}`,
    conHora: new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid', dateStyle: 'long', timeStyle: 'medium',
    }).format(fecha) + ' (hora de Madrid)',
  };
}
