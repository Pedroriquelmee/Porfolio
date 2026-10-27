// =====================================================================
// Formulario por pasos de la inscripción anual.
// No sabe nada de Supabase: guarda a través de un "almacén" que se le
// pasa (almacen-supabase.js en la web real, almacen-demo.js en la demo).
// =====================================================================
import { el, aviso, ESTADOS } from './dom.js';
import { crearPadFirma } from './firma.js';
import * as T from './compartido/textos-legales.js';
import {
  faltanDatos, faltanParaFirmar, errorDocumento, normalizarDocumento,
} from './compartido/validacion.js';
import { tipoReal, TAMANO_MAXIMO, formatoTamano } from './compartido/archivos.js';
import { generarExpediente } from './compartido/plantilla-pdf.js';

// Mismo número de pasos para menores y adultos; cambia lo que hay en cada uno.
const PASOS_MENORES = ['El/la socio/a', 'Tutores legales', 'Ficha sanitaria', 'Autorizaciones', 'Documentos', 'Revisar y firmar'];
const PASOS_ADULTOS = ['Tus datos', 'Contacto de emergencia', 'Ficha sanitaria', 'Fotos y vídeos', 'Documentos', 'Revisar y firmar'];
const N_PASOS = 6;

let contador = 0;
const nuevoId = () => `c${++contador}`;
const hoy = () => new Date().toISOString().slice(0, 10);
const arriba = () => window.scrollTo({ top: 0 });

/**
 * @param raiz      elemento donde se pinta
 * @param opciones  { almacen, PDFLib, plantilla: (adulto) => Promise<bytes del PDF original>,
 *                    salir?: url, ejemplo?: { datos, adulto, documentos(PDFLib, adulto) } }
 */
