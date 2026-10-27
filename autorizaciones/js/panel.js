// Panel del equipo: coordinación (todo) y scouters (su sección).
import { sb, ok, sesionObligatoria, miPerfil, salir, llamarFuncion } from './supabase.js';
import { el, aviso, dialogo, insigniaEstado, fechaHora, ESTADOS } from './dom.js';
import { DOCUMENTOS, DOCUMENTOS_ADULTOS, PREGUNTAS_SANITARIAS, PREGUNTAS_ADULTOS } from './compartido/textos-legales.js';
import { pdfDeUna, pdfDeVarias, guardarPdf, tieneFirma } from './pdf-completo.js';

await sesionObligatoria();
const perfil = await miPerfil();
if (perfil.rol === 'familia') location.replace('familia.html');

const esCoord = perfil.rol === 'coordinador';
document.getElementById('salir').addEventListener('click', salir);
document.getElementById('quien').textContent = esCoord
  ? 'Coordinación'
  : `Scouter · ${perfil.secciones?.nombre ?? ''}`;

const [ronda, secciones] = await Promise.all([
  sb.from('rondas').select('id, nombre').eq('activa', true).maybeSingle().then(ok),
  sb.from('secciones').select('id, nombre, adultos').order('orden').then(ok),
]);

const CORTO = { tarjeta_sanitaria: 'Tarjeta sanitaria', dni_nie: 'DNI/NIE', cartilla_vacunacion: 'Vacunas' };
const vista = document.getElementById('vista');
const filtro = { seccion: esCoord ? '' : String(perfil.seccion_id), texto: '', estado: '' };
let refrescarLista = () => {};
let firmadasVisibles = [];
let generando = false;
let actualizarBotonTodas = () => {};

const PESTANAS = esCoord
  ? [['inscripciones', 'Inscripciones'], ['equipo', 'Equipo'], ['registro', 'Registro de accesos']]
  : [['inscripciones', 'Inscripciones']];
const VISTAS = { inscripciones: vistaInscripciones, equipo: vistaEquipo, registro: vistaRegistro };
pintarPestanas('inscripciones');

function pintarPestanas(activa) {
  const barra = document.getElementById('pestanas');
  barra.replaceChildren(...PESTANAS.map(([id, nombre]) => el('button', {
    type: 'button', role: 'tab', 'aria-selected': String(id === activa), onclick: () => pintarPestanas(id),
  }, nombre)));
  barra.classList.toggle('oculto', PESTANAS.length === 1);
  VISTAS[activa]().catch((e) => vista.replaceChildren(el('div', { class: 'mensaje mensaje--error' }, e.message)));
}

const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function edad(iso) {
  const n = new Date(iso);
  const h = new Date();
  let a = h.getFullYear() - n.getFullYear();
  if (h < new Date(h.getFullYear(), n.getMonth(), n.getDate())) a -= 1;
  return a;
}

function campoSelect(etiqueta, valor, opciones, alCambiar) {
  const id = `s-${Math.random().toString(36).slice(2)}`;
  return el('div', { class: 'campo' },
    el('label', { for: id }, etiqueta),
    el('select', { id, onchange: (ev) => alCambiar(ev.target.value) },
      opciones.map(([v, t]) => el('option', { value: v, selected: v === valor }, t))));
}

