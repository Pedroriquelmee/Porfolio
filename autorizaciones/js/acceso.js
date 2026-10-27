// Acceso con enlace mágico por correo (sin contraseñas).
import { sb, mensajeError } from './supabase.js';
import { el } from './dom.js';

const form = document.getElementById('acceso');
const caja = document.getElementById('mensaje');
const mostrar = (texto, tipo) => caja.replaceChildren(el('div', { class: `mensaje mensaje--${tipo}` }, texto));

// Enlace caducado o ya usado: Supabase lo indica en el fragmento de la URL.
const hash = new URLSearchParams(location.hash.slice(1));
if (hash.get('error')) {
  mostrar('Ese enlace ha caducado o ya se usó. Pide uno nuevo.', 'aviso');
  history.replaceState(null, '', location.pathname);
}

let redirigiendo = false;
async function irSegunRol() {
  if (redirigiendo) return;
  redirigiendo = true;
  const { data: { user } } = await sb.auth.getUser();
  const { data } = await sb.from('perfiles').select('rol').eq('id', user.id).maybeSingle();
  location.replace(!data || data.rol === 'familia' ? 'familia.html' : 'panel.html');
}

const { data: { session } } = await sb.auth.getSession();
if (session) irSegunRol();
sb.auth.onAuthStateChange((evento, s) => {
  if (evento === 'SIGNED_IN' && s) irSegunRol();
});

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const email = form.elements.email.value.trim();
  if (!form.checkValidity() || !email) {
    mostrar('Escribe un correo electrónico válido.', 'error');
    return;
  }
  const boton = form.querySelector('button');
  boton.disabled = true;
  boton.textContent = 'Enviando…';
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: new URL('index.html', location.href).href },
  });
  boton.disabled = false;
  boton.textContent = 'Enviarme el enlace';
  if (error) {
    const m = /security purposes|rate limit|after \d+ seconds/i.test(error.message)
      ? 'Espera un minuto antes de pedir otro enlace.'
      : mensajeError(error);
    mostrar(m, 'error');
    return;
  }
  mostrar(`Listo. Te hemos enviado un enlace a ${email}. Ábrelo en este móvil u ordenador para entrar (mira también en spam).`, 'ok');
});
