// Mini-ayudas para construir la interfaz SIN innerHTML.
// Todo texto que viene de la base de datos entra como nodo de texto, así
// que un nombre como "<script>…" se muestra tal cual y no se ejecuta (XSS).

export function el(tag, props = {}, ...hijos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (typeof v !== 'string' && k in n) n[k] = v;
    else if (v === true) n.setAttribute(k, '');
    else n.setAttribute(k, String(v));
  }
  agregar(n, hijos);
  return n;
}

function agregar(padre, hijos) {
  for (const h of hijos.flat(Infinity)) {
    if (h === null || h === undefined || h === false) continue;
    padre.append(h instanceof Node ? h : document.createTextNode(String(h)));
  }
}

let toastActual = null;
export function aviso(texto, tipo = 'info', ms = 4500) {
  toastActual?.remove();
  const t = el('div', { class: `toast${tipo === 'error' ? ' toast--error' : ''}`, role: tipo === 'error' ? 'alert' : 'status' }, texto);
  document.body.append(t);
  toastActual = t;
  setTimeout(() => t.remove(), ms);
}

export function dialogo(titulo, ...contenido) {
  const cerrar = el('button', { class: 'boton boton--fantasma', type: 'button', 'aria-label': 'Cerrar' }, 'Cerrar');
  const d = el('dialog', { class: 'imprimible' },
    el('div', { class: 'dialogo__cabecera' }, el('h2', {}, titulo), cerrar),
    el('div', { class: 'dialogo__cuerpo' }, contenido));
  cerrar.addEventListener('click', () => d.close());
  d.addEventListener('close', () => d.remove());
  (document.querySelector('.app') || document.body).append(d);
  d.showModal();
  return d;
}

export function fechaCorta(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'medium' }).format(new Date(iso));
}

export function fechaHora(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'short', timeStyle: 'short' })
    .format(new Date(iso));
}

export const ESTADOS = {
  borrador: 'Borrador',
  firmada: 'Firmada',
  validada: 'Validada',
  rechazada: 'Devuelta',
};

export function insigniaEstado(estado) {
  return el('span', { class: `estado estado--${estado}` }, ESTADOS[estado] ?? estado);
}