// ----------------------------------------------------------------------
// Inscripciones
// ----------------------------------------------------------------------
async function vistaInscripciones() {
  if (!ronda) {
    vista.replaceChildren(el('div', { class: 'mensaje mensaje--aviso' }, 'No hay ninguna ronda activa.'));
    return;
  }
  vista.replaceChildren(el('p', { class: 'cargando' }, 'Cargando…'));
  const filas = await sb.from('inscripciones')
    .select('id, estado, motivo_rechazo, seccion_id, firmada_en, contacto_nombre, contacto_telefono1, ' +
      'secciones(nombre, adultos), educandos(nombre, apellidos, fecha_nacimiento), documentos(tipo), ' +
      'tutores(orden, nombre, apellidos, movil)')
    .eq('ronda_id', ronda.id).then(ok);
  filas.sort((a, b) => `${a.educandos.apellidos} ${a.educandos.nombre}`.localeCompare(`${b.educandos.apellidos} ${b.educandos.nombre}`, 'es'));

  const lista = el('ul', { class: 'lista' });
  const contadores = el('div', { class: 'contadores' });
  const buscador = el('input', {
    id: 'buscar', type: 'search', placeholder: 'Nombre o apellidos', value: filtro.texto,
    oninput: (ev) => { filtro.texto = ev.target.value; refrescarLista(); },
  });
  const botonTodas = el('button', {
    type: 'button', class: 'boton boton--secundario', title: 'Las firmadas que se ven con los filtros, con sus documentos',
    onclick: (ev) => descargarTodas(ev.currentTarget),
  }, 'Todas en un PDF');
  actualizarBotonTodas = () => {
    if (generando) return;
    botonTodas.textContent = firmadasVisibles.length ? `Todas en un PDF (${firmadasVisibles.length})` : 'Todas en un PDF';
    botonTodas.disabled = firmadasVisibles.length === 0;
  };
  const filtros = el('div', { class: 'filtros' },
    esCoord
      ? campoSelect('Sección', filtro.seccion, [['', 'Todas'], ...secciones.map((s) => [String(s.id), s.nombre])],
        (v) => { filtro.seccion = v; refrescarLista(); })
      : el('div', { class: 'campo' }, el('span', { class: 'etiqueta' }, 'Sección'), el('div', {}, perfil.secciones?.nombre)),
    el('div', { class: 'campo' }, el('label', { for: 'buscar' }, 'Buscar'), buscador),
    el('div', { class: 'campo' }, el('div', { class: 'botones' },
      el('button', { type: 'button', class: 'boton boton--secundario', onclick: listadoSanitario }, 'Listado sanitario'),
      botonTodas)));

  refrescarLista = () => {
    const deSeccion = filas.filter((f) => !filtro.seccion || String(f.seccion_id) === filtro.seccion);
    const visibles = deSeccion.filter((f) =>
      (!filtro.estado || f.estado === filtro.estado) &&
      (!filtro.texto || sinAcentos(`${f.educandos.nombre} ${f.educandos.apellidos}`).includes(sinAcentos(filtro.texto))));
    firmadasVisibles = visibles.filter(tieneFirma);
    actualizarBotonTodas();
    contadores.replaceChildren(
      contador('', 'Total', deSeccion.length),
      ...Object.keys(ESTADOS).map((e) => contador(e, ESTADOS[e], deSeccion.filter((f) => f.estado === e).length)));
    lista.replaceChildren(...(visibles.length
      ? visibles.map(tarjetaInscripcion)
      : [el('li', { class: 'vacio' }, 'No hay inscripciones con estos filtros.')]));
  };
  vista.replaceChildren(el('h1', {}, `Ronda ${ronda.nombre}`), filtros, contadores, lista);
  refrescarLista();
}

function contador(estado, nombre, n) {
  return el('button', {
    type: 'button', class: 'contador', 'aria-pressed': String(filtro.estado === estado),
    onclick: () => { filtro.estado = filtro.estado === estado ? '' : estado; refrescarLista(); },
  }, el('b', {}, String(n)), el('span', {}, nombre));
}

