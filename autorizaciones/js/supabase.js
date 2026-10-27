// Cliente de Supabase y ayudas de sesión.
// Versión fija: si el CDN publicara una versión alterada, no se cargaría sola.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm';
import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA } from './config.js';

if (SUPABASE_URL.includes('TU-PROYECTO')) {
  // (con clase y no con style="": la CSP de la página bloquea estilos en línea)
  document.body.insertAdjacentHTML('afterbegin',
    '<p class="demo-banda">Falta configurar <code>web/js/config.js</code> con los datos de Supabase.</p>');
}

export const sb = createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICA, {
  // "implicit" permite abrir el enlace del correo en otro dispositivo o
  // navegador distinto del que lo pidió (muy habitual en familias).
  auth: { flowType: 'implicit', persistSession: true, detectSessionInUrl: true },
});

export async function sesionObligatoria() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    location.replace('index.html');
    return new Promise(() => {});
  }
  return session;
}

export async function miPerfil() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    location.replace('index.html');
    return new Promise(() => {});
  }
  const { data, error } = await sb
    .from('perfiles').select('id, email, nombre, rol, seccion_id, secciones(nombre)')
    .eq('id', user.id).single();
  if (error) throw new Error(mensajeError(error));
  return data;
}

export async function salir() {
  await sb.auth.signOut();
  location.replace('index.html');
}

// Traduce errores técnicos a algo que una familia entienda.
export function mensajeError(e) {
  const m = e?.message || String(e ?? '');
  if (/row-level security|permission denied|42501/i.test(m)) {
    return 'No tienes permiso para hacer eso (o la inscripción ya está firmada).';
  }
  if (/educando_id_ronda_id|duplicate key/i.test(m)) return 'Ya hay una inscripción para esta ronda.';
  if (/check constraint/i.test(m)) return 'Algún dato no tiene un formato válido. Revísalo.';
  if (/mime type|not supported/i.test(m)) return 'Tipo de archivo no permitido. Sube un PDF, JPG o PNG.';
  if (/exceeded the maximum|too large|413/i.test(m)) return 'El archivo es demasiado grande (máximo 5 MB).';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Sin conexión. Comprueba internet e inténtalo de nuevo.';
  if (/JWT|session/i.test(m)) return 'Tu sesión ha caducado. Vuelve a entrar.';
  return m;
}

// Llama a una función de servidor y devuelve su JSON o un error legible.
export async function llamarFuncion(nombre, cuerpo) {
  const { data, error } = await sb.functions.invoke(nombre, { body: cuerpo });
  if (error) {
    let msg = mensajeError(error);
    try {
      const j = await error.context?.json();
      if (j?.error) msg = j.error + (j.faltan?.length ? `: ${j.faltan.join(', ')}` : '');
    } catch { /* respuesta sin JSON */ }
    throw new Error(msg);
  }
  return data;
}

// Devuelve el resultado o lanza un error legible.
export function ok({ data, error }) {
  if (error) throw new Error(mensajeError(error));
  return data;
}
