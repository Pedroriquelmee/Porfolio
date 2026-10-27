// Guarda el formulario en Supabase, paso a paso.
import { sb, ok, llamarFuncion } from './supabase.js';
import { EXTENSION } from './compartido/archivos.js';

const CAMPOS_EDUCANDO = [
  'nombre', 'apellidos', 'documento', 'fecha_nacimiento', 'direccion', 'poblacion', 'provincia',
  'codigo_postal', 'telefono_fijo', 'movil', 'email',
];
const CAMPOS_TUTOR = [
  'documento', 'nombre', 'apellidos', 'profesion', 'telefono_fijo', 'movil', 'email',
  'whatsapp_autoriza', 'whatsapp_telefono',
];
const CAMPOS_FICHA = [
  'seguro', 'numero_seguro', 'enuresis', 'sonambulismo', 'enfermedad_cronica', 'enfermedad_cronica_cual',
  'tratamiento_medico', 'tratamiento_medico_cual', 'dieta_especial', 'dieta_especial_cual',
  'alergia_medicamentos', 'alergia_medicamentos_cual', 'otras_alergias', 'necesidades_educativas',
  // Solo adultos:
  'otras_alergias_tiene', 'anticonceptivo', 'embarazo', 'fumador', 'alcohol', 'gafas_lentillas',
];
const CAMPOS_IMAGEN = ['imagen_canales_internos', 'imagen_redes_y_medios', 'imagen_mensajeria'];
const CAMPOS_AUTORIZACION = [
  'acepta_participacion', 'vuelve_solo', 'autoriza_medicacion',
  'imagen_canales_internos', 'imagen_redes_y_medios', 'imagen_mensajeria',
];

const valor = (v) => (typeof v === 'string' ? v.trim() || null : v ?? null);
const tomar = (obj, campos) => Object.fromEntries(campos.map((c) => [c, valor(obj?.[c])]));

/**
 * @param idInscripcion  inscripción a continuar (o null para una nueva)
 * @param renovarDe      educando del que copiar los datos del año anterior
 */