export async function montarFormulario(raiz, opciones) {
  const { almacen, PDFLib, ejemplo } = opciones;
  raiz.replaceChildren(el('p', { class: 'cargando' }, 'Cargando…'));

  let est;
  try {
    est = await almacen.cargar();
  } catch (e) {
    raiz.replaceChildren(el('div', { class: 'mensaje mensaje--error' }, e?.message || String(e)));
    return;
  }

  let paso = 0;
  let pad = null;
  let ocupado = false;
  const seccionActual = () => est.secciones.find((s) => s.id === Number(est.seccion_id));
  const nombreSeccion = () => seccionActual()?.nombre || '';
  // Scouters y Comité: la persona adulta se inscribe a sí misma.
  const esAdulto = () => seccionActual()?.adultos === true;
  const pasos = () => (esAdulto() ? PASOS_ADULTOS : PASOS_MENORES);

  // ------------------------------------------------------------------
  // Pintado general
  // ------------------------------------------------------------------
  function pintar() {
    pad = null;
    raiz.replaceChildren(...[
      cabecera(),
      est.estado === 'rechazada' && est.motivo_rechazo
        ? el('div', { class: 'mensaje mensaje--aviso' },
          el('strong', {}, 'El equipo te ha devuelto la inscripción para corregirla: '), est.motivo_rechazo)
        : null,
      el('div', { id: 'errores', 'aria-live': 'polite' }),
      el('form', {
        id: 'paso', novalidate: true,
        onsubmit: (ev) => { ev.preventDefault(); if (paso < N_PASOS - 1) siguiente(); },
      }, PINTORES[paso]()),
      navegacion(),
    ].filter(Boolean)); // replaceChildren(null) pintaría el texto "null"
  }

  function cabecera() {
    return el('div', { class: 'pasos' },
      el('div', { class: 'pasos__texto' }, `Paso ${paso + 1} de ${N_PASOS} · Ronda ${est.ronda}`),
      el('h1', {}, pasos()[paso]),
      el('div', { class: 'pasos__barra' }, pasos().map((nombre, i) => el('button', {
        type: 'button',
        class: i < paso ? 'hecho' : i === paso ? 'actual' : '',
        'aria-label': `Volver al paso ${i + 1}: ${nombre}`,
        disabled: i >= paso,
        onclick: () => { paso = i; pintar(); arriba(); },
      }))));
  }

  function navegacion() {
    const ultimo = paso === N_PASOS - 1;
    const atras = paso > 0
      ? el('button', { type: 'button', class: 'boton boton--secundario', onclick: () => { paso--; pintar(); arriba(); } }, 'Atrás')
      : opciones.salir ? el('a', { class: 'boton boton--secundario', href: opciones.salir }, 'Salir') : null;
    return el('div', { class: 'navegacion' }, el('div', { class: 'navegacion__dentro' },
      atras,
      el('button', { type: 'button', class: 'boton', id: 'boton-siguiente', onclick: ultimo ? firmar : siguiente },
        ultimo ? 'Firmar y enviar' : 'Guardar y seguir')));
  }

  async function siguiente() {
    if (ocupado) return;
    const errores = [...validarFormulario(raiz.querySelector('#paso')), ...(EXTRA[paso]?.() ?? [])];
    if (errores.length) return mostrarErrores(errores);
    await conBoton('Guardando…', async () => {
      est.adulto = esAdulto();
      await almacen.guardar(paso, est);
      paso += 1;
      pintar();
      arriba();
    });
  }

  async function conBoton(textoOcupado, fn) {
    const b = raiz.querySelector('#boton-siguiente');
    const original = b?.textContent;
    ocupado = true;
    if (b) { b.disabled = true; b.textContent = textoOcupado; }
    try {
      await fn();
    } catch (e) {
      console.error(e);
      aviso(e?.message || 'Algo ha fallado. Inténtalo de nuevo.', 'error', 8000);
      if (b?.isConnected) { b.disabled = false; b.textContent = original; }
    } finally {
      ocupado = false;
    }
  }

  function mostrarErrores(errores) {
    const caja = raiz.querySelector('#errores');
    caja.replaceChildren(el('div', { class: 'mensaje mensaje--error', role: 'alert' },
      el('strong', {}, errores.length === 1 ? 'Revisa este dato:' : `Revisa estos ${errores.length} datos:`),
      el('ul', {}, errores.slice(0, 8).map((e) => el('li', {}, e.texto)))));
    const primero = errores.find((e) => e.nodo)?.nodo;
    (primero || caja).scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (primero?.focus) setTimeout(() => primero.focus({ preventScroll: true }), 350);
  }

  // Comprobaciones que no se pueden expresar con atributos HTML.
  const EXTRA = {
    1: () => (esAdulto() || est.tutores.length ? [] : [{ texto: 'Añade al menos un tutor/a' }]),
    4: () => T.documentosPara(esAdulto())
      .filter((d) => d.obligatorio && !est.documentos.some((x) => x.tipo === d.tipo))
      .map((d) => ({ texto: `Falta subir: ${d.nombre}`, nodo: raiz.querySelector(`[data-doc="${d.tipo}"] label`) })),
  };

  // ------------------------------------------------------------------
  // Pasos
  // ------------------------------------------------------------------
  const PINTORES = [
    pasoSocio,
    () => (esAdulto() ? pasoContacto() : pasoTutores()),
    () => (esAdulto() ? pasoFichaAdulto() : pasoFicha()),
    () => (esAdulto() ? pasoImagen() : pasoAutorizaciones()),
    pasoDocumentos,
    pasoFirmar,
  ];

  function pasoSocio() {
    const e = est.educando;
    const adulto = esAdulto();
    return [
      ejemplo ? el('div', { class: 'tarjeta' },
        el('p', { class: 'pequeno suave' }, 'Para ir rápido puedes rellenar todo con datos inventados y luego ir pasando de paso.'),
        el('div', { class: 'botones' },
          el('button', { type: 'button', class: 'boton boton--secundario', onclick: () => rellenarEjemplo(false) },
            'Ejemplo: niña de Manada'),
          el('button', { type: 'button', class: 'boton boton--secundario', onclick: () => rellenarEjemplo(true) },
            'Ejemplo: scouter'))) : null,
      el('div', { class: 'tarjeta' },
        selector(est, 'seccion_id', '¿A qué sección es la inscripción?', est.secciones, {
          ayuda: 'Scouters y Comité: te inscribes tú, como persona adulta.',
          // Si cambia entre menores y adultos, el formulario cambia de forma.
          alCambiar: (antes) => {
            const eraAdulto = est.secciones.find((x) => x.id === Number(antes))?.adultos === true;
            if (eraAdulto !== esAdulto()) pintar();
          },
        })),
      el('p', { class: 'suave' }, [
        adulto ? 'Tus datos personales.' : 'Datos de la persona que se inscribe.',
        almacen.demo ? '' : ' Lo que rellenes se guarda en cada paso, así que puedes dejarlo y seguir otro día.',
      ].join('')),
      el('div', { class: 'tarjeta' }, el('div', { class: 'rejilla rejilla--2' },
        texto(e, 'nombre', 'Nombre', { max: 80, auto: adulto ? 'given-name' : 'off' }),
        texto(e, 'apellidos', 'Apellidos', { max: 120, auto: adulto ? 'family-name' : 'off' }),
        texto(e, 'fecha_nacimiento', 'Fecha de nacimiento', { tipo: 'date', maxFecha: hoy() }),
        texto(e, 'documento', adulto ? 'DNI / NIE' : 'DNI / NIE / pasaporte', { opcional: !adulto, documento: true, max: 20 }))),
      el('div', { class: 'tarjeta' }, el('h2', {}, 'Domicilio y contacto'), el('div', { class: 'rejilla rejilla--2' },
        texto(e, 'direccion', 'Dirección', { doble: true, auto: 'street-address', max: 200 }),
        texto(e, 'poblacion', 'Población', { auto: 'address-level2', max: 80 }),
        texto(e, 'provincia', 'Provincia', { auto: 'address-level1', max: 80 }),
        texto(e, 'codigo_postal', 'Código postal', {
          modo: 'numeric', patron: '\\d{5}', formato: 'Son 5 números', max: 5, auto: 'postal-code',
        }),
        texto(e, 'telefono_fijo', 'Teléfono fijo', { opcional: true, tipo: 'tel', max: 20 }),
        texto(e, 'movil', adulto ? 'Móvil' : 'Móvil del socio/a', { opcional: !adulto, tipo: 'tel', max: 20, auto: adulto ? 'tel' : 'off' }),
        texto(e, 'email', adulto ? 'Correo electrónico' : 'Correo del socio/a',
          { opcional: !adulto, tipo: 'email', max: 120, auto: adulto ? 'email' : 'off' }))),
    ];
  }

  function pasoContacto() {
    const c = est.contacto;
    return [
      el('p', { class: 'suave' }, 'Una persona a la que avisar si te pasa algo durante una actividad.'),
      el('div', { class: 'tarjeta' }, el('div', { class: 'rejilla rejilla--2' },
        texto(c, 'nombre', 'Nombre y apellidos', { doble: true, max: 120 }),
        texto(c, 'telefono1', 'Teléfono 1', { tipo: 'tel', max: 20 }),
        texto(c, 'telefono2', 'Teléfono 2', { opcional: true, tipo: 'tel', max: 20 }))),
    ];
  }

  function pasoFichaAdulto() {
    const s = est.ficha;
    const pregunta = (p) => siNo(s, p.campo, p.texto, {
      cual: p.cual, campoCual: p.campoCual, etiquetaCual: p.etiquetaCual, ayuda: p.ayuda, opcional: p.grupo === 'mujer',
    });
    return [
      el('div', { class: 'mensaje mensaje--info pequeno' },
        'Estos datos solo los ve la coordinación del grupo, y cada consulta queda registrada.'),
      el('div', { class: 'tarjeta' }, T.PREGUNTAS_ADULTOS.filter((p) => p.grupo !== 'mujer').map(pregunta)),
      el('div', { class: 'tarjeta' },
        el('h2', {}, 'En caso de ser mujer'),
        el('p', { class: 'pequeno suave' }, 'Opcional. Solo sirve para atenderte bien si hay una urgencia médica.'),
        T.PREGUNTAS_ADULTOS.filter((p) => p.grupo === 'mujer').map(pregunta)),
    ];
  }

  function pasoImagen() {
    const a = est.autorizaciones;
    const e = est.educando;
    return [
      el('div', { class: 'tarjeta' },
        el('h2', {}, 'Cesión de imagen'),
        el('details', {}, el('summary', {}, 'Leer el texto completo'),
          T.IMAGEN_PARRAFOS_ADULTOS.map((p) => el('p', {},
            T.rellenar(p, { nombre: `${e.nombre || ''} ${e.apellidos || ''}`.trim(), documento: e.documento, ...T.ORGANIZACION })))),
        T.IMAGEN_OPCIONES.map((o) => siNo(a, o.campo, o.corto, {
          corto: `Imagen: ${o.corto}`,
          detalle: el('details', {}, el('summary', {}, 'Qué incluye'), el('p', {}, o.texto)),
        }))),
    ];
  }

  function pasoTutores() {
    return [
      el('p', { class: 'suave' }, 'Padre, madre o tutor/a legal. El segundo es opcional.'),
      est.tutores.map((t, i) => tarjetaTutor(t, i)),
      est.tutores.length < 2
        ? el('button', {
          type: 'button', class: 'boton boton--secundario boton--bloque',
          onclick: () => { est.tutores.push({}); pintar(); },
        }, 'Añadir segundo tutor/a')
        : null,
    ];
  }

  function tarjetaTutor(t, i) {
    const telefonoWa = texto(t, 'whatsapp_telefono', 'Número para el grupo de WhatsApp', { tipo: 'tel', max: 20 });
    if (t.whatsapp_autoriza !== true) telefonoWa.classList.add('oculto');
    const auto = (v) => (i === 0 ? v : 'off');
    return el('div', { class: 'tarjeta' },
      el('div', { class: 'tarjeta__cabecera' },
        el('h2', {}, `Tutor/a legal ${i + 1}`),
        i === 1 ? el('button', {
          type: 'button', class: 'boton boton--fantasma boton--pequeno',
          onclick: () => { est.tutores.splice(1, 1); pintar(); },
        }, 'Quitar') : null),
      el('div', { class: 'rejilla rejilla--2' },
        texto(t, 'nombre', 'Nombre', { auto: auto('given-name'), max: 80 }),
        texto(t, 'apellidos', 'Apellidos', { auto: auto('family-name'), max: 120 }),
        texto(t, 'documento', 'DNI / NIE / pasaporte', { documento: true, max: 20 }),
        texto(t, 'profesion', 'Profesión', { opcional: true, max: 80 }),
        texto(t, 'movil', 'Móvil', { tipo: 'tel', auto: auto('tel'), max: 20 }),
        texto(t, 'telefono_fijo', 'Teléfono fijo', { opcional: true, tipo: 'tel', max: 20 }),
        texto(t, 'email', 'Correo electrónico', { tipo: 'email', auto: auto('email'), doble: true, max: 120 })),
      siNo(t, 'whatsapp_autoriza', '¿Quiere estar en el grupo de WhatsApp de la sección?', {
        corto: `WhatsApp del tutor/a ${i + 1}`,
        detalle: el('details', {}, el('summary', {}, 'Normas del grupo'),
          el('ul', {}, T.WHATSAPP_NORMAS.map((n) => el('li', {}, n)))),
        alCambiar: (v) => {
          telefonoWa.classList.toggle('oculto', !v);
          if (v && !t.whatsapp_telefono) {
            t.whatsapp_telefono = t.movil || '';
            telefonoWa.querySelector('input').value = t.whatsapp_telefono;
          }
        },
      }),
      telefonoWa);
  }

  function pasoFicha() {
    const s = est.ficha;
    return [
      el('div', { class: 'mensaje mensaje--info pequeno' },
        'Estos datos solo los ven la coordinación y los scouters de su sección, y cada consulta queda registrada.'),
      el('div', { class: 'tarjeta' }, el('div', { class: 'rejilla rejilla--2' },
        texto(s, 'seguro', 'Seguro médico', { ejemplo: 'Seguridad Social, Adeslas…', max: 120 }),
        texto(s, 'numero_seguro', 'Número del seguro o de la tarjeta', { max: 60 }))),
      el('div', { class: 'tarjeta' }, T.PREGUNTAS_SANITARIAS.map((p) => siNo(s, p.campo, p.texto, { cual: p.cual }))),
      el('div', { class: 'tarjeta' },
        texto(s, 'otras_alergias', 'Otras alergias (alimentos, picaduras, polen…)', { area: true, opcional: true, max: 500 }),
        texto(s, 'necesidades_educativas', 'Necesidades educativas especiales (TDA, hiperactividad, dislexia…)',
          { area: true, opcional: true, max: 500 })),
    ];
  }

  function pasoAutorizaciones() {
    const a = est.autorizaciones;
    const educando = `${est.educando.nombre || ''} ${est.educando.apellidos || ''}`.trim();
    return [
      el('div', { class: 'tarjeta' },
        el('h2', {}, 'Asistencia y participación'),
        el('p', { class: 'pequeno' },
          'Autorizas la participación en las actividades de la ronda, las decisiones médico-quirúrgicas en caso ' +
          'de extrema urgencia y que los scouters le trasladen en vehículo privado si hace falta.'),
        el('details', {}, el('summary', {}, 'Leer el texto completo'),
          el('p', {}, T.rellenar(T.ASISTENCIA, { ronda: est.ronda }))),
        casilla(a, 'acepta_participacion', 'He leído y acepto la autorización de asistencia y participación.',
          'Autorización de asistencia'),
        siNo(a, 'vuelve_solo', '¿Puede volver solo/a a casa al terminar las actividades?', { corto: 'Volver solo/a a casa' })),
      el('div', { class: 'tarjeta' },
        el('h2', {}, 'Medicamentos'),
        el('p', { class: 'pequeno suave' }, T.MEDICACION_INTRO),
        siNo(a, 'autoriza_medicacion',
          '¿Autorizas al equipo a darle la medicación prescrita o que necesite, informándote antes?',
          { corto: 'Medicamentos' })),
      el('div', { class: 'tarjeta' },
        el('h2', {}, 'Fotos y vídeos'),
        el('details', {}, el('summary', {}, 'Leer la cesión de imagen completa'),
          T.IMAGEN_PARRAFOS.map((p) => el('p', {}, T.rellenar(p, { educando, ...T.ORGANIZACION })))),
        T.IMAGEN_OPCIONES.map((o) => siNo(a, o.campo, o.corto, {
          corto: `Imagen: ${o.corto}`,
          detalle: el('details', {}, el('summary', {}, 'Qué incluye'), el('p', {}, o.texto)),
        }))),
    ];
  }

  function pasoDocumentos() {
    return [
      el('p', { class: 'suave' }, 'Haz una foto o sube un PDF de cada documento. Valen PDF, JPG o PNG de hasta 5 MB.'),
      T.documentosPara(esAdulto()).map((d) => tarjetaDocumento(d)),
    ];
  }

  function tarjetaDocumento(d) {
    const actual = est.documentos.find((x) => x.tipo === d.tipo);
    const id = nuevoId();
    const input = el('input', {
      id, type: 'file', accept: 'application/pdf,image/jpeg,image/png',
      onchange: (ev) => {
        const f = ev.target.files?.[0];
        if (f) subir(d, f);
      },
    });
    return el('div', { class: 'tarjeta', dataset: { doc: d.tipo } }, el('div', { class: 'doc' },
      el('div', { class: 'doc__info' },
        el('div', { class: 'doc__nombre' }, d.nombre),
        actual
          ? el('div', { class: 'doc__estado doc__estado--ok' }, `✓ ${actual.nombre_archivo} · ${formatoTamano(actual.tamano)}`)
          : el('div', { class: 'doc__estado' }, d.obligatorio ? 'Pendiente' : 'Opcional')),
      el('div', { class: 'botones' },
        el('label', { class: `boton boton--pequeno subir${actual ? ' boton--secundario' : ''}` },
          actual ? 'Cambiar' : 'Subir', input),
        actual ? el('button', {
          type: 'button', class: 'boton boton--peligro boton--pequeno', onclick: () => quitar(d),
        }, 'Quitar') : null)));
  }

  async function subir(d, archivo) {
    if (ocupado) return;
    const estado = raiz.querySelector(`[data-doc="${d.tipo}"] .doc__estado`);
    ocupado = true;
    try {
      if (estado) estado.textContent = 'Comprobando el archivo…';
      const preparado = await prepararArchivo(archivo);
      if (estado) estado.textContent = 'Subiendo…';
      const meta = await almacen.subirDocumento(est, d.tipo, preparado);
      est.documentos = est.documentos.filter((x) => x.tipo !== d.tipo).concat(meta);
      aviso(`Subido: ${d.nombre}`);
    } catch (e) {
      console.error(e);
      aviso(e?.message || 'No se ha podido subir el archivo', 'error', 8000);
    } finally {
      ocupado = false;
      pintar();
    }
  }

  async function quitar(d) {
    if (ocupado) return;
    ocupado = true;
    try {
      await almacen.quitarDocumento(est, d.tipo);
      est.documentos = est.documentos.filter((x) => x.tipo !== d.tipo);
    } catch (e) {
      aviso(e?.message || 'No se ha podido quitar', 'error');
    } finally {
      ocupado = false;
      pintar();
    }
  }

  function pasoFirmar() {
    const f = est.firma;
    const quien = esAdulto() ? est.educando : est.tutores[0] || {};
    if (!f.nombre) f.nombre = `${quien.nombre || ''} ${quien.apellidos || ''}`.trim();
    if (!f.documento && quien.documento) f.documento = quien.documento;
    if (!f.lugar && est.educando.poblacion) f.lugar = est.educando.poblacion;

    const falta = faltanDatos(datosPdf());
    const zonaFirma = el('div');
    const nodos = [
      falta.length ? el('div', { class: 'mensaje mensaje--aviso' },
        el('strong', {}, 'Antes de firmar falta:'),
        el('ul', {}, falta.map((x) => el('li', {}, x)))) : null,
      resumen(),
      el('div', { class: 'tarjeta' },
        el('h2', {}, 'Protección de datos'),
        el('details', {}, el('summary', {}, 'Leer la información completa'),
          el('p', {}, T.RGPD_INTRO),
          el('ul', {}, T.RGPD_PUNTOS.map((p) => el('li', {}, p)))),
        casilla(est.autorizaciones, 'acepta_info_rgpd', T.RGPD_LEIDO, 'Información de protección de datos'),
        casilla(est.autorizaciones, 'consiente_datos_salud', T.RGPD_SALUD, 'Consentimiento de datos de salud')),
      el('div', { class: 'tarjeta' },
        el('h2', {}, 'Quién firma'),
        el('div', { class: 'rejilla rejilla--2' },
          texto(f, 'nombre', 'Nombre y apellidos', { doble: true, max: 120 }),
          texto(f, 'documento', 'DNI / NIE', { documento: true, max: 20 }),
          texto(f, 'lugar', 'Lugar', { max: 80 }))),
      el('div', { class: 'tarjeta' },
        el('h2', {}, 'Revisa el documento'),
        el('p', { class: 'pequeno suave' }, 'Es exactamente lo que vas a firmar, con todo lo que has rellenado.'),
        el('button', { type: 'button', class: 'boton boton--secundario boton--bloque', onclick: verBorrador },
          'Ver el documento (PDF)')),
      el('div', { class: 'tarjeta' },
        el('div', { class: 'tarjeta__cabecera' },
          el('h2', {}, 'Firma'),
          el('button', { type: 'button', class: 'boton boton--fantasma boton--pequeno', onclick: () => pad?.borrar() }, 'Borrar')),
        zonaFirma,
        el('p', { class: 'ayuda' },
          'Firma con el dedo. Al enviar, el servidor genera el PDF definitivo y guarda su huella digital: ' +
          'si alguien lo modificara después, se notaría.'),
        ejemplo ? el('button', {
          type: 'button', class: 'boton boton--fantasma boton--pequeno', onclick: () => pad?.dibujarEjemplo(),
        }, 'Poner una firma de ejemplo') : null),
    ];
    pad = crearPadFirma(zonaFirma);
    pad.elemento.addEventListener('cambio', () => {
      pad.elemento.classList.remove('con-error');
      raiz.querySelector('#errores')?.replaceChildren();
    });
    return nodos;
  }

  function resumen() {
    const e = est.educando;
    const docs = T.documentosPara(esAdulto());
    const subidos = docs.filter((d) => est.documentos.some((x) => x.tipo === d.tipo)).length;
    return el('div', { class: 'tarjeta' }, el('dl', {},
      dato('Socio/a', `${e.nombre || ''} ${e.apellidos || ''}`.trim()),
      dato('Sección', nombreSeccion()),
      esAdulto()
        ? dato('Contacto de emergencia', [est.contacto.nombre, est.contacto.telefono1].filter(Boolean).join(' · '))
        : dato('Tutores', est.tutores.map((t) => `${t.nombre || ''} ${t.apellidos || ''}`.trim()).join(' y ')),
      dato('Documentos', `${subidos} de ${docs.length} subidos`)));
  }

  async function firmar() {
    if (ocupado) return;
    const errores = validarFormulario(raiz.querySelector('#paso'));
    if (!pad || pad.vacia()) {
      pad?.elemento.classList.add('con-error');
      errores.push({ texto: 'Falta la firma', nodo: pad?.elemento });
    }
    if (errores.length) return mostrarErrores(errores);
    const falta = faltanParaFirmar(datosPdf());
    if (falta.length) return mostrarErrores(falta.map((texto) => ({ texto })));
    const png = pad.aPng();
    est.adulto = esAdulto();
    await conBoton('Firmando…', async () => {
      const r = await almacen.firmar(est, png);
      Object.assign(est, { estado: 'firmada', pdf_sha256: r.pdf_sha256, firmada_en: r.firmada_en });
      pintarFirmada(true);
    });
  }

  function pintarFirmada(recien) {
    raiz.replaceChildren(el('div', { class: 'tarjeta' },
      el('h1', {}, recien ? 'Inscripción firmada' : 'Esta inscripción ya está firmada'),
      el('p', {}, recien
        ? 'Gracias. El equipo la revisará y te avisará si falta algo.'
        : `Estado: ${ESTADOS[est.estado] ?? est.estado}. Si necesitas cambiar algo, pide al equipo que te la devuelva.`),
      est.pdf_sha256 ? el('div', { class: 'mensaje mensaje--info' },
        el('div', { class: 'pequeno' }, 'Huella SHA-256 del documento firmado'),
        el('div', { class: 'mono' }, est.pdf_sha256)) : null,
      el('div', { class: 'botones' },
        el('button', { type: 'button', class: 'boton', onclick: descargar }, 'Descargar el PDF'),
        opciones.salir ? el('a', { class: 'boton boton--secundario', href: opciones.salir }, 'Volver a mis inscripciones') : null,
        almacen.demo ? el('button', { type: 'button', class: 'boton boton--secundario', onclick: () => location.reload() },
          'Empezar de nuevo') : null)));
    arriba();
  }

  async function descargar() {
    try {
      await almacen.descargarExpediente(est);
    } catch (e) {
      aviso(e?.message || 'No se ha podido descargar', 'error');
    }
  }

  // ------------------------------------------------------------------
  // PDF de vista previa (mismo generador que el servidor)
  // ------------------------------------------------------------------
  function datosPdf(extra = {}) {
    return {
      id: est.id || '(sin guardar)',
      adulto: esAdulto(),
      contacto: est.contacto,
      ronda: est.ronda,
      seccion: nombreSeccion(),
      seccion_id: est.seccion_id,
      educando: est.educando,
      tutores: est.tutores,
      ficha: est.ficha,
      autorizaciones: est.autorizaciones,
      documentos: est.documentos,
      firma: { ...est.firma },
      ...extra,
    };
  }

  async function verBorrador() {
    const ventana = abrirVentana();
    try {
      const bytes = await generarExpediente(
        PDFLib,
        datosPdf({ firma: { ...est.firma, png: null, fecha: null } }),
        { plantilla: await opciones.plantilla(esAdulto()), marcaAgua: 'BORRADOR · SIN FIRMAR' },
      );
      abrirPdf(new Blob([bytes], { type: 'application/pdf' }), 'borrador-inscripcion.pdf', ventana);
    } catch (e) {
      console.error(e);
      ventana?.close();
      aviso('No se ha podido generar la vista previa', 'error');
    }
  }

  async function rellenarEjemplo(adulto) {
    const copia = structuredClone(adulto ? ejemplo.adulto : ejemplo.datos);
    Object.assign(est, {
      seccion_id: copia.seccion_id, educando: copia.educando, tutores: copia.tutores || [{}],
      contacto: copia.contacto || {}, ficha: copia.ficha, autorizaciones: copia.autorizaciones, firma: copia.firma,
      documentos: [],
    });
    for (const { tipo, archivo } of await ejemplo.documentos(PDFLib, adulto)) {
      const meta = await almacen.subirDocumento(est, tipo, archivo);
      est.documentos = est.documentos.filter((x) => x.tipo !== tipo).concat(meta);
    }
    pintar();
    aviso('Listo. Pulsa «Guardar y seguir» para ir viendo cada paso.');
  }

  // Arranque (al final: las constantes de arriba ya están definidas).
  if (['firmada', 'validada'].includes(est.estado)) pintarFirmada(false);
  else pintar();
}

