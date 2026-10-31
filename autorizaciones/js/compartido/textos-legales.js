// COPIA generada por `npm run construir`. Edita el original en supabase/functions/_shared/
// =====================================================================
// Textos legales del Grupo Scout Alba 601
// ---------------------------------------------------------------------
// Copiados de las autorizaciones anuales en papel. Es lo que lee la
// familia en el formulario web. El PDF que se firma es el original
// (plantillas/autorizaciones-anuales.pdf): si cambiáis el papel, cambiad
// también estos textos para que digan lo mismo, y `npm run construir`.
// =====================================================================

export const ORGANIZACION = {
  nombre: 'Asociación Grupo Scout Alba 601',
  nombreCorto: 'Grupo Scout Alba 601',
  cif: 'G30851752',
  direccion: 'C/ Alcalde de Zalamea, 4, 30366 El Algar',
  email: 'Scoutalba601@hotmail.com',
};

// Rellena {marcadores} con valores. Si falta un valor deja una línea en blanco.
export function rellenar(texto, valores = {}) {
  return texto.replace(/\{(\w+)\}/g, (_, clave) => {
    const v = valores[clave];
    return v === undefined || v === null || v === '' ? '________' : String(v);
  });
}

// --- 1. Autorización de asistencia y participación --------------------
// En el formulario no se repite el párrafo de imagen de este documento:
// su casilla se marca con la opción "redes sociales y web" de la cesión.
export const ASISTENCIA =
  'Como tutores legales del socio menor de edad, autorizamos a nuestro hijo/a-tutelado/a participar ' +
  'en todas las actividades que realice la Asociación Grupo Scout Alba 601 durante la ronda {ronda}. ' +
  'Reconocemos que nuestros hijo/a –tutelado/a está en condiciones de efectuar las actividades ' +
  'deportivo-culturales que desarrolla la asociación, y hacemos extensiva esta autorización a las ' +
  'decisiones medico quirúrgicas que sean necesarias adoptar, en caso de extrema urgencia, bajo la ' +
  'dirección facultativa adecuada. Autorizo al equipo de scouters (monitores/as) del Grupo Scout ' +
  'Alba 601 para que pueda trasladarle/a en vehículo privado de aquellos casos en que el equipo lo ' +
  'considere necesario por motivos de salud o coordinación. No hacemos responsables a los ' +
  'educadores/monitores/animadores de los actos que por desobediencia o mal comportamiento realice ' +
  'nuestro hijo/a –tutelado/a.';

export const VUELTA_SOLO =
  'Autorizamos a nuestro hijo/a –tutelado/a a volver solo a casa al finalizar las actividades.';

// --- 2. Administración de medicamentos --------------------------------
export const MEDICACION_INTRO =
  'En las actividades del GS Alba 601 no se les permite a las personas menores de edad tomar ' +
  'medicamentos por su cuenta. Del mismo modo que por nuestra parte jamás administramos medicación ' +
  'alguna sin prescripción médica o autorización paterna/materna. Por esa razón os solicitamos ' +
  'vuestro consentimiento.';

export const MEDICACION_SI =
  'Yo, {firmante}, con DNI/NIE {firmanteDoc}, como madre/padre o tutor/a legal de {educando} de la ' +
  'sección {seccion}, SOLICITO Y AUTORIZO al equipo de monitores/as de GS Alba 601 para que ' +
  'administren la medicación prescrita por el médico o que mi hijo/a necesite habiendo sido ' +
  'informado/a previamente y ME HAGO RESPONSABLE en el caso de producirse efectos secundarios de ' +
  'cualquier tipo por causa del medicamento.';

export const MEDICACION_NO =
  'Yo, {firmante}, con DNI/NIE {firmanteDoc}, como madre/padre o tutor/a legal de {educando} de la ' +
  'sección {seccion}, NO AUTORIZO al equipo de monitores/as de GS Alba 601 a administrar medicación.';

