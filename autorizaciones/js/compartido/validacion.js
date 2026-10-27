// COPIA generada por `npm run construir`. Edita el original en supabase/functions/_shared/
// Comprueba que una inscripción está completa antes de firmar.
// La usan el formulario (para avisar a la familia) y el servidor (que es
// quien manda: el navegador se puede saltar, el servidor no).

import { PREGUNTAS_SANITARIAS, PREGUNTAS_ADULTOS, IMAGEN_OPCIONES, documentosPara } from './textos-legales.js';

// DNI y NIE: si tiene ese formato, la letra tiene que cuadrar con el
// número. Pasaportes y otros documentos se aceptan tal cual.
const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';
export function normalizarDocumento(v) {
  return String(v ?? '').toUpperCase().replace(/[\s.-]/g, '');
}
export function errorDocumento(v) {
  const d = normalizarDocumento(v);
  let numero = null;
  if (/^\d{8}[A-Z]$/.test(d)) numero = d.slice(0, 8);
  else if (/^[XYZ]\d{7}[A-Z]$/.test(d)) numero = 'XYZ'.indexOf(d[0]) + d.slice(1, 8);
  if (numero === null) return null;
  return LETRAS_DNI[Number(numero) % 23] === d.at(-1) ? null : 'La letra no corresponde a ese número';
}

const vacio = (v) => v === undefined || v === null || String(v).trim() === '';
const sinElegir = (v) => v !== true && v !== false;

export const OBLIGATORIOS_EDUCANDO = [
  ['nombre', 'Nombre del socio/a'],
  ['apellidos', 'Apellidos del socio/a'],
  ['fecha_nacimiento', 'Fecha de nacimiento'],
  ['direccion', 'Dirección'],
  ['poblacion', 'Población'],
  ['provincia', 'Provincia'],
  ['codigo_postal', 'Código postal'],
];

export const OBLIGATORIOS_TUTOR = [
  ['documento', 'DNI/NIE'],
  ['nombre', 'Nombre'],
  ['apellidos', 'Apellidos'],
  ['movil', 'Móvil'],
  ['email', 'Correo electrónico'],
];

export function faltanDatos(d) {
  const f = [];
  const e = d.educando || {};
  const adulto = d.adulto === true;
  for (const [c, n] of OBLIGATORIOS_EDUCANDO) if (vacio(e[c])) f.push(n);
  if (!d.seccion_id && vacio(d.seccion)) f.push('Sección');

  if (adulto) {
    // Scouters y comité: sin tutores; contacto de emergencia propio.
    if (vacio(e.documento)) f.push('DNI/NIE');
    else if (errorDocumento(e.documento)) f.push('DNI/NIE: letra incorrecta');
    if (vacio(e.movil)) f.push('Móvil');
    if (vacio(e.email)) f.push('Correo electrónico');
    const c = d.contacto || {};
    if (vacio(c.nombre)) f.push('Nombre del contacto de emergencia');
    if (vacio(c.telefono1)) f.push('Teléfono del contacto de emergencia');
  } else {
    const tutores = d.tutores || [];
    if (!tutores.length) f.push('Datos del primer tutor/a legal');
    tutores.forEach((t, i) => {
      for (const [c, n] of OBLIGATORIOS_TUTOR) if (vacio(t[c])) f.push(`${n} del tutor/a ${i + 1}`);
      if (!vacio(t.documento) && errorDocumento(t.documento)) f.push(`DNI/NIE del tutor/a ${i + 1}: letra incorrecta`);
      if (sinElegir(t.whatsapp_autoriza)) f.push(`Respuesta sobre WhatsApp del tutor/a ${i + 1}`);
      if (t.whatsapp_autoriza === true && vacio(t.whatsapp_telefono)) {
        f.push(`Teléfono para WhatsApp del tutor/a ${i + 1}`);
      }
    });
  }

  const s = d.ficha || {};
  if (!adulto) {
    if (vacio(s.seguro)) f.push('Seguro médico');
    if (vacio(s.numero_seguro)) f.push('Número del seguro');
  }
  for (const p of adulto ? PREGUNTAS_ADULTOS : PREGUNTAS_SANITARIAS) {
    if (p.grupo === 'mujer') continue; // opcionales
    if (sinElegir(s[p.campo])) f.push(`Ficha sanitaria: ${p.texto}`);
    else if (p.cual && s[p.campo] === true && vacio(s[p.campoCual || `${p.campo}_cual`])) {
      f.push(`Ficha sanitaria: indica cuál (${p.texto})`);
    }
  }

  const a = d.autorizaciones || {};
  if (!adulto) {
    if (a.acepta_participacion !== true) f.push('Aceptar la autorización de asistencia');
    if (sinElegir(a.vuelve_solo)) f.push('Respuesta sobre volver solo/a a casa');
    if (sinElegir(a.autoriza_medicacion)) f.push('Respuesta sobre administración de medicamentos');
  }
  for (const o of IMAGEN_OPCIONES) {
    if (sinElegir(a[o.campo])) f.push(`Cesión de imagen: ${o.corto}`);
  }

  const subidos = new Set((d.documentos || []).map((x) => x.tipo));
  for (const doc of documentosPara(adulto)) {
    if (doc.obligatorio && !subidos.has(doc.tipo)) f.push(`Documento: ${doc.nombre}`);
  }
  return f;
}

// Solo lo que falta para poder pulsar "Firmar" (consentimientos y firmante).
export function faltanParaFirmar(d) {
  const f = faltanDatos(d);
  const a = d.autorizaciones || {};
  if (a.acepta_info_rgpd !== true) f.push('Confirmar que has leído la información de protección de datos');
  if (a.consiente_datos_salud !== true) f.push('Consentimiento para tratar los datos de salud');
  const firma = d.firma || {};
  if (vacio(firma.nombre)) f.push('Nombre de quien firma');
  if (vacio(firma.documento)) f.push('DNI/NIE de quien firma');
  else if (errorDocumento(firma.documento)) f.push('DNI/NIE de quien firma: letra incorrecta');
  if (vacio(firma.lugar)) f.push('Lugar de la firma');
  return f;
}