// ======================================================================
// Campos (enlazados a un objeto: lo que se escribe va directo a obj[clave])
// ======================================================================
function texto(obj, clave, etiqueta, o = {}) {
  const id = nuevoId();
  const input = el(o.area ? 'textarea' : 'input', {
    id,
    name: clave,
    type: o.area ? undefined : o.tipo || 'text',
    required: !o.opcional,
    autocomplete: o.auto || 'off',
    inputmode: o.modo,
    pattern: o.patron,
    maxlength: String(o.max || 120),
    max: o.maxFecha,
    placeholder: o.ejemplo,
    dataset: o.formato ? { formato: o.formato } : undefined,
  });
  input.value = obj[clave] ?? '';
  input.addEventListener('input', () => {
    obj[clave] = input.value;
    if (o.documento) input.setCustomValidity(errorDocumento(input.value) || '');
  });
  if (o.documento) {
    input.setCustomValidity(errorDocumento(input.value) || '');
    input.addEventListener('blur', () => {
      input.value = normalizarDocumento(input.value);
      obj[clave] = input.value;
    });
  }
  return el('div', { class: `campo${o.doble ? ' campo--doble' : ''}`, dataset: { nombre: o.nombre || etiqueta } },
    el('label', { for: id }, etiqueta, o.opcional ? el('span', { class: 'opcional' }, ' (opcional)') : null),
    input,
    o.ayuda ? el('div', { class: 'ayuda' }, o.ayuda) : null);
}