// --- 3. Cesión de imagen (menores de 14 años) --------------------------
export const IMAGEN_PARRAFOS = [
  'Los padres/madres/tutores del menor {educando} manifiestan que prestan su AUTORIZACIÓN a Grupo ' +
    'Scout Alba 601 con CIF {cif}, para hacer uso del material fotográfico y audiovisual de las ' +
    'actividades llevadas a cabo por la citada entidad, y ello en virtud del derecho al honor, a la ' +
    'intimidad personal y familiar y a la propia imagen que garantiza el art. 18 de la Constitución ' +
    'Española y que desarrolla la Ley Orgánica 1/1982, de 5 de mayo, de protección civil del derecho ' +
    'al honor, a la intimidad personal y familiar y a la propia imagen.',
  'El citado material podrá ser utilizado exclusivamente para las finalidades que se autoricen, ' +
    'marcando la casilla correspondiente al final de este documento.',
  'El cesionario podrá utilizar y difundir las imágenes con las finalidades indicadas y con la ' +
    'limitación de aquellas utilizaciones que pudieran a atentar a su derecho al honor. La cesión se ' +
    'efectúa a título gratuito.',
  'El cedente no recibe en este momento, ni podrá reclamar en el futuro, contraprestación alguna por ' +
    'la utilización de las imágenes dentro de los términos de esta autorización.',
  'Que de conformidad con el art. 4 de la Ley Orgánica 1/1996, de 15 de enero, de Protección Jurídica ' +
    'del Menor, la entidad se compromete a respetar el derecho al honor, a la intimidad personal y ' +
    'familiar y a la propia imagen de los menores, de modo que la difusión y utilización de imágenes ' +
    'se realizará sin menoscabo de su honra o reputación, o de forma contraria a sus intereses, ' +
    'incluso si consta el consentimiento del menor o de sus representantes legales, respetando ' +
    'asimismo la legalidad vigente.',
  'Podrá acceder, corregir, eliminar y portar sus datos personales, así como oponerse y solicitar la ' +
    'limitación de los mismos. Puede ejercitar sus derechos, así como obtener más información en ' +
    '{direccion}, o en la dirección de correo electrónico {email}.',
];

export const IMAGEN_OPCIONES = [
  {
    campo: 'imagen_canales_internos',
    corto: 'Canales internos (memoria anual, revistas)',
    texto:
      'AUTORIZA a la realización de fotografías y/o vídeos en las actividades llevadas a cabo por la ' +
      'entidad y a su uso y difusión a través de los canales internos de la propia entidad (Memoria ' +
      'anual de la entidad, revistas, etc.), lo que puede implicar la cesión de las imágenes a ' +
      'FEDERACIÓN SCOUT DE EXPLORADORES DE MURCIA (EXMU) y a FEDERACIÓN DE SCOUTS-EXPLORADORES DE ' +
      'ESPAÑA (ASDE), así como su uso por estas entidades con idénticos fines.',
  },
  {
    campo: 'imagen_redes_y_medios',
    corto: 'Redes sociales, web, carteles y medios de comunicación',
    texto:
      'AUTORIZA a la realización de fotografías y/o vídeos en las actividades llevadas a cabo por la ' +
      'entidad y a su difusión a través de sus redes sociales y página web, folletos y/o carteles ' +
      'publicitarios, y otros medios de comunicación pública, tales como prensa, radio y televisión. ' +
      'Ello puede implicar la cesión de las imágenes a FEDERACIÓN SCOUT DE EXPLORADORES DE MURCIA ' +
      '(EXMU) y a FEDERACIÓN DE SCOUTS-EXPLORADORES DE ESPAÑA (ASDE), así como su uso por estas ' +
      'entidades con idénticos fines.',
  },
  {
    campo: 'imagen_mensajeria',
    corto: 'Grupos de mensajería (WhatsApp)',
    texto:
      'AUTORIZA a la realización de fotografías y/o vídeos en las actividades llevadas a cabo por la ' +
      'entidad y a su difusión a través de grupos de aplicaciones de mensajería instantánea (tales ' +
      'como grupos de Whatsapp), lo que puede implicar la cesión de las imágenes a FEDERACIÓN SCOUT DE ' +
      'EXPLORADORES DE MURCIA y su uso por dicha entidad con idénticos fines.',
  },
];

// --- 4. Comunicaciones por WhatsApp -------------------------------------
export const WHATSAPP_SI =
  'Autoriza al coordinador de la sección {seccion} a incluirle en un grupo de WhatsApp creado con la ' +
  'finalidad de tener información acerca de las actividades, con el número {telefono}, y comunicará ' +
  'cualquier cambio en el número al administrador del grupo.';

