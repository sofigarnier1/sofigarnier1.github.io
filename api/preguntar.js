// API del asistente (Vercel, función Node). Cuesta poco por diseño:
// 1) las preguntas sugeridas se contestan desde un archivo (sin modelo);
// 2) si la búsqueda no encuentra nada relevante, responde "no lo sé" sin llamar al modelo;
// 3) se repite una pregunta -> sale del caché;
// 4) topes por visitante y por día; al llegar al tope responde con el fragmento más relevante (gratis);
// 5) modelo chico y respuesta corta. La clave vive solo en variables de entorno de Vercel.
const fs = require('fs');
const path = require('path');
const N = require('../asistente/nucleo.js');

const MODELO = process.env.ASISTENTE_MODELO || 'claude-haiku-5-5';
const MAX_PREGUNTA = 300;
const MAX_TOKENS = 350;
const TOPE_VISITANTE_DIA = Number(process.env.ASISTENTE_TOPE_VISITANTE || 8);
const TOPE_GLOBAL_DIA = Number(process.env.ASISTENTE_TOPE_GLOBAL || 200);

const indice = N.indexar(N.cargarFragmentos(path.join(__dirname, '..', 'asistente', 'conocimiento')));
const sugeridas = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'asistente', 'sugeridas.json'), 'utf8'));
const clave = (t) => N.normalizar(t).replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
const SUG = new Map(sugeridas.map(s => [clave(s.pregunta), s]));

// Memoria de esta instancia (se reinicia al "dormirse" la función: el tope duro real es el límite de gasto de la cuenta de la API).
const cache = new Map();
const visitas = new Map();
let global = { dia: '', n: 0 };
const hoy = () => new Date().toISOString().slice(0, 10);

function tope(ip) {
  const d = hoy();
  if (global.dia !== d) { global = { dia: d, n: 0 }; visitas.clear(); }
  const v = visitas.get(ip) || 0;
  if (v >= TOPE_VISITANTE_DIA || global.n >= TOPE_GLOBAL_DIA) return true;
  visitas.set(ip, v + 1); global.n++;
  return false;
}

async function llamarModelo(pedido) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODELO, max_tokens: MAX_TOKENS, temperature: 0, system: pedido.system, messages: [{ role: 'user', content: pedido.user }] }),
  });
  if (!r.ok) throw new Error('modelo ' + r.status);
  const j = await r.json();
  return (j.content || []).map(c => c.text || '').join('').trim();
}

// Contesta una pregunta. Se exporta para poder usarlo desde la evaluación y el servidor local.
async function responder(pregunta, { usarModelo = true } = {}) {
  const k = clave(pregunta);
  if (SUG.has(k)) { const s = SUG.get(k); return { respuesta: s.respuesta, fuentes: s.fuentes, modo: 'guardada' }; }
  if (cache.has(k)) return { ...cache.get(k), modo: 'cache' };

  const res = N.buscar(indice, pregunta);
  if (!res.length || res[0].score < N.UMBRAL) return { respuesta: N.NO_SE, fuentes: [], modo: 'sin-datos' };

  let out;
  if (usarModelo && process.env.ANTHROPIC_API_KEY) {
    const texto = await llamarModelo(N.armarPedido(pregunta, res));
    const citadas = [...new Set([...texto.matchAll(/\[(\d)\]/g)].map(m => Number(m[1])))].filter(n => n >= 1 && n <= res.length);
    out = { respuesta: texto, fuentes: (citadas.length ? citadas : [1]).map(n => N.etiqueta(res[n - 1].frag)), modo: 'modelo' };
    cache.set(k, { respuesta: out.respuesta, fuentes: out.fuentes });
    if (cache.size > 300) cache.delete(cache.keys().next().value);
  } else {
    const e = N.respuestaExtractiva(res);
    out = { respuesta: e.respuesta, fuentes: [N.etiqueta(res[0].frag)], modo: 'extracto' };
  }
  return out;
}

module.exports = async (req, res) => {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ error: 'Usá POST.' })); }
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    const pregunta = String((body && body.pregunta) || '').trim();
    if (!pregunta) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Escribí una pregunta.' })); }
    if (pregunta.length > MAX_PREGUNTA) { res.statusCode = 400; return res.end(JSON.stringify({ error: `La pregunta puede tener hasta ${MAX_PREGUNTA} caracteres.` })); }
    const ip = String((req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?')).split(',')[0].trim();
    const sinModelo = tope(ip);
    const out = await responder(pregunta, { usarModelo: !sinModelo });
    if (sinModelo && out.modo === 'extracto') out.aviso = 'Hoy se llegó al tope de consultas con IA; te muestro lo que figura en mis documentos.';
    res.statusCode = 200; res.end(JSON.stringify(out));
  } catch (e) {
    // Si el modelo falla, igual se responde con lo que hay en los documentos.
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const o = await responder(String(body.pregunta || '').slice(0, MAX_PREGUNTA), { usarModelo: false });
      o.aviso = 'La IA no está disponible ahora; te muestro lo que figura en mis documentos.';
      res.statusCode = 200; return res.end(JSON.stringify(o));
    } catch (_) { res.statusCode = 500; res.end(JSON.stringify({ error: 'No pude responder ahora. Probá más tarde.' })); }
  }
};
module.exports.responder = responder;