function selector(obj, clave, etiqueta, lista, o = {}) {
  const id = nuevoId();
  const s = el('select', {
    id, name: clave, required: true,
    onchange: (ev) => {
      const antes = obj[clave];
      obj[clave] = ev.target.value ? Number(ev.target.value) : null;
      o.alCambiar?.(antes);
    },
  },
  el('option', { value: '' }, 'Elige…'),
  lista.map((x) => el('option', { value: String(x.id), selected: Number(obj[clave]) === x.id }, x.nombre)));
  return el('div', { class: `campo${o.doble ? ' campo--doble' : ''}`, dataset: { nombre: 'Sección' } },
    el('label', { for: id }, etiqueta), s, o.ayuda ? el('div', { class: 'ayuda' }, o.ayuda) : null);
}

function siNo(obj, clave, pregunta, o = {}) {
  const nombre = nuevoId();
  let cual = null;
  if (o.cual) {
    cual = texto(obj, o.campoCual || `${clave}_cual`, o.etiquetaCual || '¿Cuál?',
      { area: true, max: 500, nombre: `${o.corto || pregunta} (cuál)` });
    cual.classList.add('cual');
    if (obj[clave] !== true) cual.classList.add('oculto');
  }
  const opcion = (valor, etiqueta) => el('label', {},
    el('input', {
      type: 'radio', name: nombre, value: String(valor), required: !o.opcional,
      checked: valor === null ? obj[clave] === null : obj[clave] === valor,
      onchange: () => {
        obj[clave] = valor;
        cual?.classList.toggle('oculto', valor !== true);
        o.alCambiar?.(valor);
      },
    }),
    el('span', {}, etiqueta));
  return el('fieldset', { dataset: { nombre: o.corto || pregunta } },
    el('legend', {}, pregunta),
    o.ayuda ? el('p', { class: 'ayuda' }, o.ayuda) : null,
    o.detalle || null,
    el('div', { class: `sino${o.opcional ? ' sino--3' : ''}` },
      opcion(true, 'Sí'), opcion(false, 'No'), o.opcional ? opcion(null, 'Prefiero no decirlo') : null),
    cual);
}