export const WHATSAPP_NO =
  'No autoriza a ser incluido/a en el grupo de WhatsApp de la sección. Las comunicaciones serán ' +
  'notificadas vía e-mail o correo postal.';

export const WHATSAPP_NORMAS = [
  'No se deben compartir datos de salud, ni sobre opiniones políticas o religiosas.',
  'No está permitido realizar capturas de conversaciones y compartirlas fuera del ámbito del grupo ' +
    'de WhatsApp. Las conversaciones se presumen de privadas, por lo que su difusión atenta contra ' +
    'la confidencialidad de estas.',
  'No está permitido compartir imágenes donde aparezcan personas en el grupo de WhatsApp. Las ' +
    'imágenes se compartirán a través de mail u otro medio.',
  'No está permitido compartir datos personales de terceros dentro del grupo.',
];

// --- 5. Protección de datos ---------------------------------------------
export const RGPD_INTRO =
  'En aras a dar cumplimiento al Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 ' +
  'de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al ' +
  'tratamiento de datos personales y a la libre circulación de estos datos, y siguiendo las ' +
  'Recomendaciones e Instrucciones emitidas por la Agencia Española de Protección de Datos ' +
  '(A.E.P.D.), SE INFORMA:';

export const RGPD_PUNTOS = [
  'Los datos de carácter personal solicitados y facilitados por usted, son incorporados un fichero de ' +
    'titularidad privada cuyo responsable y único destinatario es Asociación Grupo Scout Alba 601.',
  'Solo serán solicitados aquellos datos estrictamente necesarios para prestar adecuadamente los ' +
    'servicios solicitados, pudiendo ser necesario recoger datos de contacto de terceros, tales como ' +
    'representantes legales, tutores, o personas a cargo designadas por los mismos.',
  'Todos los datos recogidos cuentan con el compromiso de confidencialidad, con las medidas de ' +
    'seguridad establecidas legalmente, y bajo ningún concepto son cedidos o tratados por terceras ' +
    'personas, físicas o jurídicas, sin el previo consentimiento del asociado, tutor o representante ' +
    'legal, salvo en aquellos casos en los que fuere imprescindible para la correcta prestación del ' +
    'servicio.',
  'Una vez finalizada la relación entre la asociación y el asociado los datos serán archivados y ' +
    'conservados, durante un periodo tiempo mínimo de 5 años desde la última visita, tras lo cual ' +
    'seguirá archivado o en su defecto serán devueltos íntegramente al autorizado legal.',
  'Los datos que facilito serán incluidos en el fichero de la Asociación Grupo Scout Alba 601, con la ' +
    'finalidad de gestión del tratamiento médico, emisión de facturas, contacto..., manifiesto mi ' +
    'consentimiento. También se me ha informado de la posibilidad de ejercitar los derechos de ' +
    'acceso, rectificación, cancelación y oposición, indicándolo por escrito a ' +
    'Scoutalba601@hotmail.com',
];

export const RGPD_LEIDO = 'He leído la información sobre protección de datos.';
export const RGPD_SALUD =
  'Consiento expresamente el tratamiento de los datos de salud de la ficha sanitaria para la ' +
  'atención del/la participante durante las actividades.';

// --- 6. Ficha sanitaria y documentos -------------------------------------
export const PREGUNTAS_SANITARIAS = [
  { campo: 'enuresis', texto: '¿Se orina en la cama?' },
  { campo: 'sonambulismo', texto: '¿Es sonámbulo/a?' },
  { campo: 'enfermedad_cronica', texto: '¿Tiene alguna enfermedad crónica?', cual: true },
  { campo: 'tratamiento_medico', texto: '¿Sigue algún tratamiento médico?', cual: true },
  { campo: 'dieta_especial', texto: '¿Sigue alguna dieta o régimen especial?', cual: true },
  { campo: 'alergia_medicamentos', texto: '¿Es alérgico/a a algún tipo de medicamento?', cual: true },
];

