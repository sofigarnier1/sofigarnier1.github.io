// Evaluación del asistente. Uso:
//   node asistente/evaluacion/correr.js            -> prueba la búsqueda (gratis, sin modelo)
//   ANTHROPIC_API_KEY=... node asistente/evaluacion/correr.js --modelo   -> prueba también las respuestas del modelo (cuesta centavos)
// Tipos de pregunta:
//   responde: la búsqueda debe traer la fuente correcta y (con modelo) la respuesta debe contener las palabras esperadas
//   trampa:   no está en los documentos; debe contestar "no lo sé" sin inventar
//   (solo_modelo: la búsqueda por palabras puede traer algo parecido, p. ej. "Google" -> Google Analytics; ahí decide el modelo)
//   limite:   es un límite declarado de Sofía; debe encontrar la fuente que lo dice
const path = require('path');
const N = require('../nucleo.js');
const { responder } = require('../../api/preguntar.js');
const preguntas = require('./preguntas.json');
const conModelo = process.argv.includes('--modelo');
const indice = N.indexar(N.cargarFragmentos());
const NO_SABE = /no lo s[eé]|no (figura|tengo)|no s[eé]/i;

(async () => {
  let ok = 0; const fallas = [];
  for (const q of preguntas) {
    const res = N.buscar(indice, q.pregunta);
    const etiquetas = res.map(r => N.etiqueta(r.frag));
    let pasa = true, motivo = '';
    if (q.tipo === 'trampa') {
      if (res.length && res[0].score >= N.UMBRAL && !conModelo && !q.solo_modelo) { pasa = false; motivo = 'la búsqueda trajo fragmentos para algo que no está'; }
    } else if (!etiquetas.some(e => e.includes(q.fuente))) { pasa = false; motivo = `no trajo la fuente "${q.fuente}" (trajo: ${etiquetas.join(' | ') || 'nada'})`; }

    if (conModelo && pasa) {
      const r = await responder(q.pregunta);
      if (q.tipo === 'trampa') { if (!NO_SABE.test(r.respuesta)) { pasa = false; motivo = 'inventó: ' + r.respuesta.slice(0, 100); } }
      else if (q.tipo === 'responde') {
        const faltan = q.palabras.filter(p => !r.respuesta.toLowerCase().includes(p.toLowerCase()));
        if (faltan.length) { pasa = false; motivo = 'falta mencionar: ' + faltan.join(', ') + '\n      respondió: ' + r.respuesta.replace(/\n/g, ' '); }
      } else if (!q.palabras.every(p => r.respuesta.toLowerCase().includes(p.toLowerCase()))) { pasa = false; motivo = 'no reflejó el límite declarado: ' + r.respuesta.slice(0, 100); }
    }
    if (pasa) ok++; else fallas.push(`✗ ${q.pregunta} — ${motivo}`);
    console.log(`${pasa ? '✓' : '✗'} [${q.tipo}] ${q.pregunta}`);
  }
  console.log(`\n${ok}/${preguntas.length} correctas (${conModelo ? 'con modelo' : 'solo búsqueda'})`);
  fallas.forEach(f => console.log(f));
  process.exit(fallas.length ? 1 : 0);
})();