function casilla(obj, clave, textoCasilla, corto) {
  return el('label', { class: 'casilla', dataset: { nombre: corto || textoCasilla } },
    el('input', {
      type: 'checkbox', name: clave, required: true, checked: obj[clave] === true,
      onchange: (ev) => { obj[clave] = ev.target.checked; },
    }),
    el('span', {}, textoCasilla));
}

const dato = (k, v) => el('div', { class: 'dato' }, el('dt', {}, k), el('dd', {}, v || '—'));

// Validación con la API nativa del navegador (required, pattern, type=email,
// setCustomValidity) y mensajes en castellano junto a cada campo.
function validarFormulario(form) {
  form.querySelectorAll('.con-error').forEach((n) => n.classList.remove('con-error'));
  form.querySelectorAll('.error-campo').forEach((n) => n.remove());
  const errores = [];
  const radiosVistos = new Set();
  for (const n of form.querySelectorAll('input, select, textarea')) {
    if (n.type === 'file' || n.closest('.oculto')) continue;
    if (n.type === 'radio') {
      if (radiosVistos.has(n.name)) continue;
      radiosVistos.add(n.name);
    }
    if (n.checkValidity()) continue;
    const contenedor = n.closest('.campo, fieldset, .casilla');
    const v = n.validity;
    let msg;
    if (v.valueMissing) {
      msg = n.type === 'radio' ? 'Elige Sí o No' : n.type === 'checkbox' ? 'Hay que marcar esta casilla' : 'Es obligatorio';
    } else if (v.customError) msg = n.validationMessage;
    else if (v.typeMismatch) msg = 'Revisa el correo electrónico';
    else if (v.patternMismatch) msg = n.dataset.formato || 'Formato no válido';
    else if (v.rangeOverflow) msg = 'La fecha no puede ser futura';
    else msg = n.validationMessage;
    contenedor?.classList.add('con-error');
    contenedor?.append(el('div', { class: 'error-campo' }, msg));
    errores.push({ nodo: n.type === 'radio' ? n.closest('fieldset')?.querySelector('input') : n, texto: `${contenedor?.dataset.nombre || n.name}: ${msg}` });
  }
  return errores;
}