// Documentos. Los de "dosCaras" admiten un PDF (con las dos caras) o dos
// fotos: si la de delante es una foto, hace falta también la de detrás.
// La de detrás se guarda con el mismo tipo + "_reverso".
// Los DNI de los tutores/as se añaden según cuántos haya (documentosPara).
export const DOCUMENTOS = [
  { tipo: 'tarjeta_sanitaria', nombre: 'Tarjeta sanitaria o seguro médico', corto: 'Tarjeta sanitaria', obligatorio: true, dosCaras: true },
  { tipo: 'cartilla_vacunacion', nombre: 'Cartilla de vacunación', corto: 'Vacunas', obligatorio: true },
  { tipo: 'dni_nie', nombre: 'DNI/NIE del participante (si tiene)', corto: 'DNI/NIE', obligatorio: false, dosCaras: true },
];

// =====================================================================
// MAYORES DE EDAD (Scouters y Comité): firman por sí mismos.
// =====================================================================

export const IMAGEN_PARRAFOS_ADULTOS = [
  'D/Dña. {nombre}, con DNI {documento}, en su propio nombre, presta su AUTORIZACIÓN a Grupo Scout Alba ' +
    '601 con CIF {cif} para hacer uso del material fotográfico y audiovisual de las actividades llevadas a ' +
    'cabo por la citada entidad, y ello en virtud del derecho al honor, a la intimidad personal y familiar y ' +
    'a la propia imagen que garantiza el art. 18 de la Constitución Española y que desarrolla la Ley ' +
    'Orgánica 1/1982, de 5 de mayo, de protección civil del derecho al honor, a la intimidad personal y ' +
    'familiar y a la propia imagen.',
  'El citado material podrá ser utilizado exclusivamente para las finalidades que se autoricen, marcando la ' +
    'casilla correspondiente al final de este documento.',
  'El cesionario podrá utilizar y difundir las imágenes con las finalidades indicadas y con la limitación ' +
    'de aquellas utilizaciones que pudieran a atentar a su derecho al honor.',
  'La cesión se efectúa a título gratuito. El cedente no recibe en este momento, ni podrá reclamar en el ' +
    'futuro, contraprestación alguna por la utilización de las imágenes dentro de los términos de esta ' +
    'autorización.',
  'Podrá acceder, corregir, eliminar y portar sus datos personales, así como oponerse y solicitar la ' +
    'limitación de los mismos. Puede ejercitar sus derechos, así como obtener más información en ' +
    '{direccion}, o en la dirección de correo electrónico {email}.',
];

// "grupo: 'mujer'" = preguntas que el papel pide "en caso de ser mujer":
// en el formulario son opcionales y se pueden dejar sin contestar.
export const PREGUNTAS_ADULTOS = [
  { campo: 'alergia_medicamentos', texto: '¿Es alérgico/a a algún medicamento?', cual: true },
  { campo: 'otras_alergias_tiene', texto: '¿Tiene otras alergias?', cual: true, campoCual: 'otras_alergias', etiquetaCual: '¿Cuáles?' },
  { campo: 'enfermedad_cronica', texto: '¿Tiene alguna enfermedad crónica?', cual: true },
  { campo: 'anticonceptivo', texto: '¿Toma algún anticonceptivo?', grupo: 'mujer' },
  { campo: 'embarazo', texto: '¿Está embarazada o lo sospecha?', grupo: 'mujer' },
  { campo: 'dieta_especial', texto: '¿Sigue algún régimen especial o dieta?', cual: true },
  { campo: 'fumador', texto: '¿Es fumador/a?' },
  { campo: 'alcohol', texto: '¿Consume bebidas alcohólicas?' },
  { campo: 'gafas_lentillas', texto: '¿Usa gafas o lentes de contacto?' },
];

export const DOCUMENTOS_ADULTOS = [
  { tipo: 'tarjeta_sanitaria', nombre: 'Tarjeta sanitaria', corto: 'Tarjeta sanitaria', obligatorio: true, dosCaras: true },
  { tipo: 'dni_nie', nombre: 'DNI en vigor', corto: 'DNI', obligatorio: true, dosCaras: true },
  { tipo: 'cartilla_vacunacion', nombre: 'Cartilla de vacunación', corto: 'Vacunas', obligatorio: false },
];