function tarjetaInscripcion(f) {
  const e = f.educandos;
  const subidos = new Set(f.documentos.map((d) => d.tipo));
  const tutor = f.tutores?.find((t) => t.orden === 1);
  const adulto = f.secciones?.adultos === true;
  const firmada = ['firmada', 'validada'].includes(f.estado);
  const meta = [
    f.secciones?.nombre ?? 'Sin sección',
    e.fecha_nacimiento ? `${edad(e.fecha_nacimiento)} años` : null,
    adulto && f.contacto_nombre ? `Contacto: ${f.contacto_nombre} · ${f.contacto_telefono1 ?? ''}` : null,
    !adulto && tutor ? `${tutor.nombre ?? ''} ${tutor.apellidos ?? ''} · ${tutor.movil ?? ''}` : null,
  ].filter(Boolean).join(' · ');
  const docs = adulto ? DOCUMENTOS_ADULTOS : DOCUMENTOS;

  return el('li', { class: 'tarjeta' }, el('div', { class: 'item' },
    el('div', { class: 'tarjeta__cabecera' },
      el('div', {}, el('div', { class: 'item__titulo' }, `${e.apellidos}, ${e.nombre}`), el('div', { class: 'item__meta' }, meta)),
      insigniaEstado(f.estado)),
    f.estado === 'rechazada' && f.motivo_rechazo ? el('div', { class: 'pequeno suave' }, `Motivo: ${f.motivo_rechazo}`) : null,
    f.firmada_en ? el('div', { class: 'pequeno suave' }, `Firmada el ${fechaHora(f.firmada_en)}`) : null,
    el('div', { class: 'chips' }, firmada ? el('button', {
      type: 'button', class: 'chip chip--ok', title: 'Descargar solo la autorización firmada (original)',
      onclick: (ev) => descargar(f.id, 'expediente', ev.currentTarget),
    }, '✓ Autorización') : null, docs.map((d) => (subidos.has(d.tipo)
      ? el('button', {
        type: 'button', class: 'chip chip--ok', title: `Descargar: ${d.nombre}`,
        onclick: (ev) => descargar(f.id, d.tipo, ev.currentTarget),
      }, `✓ ${CORTO[d.tipo]}`)
      : el('span', { class: `chip${d.obligatorio ? ' chip--falta' : ''}` }, `✗ ${CORTO[d.tipo]}`)))),
    el('div', { class: 'botones' },
      el('button', { type: 'button', class: 'boton boton--secundario boton--pequeno', onclick: () => verFicha(f) }, 'Ficha sanitaria'),
      firmada ? el('button', {
        type: 'button', class: 'boton boton--secundario boton--pequeno',
        title: 'Autorización firmada y documentos en un solo PDF',
        onclick: (ev) => descargarCompleto(f, ev.currentTarget),
      }, 'PDF completo') : null,
      f.estado === 'firmada' ? el('button', { type: 'button', class: 'boton boton--pequeno', onclick: () => validar(f) }, 'Validar') : null,
      firmada ? el('button', { type: 'button', class: 'boton boton--peligro boton--pequeno', onclick: () => devolver(f) }, 'Devolver') : null),
    esCoord ? campoSelect('Mover a otra sección', String(f.seccion_id ?? ''),
      [['', '—'], ...secciones.map((s) => [String(s.id), s.nombre])],
      (v) => moverSeccion(f, v)) : null));
}

async function descargar(inscripcionId, recurso, boton) {
  if (boton) boton.disabled = true;
  try {
    const { url } = await llamarFuncion('descargar', { inscripcion_id: inscripcionId, recurso });
    location.href = url;
  } catch (e) {
    aviso(e.message, 'error');
  } finally {
    if (boton) boton.disabled = false;
  }
}

// pdf-lib solo se carga la primera vez que se pide un PDF completo.
let pdfLib = null;
async function dependenciasPdf() {
  pdfLib ??= await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
  return {
    PDFLib: pdfLib,
    bajar: async (inscripcionId, recurso) => {
      const { url } = await llamarFuncion('descargar', { inscripcion_id: inscripcionId, recurso });
      const r = await fetch(url);
      if (!r.ok) throw new Error(`no se pudo descargar (${r.status})`);
      return new Uint8Array(await r.arrayBuffer());
    },
  };
}

async function descargarCompleto(f, boton) {
  const texto = boton.textContent;
  boton.disabled = true;
  boton.textContent = 'Preparando…';
  try {
    const { bytes, nombre } = await pdfDeUna(await dependenciasPdf(), f, ronda.nombre);
    guardarPdf(bytes, nombre);
  } catch (e) {
    aviso(e.message, 'error');
  } finally {
    boton.disabled = false;
    boton.textContent = texto;
  }
}

