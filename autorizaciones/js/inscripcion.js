// Página del formulario con los datos guardados en Supabase.
import * as PDFLib from 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';
import { sesionObligatoria } from './supabase.js';
import { crearAlmacenSupabase } from './almacen-supabase.js';
import { montarFormulario } from './formulario.js';

await sesionObligatoria();

const p = new URLSearchParams(location.search);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const id = UUID.test(p.get('id') ?? '') ? p.get('id') : null;
const renovarDe = UUID.test(p.get('renovar') ?? '') ? p.get('renovar') : null;

// Los PDF originales de las autorizaciones, para la vista previa.
const plantillas = {};
const cargarPlantilla = async (adulto) => {
  const archivo = adulto ? 'autorizaciones-adultos.pdf' : 'autorizaciones-anuales.pdf';
  plantillas[archivo] ??= new Uint8Array(await (await fetch(`plantillas/${archivo}`)).arrayBuffer());
  return plantillas[archivo];
};

montarFormulario(document.getElementById('formulario'), {
  almacen: crearAlmacenSupabase({ idInscripcion: id, renovarDe }),
  PDFLib,
  plantilla: cargarPlantilla,
  salir: 'familia.html',
});