export function crearAlmacenSupabase({ idInscripcion = null, renovarDe = null } = {}) {
  return {
    demo: false,

    async cargar() {
      const { data: { user } } = await sb.auth.getUser();
      const [ronda, secciones] = await Promise.all([
        sb.from('rondas').select('id, nombre').eq('activa', true).maybeSingle().then(ok),
        sb.from('secciones').select('id, nombre, adultos').order('orden').then(ok),
      ]);
      if (!ronda) throw new Error('Ahora mismo no hay ninguna ronda abierta para inscribirse.');

      const base = {
        id: null, educando_id: null, ronda: ronda.nombre, ronda_id: ronda.id, secciones,
        seccion_id: null, estado: 'borrador', educando: {}, tutores: [{ email: user.email }],
        contacto: {}, ficha: {}, autorizaciones: {}, documentos: [], firma: {}, email: user.email,
      };

      const origen = idInscripcion || (renovarDe && await ultimaInscripcion(renovarDe));
      if (!origen) return base;

      const i = await sb.from('inscripciones')
        .select('*, educandos(*), tutores(*), fichas_sanitarias(*), documentos(tipo, nombre_archivo, tamano, ruta, mime), rondas(nombre)')
        .eq('id', origen).single().then(ok);
      const ficha = Array.isArray(i.fichas_sanitarias) ? i.fichas_sanitarias[0] : i.fichas_sanitarias;
      const tutores = [...(i.tutores || [])].sort((a, b) => a.orden - b.orden).map((t) => tomar(t, CAMPOS_TUTOR));
      const comun = {
        ...base,
        educando_id: i.educando_id,
        seccion_id: i.seccion_id,
        educando: tomar(i.educandos, CAMPOS_EDUCANDO),
        tutores: tutores.length ? tutores : base.tutores,
        contacto: { nombre: i.contacto_nombre, telefono1: i.contacto_telefono1, telefono2: i.contacto_telefono2 },
        ficha: tomar(ficha, CAMPOS_FICHA),
      };

      // Renovación: se copian datos personales y ficha; las autorizaciones,
      // la firma y los documentos se piden de nuevo (son anuales).
      if (!idInscripcion) return comun;

      return {
        ...comun,
        id: i.id,
        ronda: i.rondas?.nombre ?? base.ronda,
        estado: i.estado,
        motivo_rechazo: i.motivo_rechazo,
        pdf_sha256: i.pdf_sha256,
        autorizaciones: tomar(i, [...CAMPOS_AUTORIZACION, 'acepta_info_rgpd', 'consiente_datos_salud']),
        documentos: i.documentos || [],
        firma: { nombre: i.firmante_nombre, documento: i.firmante_documento, lugar: i.firma_lugar },
      };
    },

    async guardar(paso, est) {
      if (paso === 0) {
        const datos = tomar(est.educando, CAMPOS_EDUCANDO);
        if (!est.educando_id) {
          est.educando_id = (await sb.from('educandos').insert(datos).select('id').single().then(ok)).id;
        } else {
          await sb.from('educandos').update(datos).eq('id', est.educando_id).then(ok);
        }
        if (!est.id) {
          est.id = (await sb.from('inscripciones')
            .insert({ educando_id: est.educando_id, ronda_id: est.ronda_id, seccion_id: est.seccion_id })
            .select('id').single().then(ok)).id;
          history.replaceState(null, '', `?id=${est.id}`);
        } else {
          await sb.from('inscripciones').update({ seccion_id: est.seccion_id }).eq('id', est.id).then(ok);
        }
      } else if (paso === 1 && est.adulto) {
        await sb.from('inscripciones').update({
          contacto_nombre: valor(est.contacto.nombre),
          contacto_telefono1: valor(est.contacto.telefono1),
          contacto_telefono2: valor(est.contacto.telefono2),
        }).eq('id', est.id).then(ok);
      } else if (paso === 1) {
        const filas = est.tutores.map((t, i) => ({ inscripcion_id: est.id, orden: i + 1, ...tomar(t, CAMPOS_TUTOR) }));
        await sb.from('tutores').upsert(filas, { onConflict: 'inscripcion_id,orden' }).then(ok);
        if (est.tutores.length < 2) {
          await sb.from('tutores').delete().eq('inscripcion_id', est.id).eq('orden', 2).then(ok);
        }
      } else if (paso === 2) {
        await sb.from('fichas_sanitarias')
          .upsert({ inscripcion_id: est.id, ...tomar(est.ficha, CAMPOS_FICHA) }, { onConflict: 'inscripcion_id' })
          .then(ok);
      } else if (paso === 3) {
        // Los adultos solo contestan la cesión de imagen.
        const campos = est.adulto ? CAMPOS_IMAGEN : CAMPOS_AUTORIZACION;
        await sb.from('inscripciones').update(tomar(est.autorizaciones, campos)).eq('id', est.id).then(ok);
      } else if (paso === 5) {
        await sb.from('inscripciones').update({
          acepta_info_rgpd: est.autorizaciones.acepta_info_rgpd === true,
          consiente_datos_salud: est.autorizaciones.consiente_datos_salud === true,
        }).eq('id', est.id).then(ok);
      }
      // Paso 4 (documentos): cada archivo se guarda al subirlo.
    },

    async subirDocumento(est, tipo, archivo) {
      const ruta = `${est.id}/${tipo}-${crypto.randomUUID()}.${EXTENSION[archivo.mime]}`;
      await sb.storage.from('documentos')
        .upload(ruta, archivo.blob, { contentType: archivo.mime, upsert: false }).then(ok);
      const previo = est.documentos.find((d) => d.tipo === tipo);
      if (previo) await this.quitarDocumento(est, tipo);
      const meta = {
        inscripcion_id: est.id, tipo, ruta, nombre_archivo: archivo.nombre, mime: archivo.mime, tamano: archivo.tamano,
      };
      const r = await sb.from('documentos').insert(meta);
      if (r.error) {
        await sb.storage.from('documentos').remove([ruta]);
        ok(r);
      }
      return meta;
    },

    async quitarDocumento(est, tipo) {
      const previo = est.documentos.find((d) => d.tipo === tipo);
      if (!previo) return;
      await sb.from('documentos').delete().eq('inscripcion_id', est.id).eq('tipo', tipo).then(ok);
      await sb.storage.from('documentos').remove([previo.ruta]);
    },

    async firmar(est, firmaPng) {
      await this.guardar(5, est);
      return llamarFuncion('firmar', {
        inscripcion_id: est.id,
        firma_png: firmaPng,
        firmante_nombre: est.firma.nombre,
        firmante_documento: est.firma.documento,
        lugar: est.firma.lugar,
      });
    },

    async descargarExpediente(est) {
      const { url } = await llamarFuncion('descargar', { inscripcion_id: est.id, recurso: 'expediente' });
      location.href = url; // el enlace caduca en 60 s y lleva "descargar como"
    },
  };
}

async function ultimaInscripcion(educandoId) {
  const filas = await sb.from('inscripciones').select('id')
    .eq('educando_id', educandoId).order('creado_en', { ascending: false }).limit(1).then(ok);
  return filas[0]?.id ?? null;
}