const docTutor = (t, i) => ({
  tipo: `dni_tutor${i + 1}`,
  nombre: `DNI/NIE del tutor/a legal ${i + 1}`,
  corto: `DNI tutor/a ${i + 1}`,
  persona: `${t?.nombre ?? ''} ${t?.apellidos ?? ''}`.trim(),
  obligatorio: true,
  dosCaras: true,
});

/**
 * Documentos que tocan según el tipo de socio/a. En menores, uno por cada
 * tutor/a legal (DNI), detrás de la tarjeta sanitaria y la cartilla.
 * Sin lista de tutores se cuenta uno.
 */
export function documentosPara(adulto, tutores) {
  if (adulto) return DOCUMENTOS_ADULTOS;
  const lista = (tutores?.length ? tutores : [{}]).slice(0, 2).map(docTutor);
  return [DOCUMENTOS[0], DOCUMENTOS[1], ...lista, DOCUMENTOS[2]];
}

export const reversoDe = (tipo) => `${tipo}_reverso`;

/** Nombre corto de cualquier tipo de archivo (chips del panel, registro…). */
export function nombreCortoDocumento(tipo) {
  const base = String(tipo).replace(/_reverso$/, '');
  const tutor = /^dni_tutor(\d)$/.exec(base);
  const corto = tutor ? `DNI tutor/a ${tutor[1]}` : [...DOCUMENTOS, ...DOCUMENTOS_ADULTOS].find((d) => d.tipo === base)?.corto ?? base;
  return base === tipo ? corto : `${corto} (detrás)`;
}

// Todos los tipos que existen (tienen que coincidir con el enum tipo_documento).
export const TIPOS_DOCUMENTO = [
  'tarjeta_sanitaria', 'tarjeta_sanitaria_reverso', 'cartilla_vacunacion', 'dni_nie', 'dni_nie_reverso',
  'dni_tutor1', 'dni_tutor1_reverso', 'dni_tutor2', 'dni_tutor2_reverso',
];

/**
 * Cada archivo de una inscripción, en orden, con su nombre para mostrar:
 * [{ doc, tipo, cara: 'delante' | 'detras' | null, nombre, corto, archivo }]
 * "archivo" es el documento subido (o undefined si falta).
 */
export function huecosDocumentos(adulto, tutores, documentos = []) {
  const subido = (tipo) => documentos.find((x) => x.tipo === tipo);
  const huecos = [];
  for (const doc of documentosPara(adulto, tutores)) {
    const delante = subido(doc.tipo);
    if (!doc.dosCaras) {
      huecos.push({ doc, tipo: doc.tipo, cara: null, nombre: doc.nombre, corto: doc.corto, archivo: delante });
      continue;
    }
    huecos.push({ doc, tipo: doc.tipo, cara: 'delante', nombre: `${doc.nombre} (delante)`, corto: doc.corto, archivo: delante });
    const tipoDetras = reversoDe(doc.tipo);
    huecos.push({
      doc, tipo: tipoDetras, cara: 'detras', nombre: `${doc.nombre} (detrás)`, corto: `${doc.corto} (detrás)`,
      archivo: subido(tipoDetras),
    });
  }
  return huecos;
}

/**
 * Lo que falta por subir: [{ tipo, texto }].
 * - Un documento obligatorio sin nada subido.
 * - Uno de dos caras con foto de delante pero sin la de detrás (si lo de
 *   delante es un PDF, se entiende que ya lleva las dos caras).
 */
export function faltanDocumentos(adulto, tutores, documentos = []) {
  const falta = [];
  for (const doc of documentosPara(adulto, tutores)) {
    const delante = documentos.find((x) => x.tipo === doc.tipo);
    if (!delante) {
      if (doc.obligatorio) falta.push({ tipo: doc.tipo, texto: doc.dosCaras ? `${doc.nombre} (delante y detrás, o un PDF)` : doc.nombre });
      continue;
    }
    if (doc.dosCaras && delante.mime !== 'application/pdf' && !documentos.some((x) => x.tipo === reversoDe(doc.tipo))) {
      falta.push({ tipo: reversoDe(doc.tipo), texto: `${doc.nombre}: falta la foto de detrás` });
    }
  }
  return falta;
}
