// Zona de firma con el dedo o el ratón (Pointer Events).
import { el } from './dom.js';

export function crearPadFirma(contenedor) {
  const lienzo = el('canvas', { class: 'firma__lienzo', role: 'img', 'aria-label': 'Zona para firmar' });
  const caja = el('div', { class: 'firma' }, lienzo, el('div', { class: 'firma__pista' }, 'Firma aquí'));
  contenedor.append(caja);
  const ctx = lienzo.getContext('2d', { willReadFrequently: true });
  let trazos = 0;
  let dibujando = false;
  let ultimo = null;
  let anchoActual = 0;

  function ajustar() {
    const r = lienzo.getBoundingClientRect();
    if (!r.width || (trazos > 0 && Math.abs(r.width - anchoActual) < 1)) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    lienzo.width = Math.round(r.width * dpr);
    lienzo.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#141418';
    ctx.fillStyle = '#141418';
    anchoActual = r.width;
    trazos = 0;
    caja.dispatchEvent(new CustomEvent('cambio'));
  }
  new ResizeObserver(ajustar).observe(lienzo);

  const punto = (ev) => {
    const r = lienzo.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  };

  lienzo.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    lienzo.setPointerCapture(ev.pointerId);
    dibujando = true;
    ultimo = punto(ev);
    ctx.beginPath();
    ctx.arc(ultimo.x, ultimo.y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  });
  lienzo.addEventListener('pointermove', (ev) => {
    if (!dibujando) return;
    const eventos = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev];
    for (const e of eventos.length ? eventos : [ev]) {
      const p = punto(e);
      ctx.beginPath();
      ctx.moveTo(ultimo.x, ultimo.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ultimo = p;
    }
  });
  const terminar = () => {
    if (!dibujando) return;
    dibujando = false;
    trazos += 1;
    caja.dispatchEvent(new CustomEvent('cambio'));
  };
  lienzo.addEventListener('pointerup', terminar);
  lienzo.addEventListener('pointercancel', terminar);

  // Recorta el espacio vacío alrededor del trazo.
  function recorte() {
    const { width: w, height: h } = lienzo;
    const px = ctx.getImageData(0, 0, w, h).data;
    let x0 = w; let y0 = h; let x1 = -1; let y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (px[(y * w + x) * 4 + 3] > 10) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    return x1 < 0 ? null : { x0, y0, x1, y1 };
  }

  return {
    elemento: caja,
    vacia() {
      if (trazos === 0) return true;
      const r = recorte();
      const dpr = lienzo.width / (anchoActual || 1);
      return !r || (r.x1 - r.x0) / dpr < 40; // un punto o una rayita no es una firma
    },
    borrar() {
      trazos = 0;
      ajustar();
    },
    aPng() {
      const r = recorte();
      if (!r) return null;
      const m = 12;
      const sal = document.createElement('canvas');
      sal.width = r.x1 - r.x0 + m * 2;
      sal.height = r.y1 - r.y0 + m * 2;
      sal.getContext('2d').drawImage(lienzo, r.x0 - m, r.y0 - m, sal.width, sal.height, 0, 0, sal.width, sal.height);
      return sal.toDataURL('image/png');
    },
    // Solo para la demo: dibuja un garabato de ejemplo.
    dibujarEjemplo() {
      const r = lienzo.getBoundingClientRect();
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.002) {
        const x = r.width * 0.12 + r.width * 0.7 * t + 10 * Math.sin(t * Math.PI * 18);
        const y = r.height * 0.45 - 24 * Math.sin(t * Math.PI * 18) * (1 - 0.5 * t);
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      trazos += 1;
      caja.dispatchEvent(new CustomEvent('cambio'));
    },
  };
}