async function descargarTodas(boton) {
  const filas = [...firmadasVisibles];
  if (!filas.length || generando) return;
  generando = true;
  boton.disabled = true;
  boton.textContent = 'Preparando…';
  const titulo = filtro.seccion
    ? secciones.find((s) => String(s.id) === filtro.seccion)?.nombre ?? ''
    : 'Todas las secciones';
  try {
    const { bytes, nombre, fallidas } = await pdfDeVarias(await dependenciasPdf(), filas, {
      ronda: ronda.nombre,
      titulo,
      progreso: (i, n) => { boton.textContent = `Preparando ${i} de ${n}…`; },
    });
    guardarPdf(bytes, nombre);
    if (fallidas) aviso(`${fallidas} no se han podido incluir: están al final del índice.`, 'error', 8000);
  } catch (e) {
    aviso(e.message, 'error');
  } finally {
    generando = false;
    actualizarBotonTodas();
  }
}

async function verFicha(f) {
  try {
    const s = await sb.rpc('ver_ficha', { p_inscripcion: f.id }).then(ok);
    const siNo = (v) => (v === true ? 'Sí' : v === false ? 'No' : '—');
    const respuesta = (p) => {
      const cual = s?.[p.campoCual || `${p.campo}_cual`];
      return `${siNo(s?.[p.campo])}${p.cual && s?.[p.campo] && cual ? ` — ${cual}` : ''}`;
    };
    const filas = f.secciones?.adultos
      ? [
        ['Contacto de emergencia', [f.contacto_nombre, f.contacto_telefono1].filter(Boolean).join(' · ')],
        ...PREGUNTAS_ADULTOS.map((p) => [p.texto, respuesta(p)]),
      ]
      : [
        ['Seguro', s?.seguro], ['Nº del seguro', s?.numero_seguro],
        ...PREGUNTAS_SANITARIAS.map((p) => [p.texto, respuesta(p)]),
        ['Otras alergias', s?.otras_alergias], ['Necesidades educativas', s?.necesidades_educativas],
      ];
    dialogo(`Ficha sanitaria · ${f.educandos.nombre} ${f.educandos.apellidos}`,
      s?.actualizado_en == null ? el('div', { class: 'mensaje mensaje--aviso' }, 'Todavía no se ha rellenado la ficha.') : null,
      el('dl', {}, filas.map(([k, v]) => el('div', { class: 'dato' }, el('dt', {}, k), el('dd', {}, v || '—')))),
      el('p', { class: 'pequeno suave' }, 'Esta consulta ha quedado registrada.'));
  } catch (e) {
    aviso(e.message, 'error');
  }
}

async function validar(f) {
  try {
    await sb.rpc('cambiar_estado', { p_inscripcion: f.id, p_estado: 'validada' }).then(ok);
    f.estado = 'validada';
    refrescarLista();
    aviso('Inscripción validada');
  } catch (e) {
    aviso(e.message, 'error');
  }
}

function devolver(f) {
  const motivo = el('textarea', { id: 'motivo', maxlength: '500', required: true, placeholder: 'Ej.: la foto de la tarjeta sanitaria no se lee' });
  const boton = el('button', { type: 'button', class: 'boton boton--peligro boton--bloque' }, 'Devolver a la familia');
  const d = dialogo(`Devolver · ${f.educandos.nombre} ${f.educandos.apellidos}`,
    el('p', { class: 'pequeno' }, 'La familia verá el motivo, podrá corregir y tendrá que volver a firmar.'),
    el('div', { class: 'campo' }, el('label', { for: 'motivo' }, 'Motivo'), motivo),
    boton);
  boton.addEventListener('click', async () => {
    if (!motivo.value.trim()) { motivo.focus(); return; }
    boton.disabled = true;
    try {
      await sb.rpc('cambiar_estado', { p_inscripcion: f.id, p_estado: 'rechazada', p_motivo: motivo.value.trim() }).then(ok);
      Object.assign(f, { estado: 'rechazada', motivo_rechazo: motivo.value.trim() });
      d.close();
      refrescarLista();
      aviso('Devuelta a la familia');
    } catch (e) {
      aviso(e.message, 'error');
      boton.disabled = false;
    }
  });
}

