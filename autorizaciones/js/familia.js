// Página de la familia: sus educandos, estado de cada inscripción y PDF.
import { sb, ok, sesionObligatoria, miPerfil, salir, llamarFuncion } from './supabase.js';
import { el, aviso, insigniaEstado } from './dom.js';

await sesionObligatoria();
const perfil = await miPerfil();
document.getElementById('salir').addEventListener('click', salir);
document.getElementById('quien').textContent = perfil.email;
if (perfil.rol !== 'familia') document.getElementById('ir-panel').classList.remove('oculto');

const caja = document.getElementById('contenido');
try {
  const [ronda, vinculos] = await Promise.all([
    sb.from('rondas').select('id, nombre').eq('activa', true).maybeSingle().then(ok),
    sb.from('educando_tutores').select('educando_id').eq('usuario_id', perfil.id).then(ok),
  ]);
  const ids = vinculos.map((v) => v.educando_id);
  if (!ids.length) {
    caja.replaceChildren(el('div', { class: 'tarjeta vacio' }, 'Todavía no has inscrito a nadie.'));
  } else {
    const [educandos, inscripciones] = await Promise.all([
      sb.from('educandos').select('id, nombre, apellidos').in('id', ids).order('nombre').then(ok),
      sb.from('inscripciones')
        .select('id, educando_id, ronda_id, estado, motivo_rechazo, rondas(nombre), secciones(nombre)')
        .in('educando_id', ids).order('creado_en', { ascending: false }).then(ok),
    ]);
    caja.replaceChildren(el('ul', { class: 'lista' }, educandos.map((e) =>
      tarjeta(e, inscripciones.filter((i) => i.educando_id === e.id), ronda))));
  }
} catch (e) {
  caja.replaceChildren(el('div', { class: 'mensaje mensaje--error' }, e.message));
}

function tarjeta(e, inscripciones, ronda) {
  const actual = ronda ? inscripciones.find((i) => i.ronda_id === ronda.id) : null;
  const anteriores = inscripciones.filter((i) => i !== actual);
  let meta = '';
  if (actual) meta = `Ronda ${actual.rondas?.nombre} · ${actual.secciones?.nombre ?? 'sin sección'}`;
  else if (ronda) meta = `Aún sin inscribir en la ronda ${ronda.nombre}`;
  return el('li', { class: 'tarjeta' }, el('div', { class: 'item' },
    el('div', { class: 'tarjeta__cabecera' },
      el('div', {},
        el('div', { class: 'item__titulo' }, `${e.nombre} ${e.apellidos}`),
        el('div', { class: 'item__meta' }, meta)),
      actual ? insigniaEstado(actual.estado) : null),
    actual?.estado === 'rechazada'
      ? el('div', { class: 'mensaje mensaje--aviso pequeno' }, el('strong', {}, 'Devuelta: '), actual.motivo_rechazo)
      : null,
    actual?.estado === 'firmada'
      ? el('p', { class: 'pequeno suave' }, 'Firmada. El equipo la revisará en los próximos días.')
      : null,
    el('div', { class: 'botones' }, acciones(e, actual, ronda)),
    anteriores.length ? el('details', {},
      el('summary', {}, 'Rondas anteriores'),
      el('ul', { class: 'lista' }, anteriores.map((i) => el('li', { class: 'dato' },
        el('span', {}, `Ronda ${i.rondas?.nombre}`),
        el('span', {}, insigniaEstado(i.estado), ' ',
          ['firmada', 'validada'].includes(i.estado) ? botonPdf(i, true) : null))))) : null));
}

function acciones(e, actual, ronda) {
  if (!actual) {
    return ronda ? [el('a', { class: 'boton', href: `inscripcion.html?renovar=${e.id}` }, `Renovar para ${ronda.nombre}`)] : [];
  }
  if (actual.estado === 'borrador') return [el('a', { class: 'boton', href: `inscripcion.html?id=${actual.id}` }, 'Continuar')];
  if (actual.estado === 'rechazada') {
    return [el('a', { class: 'boton', href: `inscripcion.html?id=${actual.id}` }, 'Corregir y volver a firmar')];
  }
  return [botonPdf(actual)];
}

function botonPdf(inscripcion, pequeno = false) {
  const b = el('button', { type: 'button', class: `boton boton--secundario${pequeno ? ' boton--pequeno' : ''}` }, 'Descargar PDF');
  b.addEventListener('click', async () => {
    b.disabled = true;
    try {
      const { url } = await llamarFuncion('descargar', { inscripcion_id: inscripcion.id, recurso: 'expediente' });
      location.href = url;
    } catch (err) {
      aviso(err.message, 'error');
    } finally {
      b.disabled = false;
    }
  });
  return b;
}
