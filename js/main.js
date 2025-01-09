/* ═══════════════════════════════════════════════════════════
   PORFOLIO — Pedro José Riquelme Guerrero
   1. Ruta del paquete: cada parada abre su panel de tecnologías
   2. Aparición de secciones al hacer scroll
   3. Borde de la barra de navegación al desplazar
   4. Año del pie automático
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. RUTA DEL PAQUETE ── */
  var nodes  = document.querySelectorAll('.node[data-area]');
  var panels = document.querySelectorAll('.area[data-panel]');

  function showArea(name) {
    nodes.forEach(function (n) {
      var on = n.dataset.area === name;
      n.classList.toggle('is-active', on);
      n.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    panels.forEach(function (p) {
      p.classList.toggle('is-active', p.dataset.panel === name);
    });
  }

  nodes.forEach(function (n) {
    n.addEventListener('click', function () { showArea(n.dataset.area); });
    n.addEventListener('mouseenter', function () { showArea(n.dataset.area); });
    n.addEventListener('focus', function () { showArea(n.dataset.area); });
  });

  // EDITAR: cambia 'seguridad' por 'redes', 'sistemas' o 'desarrollo'
  // si quieres que la página abra mostrando otra parada.
  if (nodes.length) showArea('seguridad');

  /* ── 2. APARICIÓN AL HACER SCROLL ── */
  var targets = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  }

  /* ── 3. BARRA DE NAVEGACIÓN ── */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    nav.classList.toggle('is-stuck', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 4. AÑO DEL PIE ── */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