async function moverSeccion(f, valor) {
  if (!valor) return;
  try {
    await sb.rpc('asignar_seccion', { p_inscripcion: f.id, p_seccion: Number(valor) }).then(ok);
    f.seccion_id = Number(valor);
    const s = secciones.find((x) => x.id === Number(valor));
    f.secciones = { nombre: s?.nombre, adultos: s?.adultos };
    refrescarLista();
    aviso('Sección cambiada');
  } catch (e) {
    aviso(e.message, 'error');
  }
}

async function listadoSanitario() {
  try {
    const filas = await sb.rpc('listado_sanitario', { p_seccion: filtro.seccion ? Number(filtro.seccion) : null }).then(ok);
    const col = (...v) => v.filter(Boolean).join(' · ');
    dialogo(`Listado sanitario${filtro.seccion ? ` · ${secciones.find((s) => String(s.id) === filtro.seccion)?.nombre}` : ''}`,
      el('p', { class: 'pequeno suave' },
        `Inscripciones firmadas o validadas de la ronda ${ronda?.nombre}. Esta consulta ha quedado registrada.`),
      filas.length ? el('div', { class: 'tabla-envoltura' }, el('table', {},
        el('thead', {}, el('tr', {}, ['Nombre', 'Sección', 'Alergias', 'Dieta', 'Tratamiento / enfermedad', 'Otros'].map((t) => el('th', {}, t)))),
        el('tbody', {}, filas.map((r) => el('tr', {},
          el('td', {}, `${r.apellidos}, ${r.nombre}`),
          el('td', {}, r.seccion ?? ''),
          el('td', {}, col(r.alergia_medicamentos && `Medicamentos: ${r.alergia_medicamentos}`, r.otras_alergias)),
          el('td', {}, r.dieta_especial ?? ''),
          el('td', {}, col(r.tratamiento_medico, r.enfermedad_cronica)),
          el('td', {}, col(r.necesidades_educativas, r.enuresis && 'Enuresis', r.sonambulismo && 'Sonambulismo')))))))
        : el('div', { class: 'vacio' }, 'Todavía no hay inscripciones firmadas.'),
      el('div', { class: 'botones' }, el('button', { type: 'button', class: 'boton boton--secundario', onclick: () => window.print() }, 'Imprimir')));
  } catch (e) {
    aviso(e.message, 'error');
  }
}

