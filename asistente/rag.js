// RAG del asistente: embeddings de OpenAI + búsqueda por similitud en Supabase (pgvector).
// Variables de entorno (solo en Vercel o en tu terminal, nunca en archivos): OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY.
// Si falta alguna, o algo falla, el asistente sigue con la búsqueda por palabras (BM25) de nucleo.js.
const MODELO_EMB = process.env.ASISTENTE_EMBEDDINGS || 'text-embedding-3-small';
const UMBRAL_SIM = Number(process.env.ASISTENTE_UMBRAL_SIM || 0.28);   // por debajo: "eso no lo sé"

const disponible = () => !!(process.env.OPENAI_API_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

// Las claves nuevas de Supabase (sb_publishable_…, sb_secret_…) van solo en `apikey`; las viejas (JWT) también como Bearer.
const cabeceras = (k) => k.startsWith('sb_') ? { 'content-type': 'application/json', apikey: k } : { 'content-type': 'application/json', apikey: k, authorization: 'Bearer ' + k };

async function embeddings(textos) {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.OPENAI_API_KEY },
    body: JSON.stringify({ model: MODELO_EMB, input: textos }),
  });
  if (!r.ok) throw new Error('embeddings ' + r.status);
  return (await r.json()).data.map(d => d.embedding);
}

// Devuelve [{ frag: { titulo, seccion, texto }, score }] con la misma forma que buscar() de nucleo.js.
async function buscarVectorial(pregunta, k = 4) {
  const [emb] = await embeddings([pregunta]);
  const r = await fetch(process.env.SUPABASE_URL.replace(/\/(rest\/v1\/?)?$/, '') + '/rest/v1/rpc/buscar_fragmentos', {
    method: 'POST',
    headers: cabeceras(process.env.SUPABASE_ANON_KEY),
    body: JSON.stringify({ consulta: '[' + emb.join(',') + ']', cantidad: k }),
  });
  if (!r.ok) throw new Error('supabase ' + r.status);
  const filas = await r.json();
  return filas.filter(f => f.similitud >= UMBRAL_SIM)
    .map(f => ({ frag: { archivo: f.archivo, titulo: f.titulo, seccion: f.seccion, texto: f.texto }, score: f.similitud }));
}

module.exports = { cabeceras, disponible, embeddings, buscarVectorial, UMBRAL_SIM, MODELO_EMB };
