// Carga los documentos de asistente/conocimiento en Supabase (fragmentos + embeddings). Se corre a mano cuando cambian los .md:
//   OPENAI_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node asistente/rag/indexar.js
// Usa la clave de servicio (puede escribir): pasala solo por la terminal, nunca la guardes en un archivo.
const N = require('../nucleo.js');
const { embeddings, cabeceras } = require('../rag.js');
const { OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) { console.error('Faltan OPENAI_API_KEY, SUPABASE_URL o SUPABASE_SERVICE_KEY.'); process.exit(1); }

(async () => {
  const base = SUPABASE_URL.replace(/\/(rest\/v1\/?)?$/, '') + '/rest/v1/fragmentos';
  const h = cabeceras(SUPABASE_SERVICE_KEY);
  const frags = N.cargarFragmentos();
  // El texto que se vectoriza lleva el título y la sección, igual que en la búsqueda por palabras.
  const vecs = await embeddings(frags.map(f => `${f.titulo}${f.seccion ? ' › ' + f.seccion : ''}\n${f.texto}`));
  const borrar = await fetch(base + '?id=gt.0', { method: 'DELETE', headers: h });
  if (!borrar.ok) throw new Error('no pude vaciar la tabla: ' + borrar.status);
  const filas = frags.map((f, i) => ({ archivo: f.archivo, titulo: f.titulo, seccion: f.seccion, texto: f.texto, embedding: '[' + vecs[i].join(',') + ']' }));
  const subir = await fetch(base, { method: 'POST', headers: h, body: JSON.stringify(filas) });
  if (!subir.ok) throw new Error('no pude subir: ' + subir.status + ' ' + await subir.text());
  console.log(`Listo: ${filas.length} fragmentos cargados.`);
})().catch(e => { console.error(e.message); process.exit(1); });