// ----------------------------------------------------------------------
// Equipo (solo coordinación)
// ----------------------------------------------------------------------
async function vistaEquipo() {
  const equipo = await sb.from('perfiles').select('email, rol, secciones(nombre)').neq('rol', 'familia').order('rol').then(ok);
  const email = el('input', { id: 'eq-email', type: 'email', required: true, autocomplete: 'off' });
  let rol = 'scouter';
  // Un scouter no se asigna a Scouters/Comité: vería las fichas de todo el equipo adulto.
  const deMenores = secciones.filter((s) => !s.adultos);
  let seccion = String(deMenores[0]?.id ?? '');
  const campoSeccion = campoSelect('Sección', seccion, deMenores.map((s) => [String(s.id), s.nombre]), (v) => { seccion = v; });
  const form = el('form', { class: 'tarjeta', novalidate: true },
    el('h2', {}, 'Dar o quitar acceso'),
    el('p', { class: 'pequeno suave' },
      'La persona tiene que haber entrado una vez con su correo. Para quitarle el acceso al panel, ponle el rol «Familia».'),
    el('div', { class: 'rejilla rejilla--3' },
      el('div', { class: 'campo' }, el('label', { for: 'eq-email' }, 'Correo'), email),
      campoSelect('Rol', rol, [['scouter', 'Scouter'], ['coordinador', 'Coordinación'], ['familia', 'Familia']], (v) => {
        rol = v;
        campoSeccion.classList.toggle('oculto', v !== 'scouter');
      }),
      campoSeccion),
    el('button', { type: 'submit', class: 'boton' }, 'Guardar'));
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!email.checkValidity() || !email.value.trim()) { aviso('Escribe un correo válido', 'error'); return; }
    try {
      await sb.rpc('asignar_rol', {
        p_email: email.value.trim(), p_rol: rol, p_seccion: rol === 'scouter' ? Number(seccion) : null,
      }).then(ok);
      aviso('Guardado');
      vistaEquipo();
    } catch (e) {
      aviso(e.message, 'error', 7000);
    }
  });
  vista.replaceChildren(form, el('div', { class: 'tarjeta' },
    el('h2', {}, 'Equipo actual'),
    el('div', { class: 'tabla-envoltura' }, el('table', {},
      el('thead', {}, el('tr', {}, el('th', {}, 'Correo'), el('th', {}, 'Rol'), el('th', {}, 'Sección'))),
      el('tbody', {}, equipo.map((p) => el('tr', {},
        el('td', {}, p.email), el('td', {}, p.rol === 'coordinador' ? 'Coordinación' : 'Scouter'),
        el('td', {}, p.secciones?.nombre ?? '—'))))))));
}

// ----------------------------------------------------------------------
// Registro de accesos (solo coordinación)
// ----------------------------------------------------------------------
const ACCIONES = {
  ver_ficha: 'Consultó una ficha sanitaria',
  listado_sanitario: 'Pidió el listado sanitario',
  descargar: 'Descargó un archivo',
  firmar: 'Firmó una inscripción',
  validar: 'Validó una inscripción',
  devolver: 'Devolvió una inscripción',
  asignar_rol: 'Cambió un rol',
  asignar_seccion: 'Cambió de sección',
};

async function vistaRegistro() {
  vista.replaceChildren(el('p', { class: 'cargando' }, 'Cargando…'));
  const [filas, perfiles] = await Promise.all([
    sb.from('auditoria').select('*').order('en', { ascending: false }).limit(200).then(ok),
    sb.from('perfiles').select('id, email').then(ok),
  ]);
  const correo = Object.fromEntries(perfiles.map((p) => [p.id, p.email]));
  const ids = [...new Set(filas.filter((f) => f.objeto !== 'perfil' && f.objeto_id).map((f) => f.objeto_id))];
  const nombres = {};
  if (ids.length) {
    const ins = await sb.from('inscripciones').select('id, educandos(nombre, apellidos)').in('id', ids).then(ok);
    for (const i of ins) nombres[i.id] = `${i.educandos?.nombre ?? ''} ${i.educandos?.apellidos ?? ''}`.trim();
  }
  const sobre = (f) => {
    if (f.objeto === 'perfil') return correo[f.objeto_id] ?? '';
    const n = nombres[f.objeto_id] ?? '';
    return f.accion === 'descargar' ? `${n} (${CORTO[f.objeto] ?? 'PDF firmado'})` : n;
  };
  vista.replaceChildren(
    el('p', { class: 'suave pequeno' }, 'Últimos 200 accesos y cambios. Nadie puede editar ni borrar este registro desde la web.'),
    el('div', { class: 'tarjeta tabla-envoltura' }, el('table', {},
      el('thead', {}, el('tr', {}, ['Fecha', 'Quién', 'Qué', 'Sobre'].map((t) => el('th', {}, t)))),
      el('tbody', {}, filas.map((f) => el('tr', {},
        el('td', {}, fechaHora(f.en)),
        el('td', {}, correo[f.usuario_id] ?? '—', el('div', { class: 'pequeno suave' }, f.rol ?? '')),
        el('td', {}, ACCIONES[f.accion] ?? f.accion, f.detalle?.motivo ? el('div', { class: 'pequeno suave' }, f.detalle.motivo) : null),
        el('td', {}, sobre(f))))))));
}