// Comprueba el tipo real del archivo y reduce las fotos grandes del móvil.
async function prepararArchivo(archivo) {
  let blob = archivo;
  let nombre = archivo.name || 'archivo';
  let mime = tipoReal(new Uint8Array(await blob.slice(0, 16).arrayBuffer()));
  if (!mime) {
    throw new Error('Ese archivo no es un PDF, JPG ni PNG. Si es una foto HEIC del iPhone, haz una captura de pantalla y sube la captura.');
  }
  if (mime !== 'application/pdf' && blob.size > 2.5 * 1024 * 1024) {
    blob = await reducirImagen(blob);
    mime = 'image/jpeg';
    nombre = `${nombre.replace(/\.[^.]+$/, '')}.jpg`;
  }
  if (blob.size > TAMANO_MAXIMO) throw new Error(`Ocupa ${formatoTamano(blob.size)} y el máximo son 5 MB.`);
  return { blob, nombre: nombre.slice(-120), mime, tamano: blob.size };
}

async function reducirImagen(blob) {
  const bmp = await createImageBitmap(blob);
  const escala = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * escala);
  c.height = Math.round(bmp.height * escala);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok, mal) => {
    c.toBlob((b) => (b ? ok(b) : mal(new Error('No se ha podido procesar la imagen'))), 'image/jpeg', 0.85);
  });
}

// Con origen opaco (archivo abierto en local, vistas previas aisladas) el
// navegador no deja abrir un blob en otra pestaña: entonces se descarga.
const origenOpaco = () => location.origin === 'null' || location.protocol === 'file:';

// Se abre la pestaña ANTES de generar el PDF: si se abre después de un
// "await", Safari lo considera una ventana emergente y la bloquea.
export function abrirVentana() {
  return origenOpaco() ? null : window.open('', '_blank');
}

export function abrirPdf(blob, nombre, ventana) {
  const url = URL.createObjectURL(blob);
  setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  if (ventana && !ventana.closed) {
    ventana.location.href = url;
    return;
  }
  const a = el('a', { href: url, download: nombre, rel: 'noopener' });
  document.body.append(a);
  a.click();
  a.remove();
}
