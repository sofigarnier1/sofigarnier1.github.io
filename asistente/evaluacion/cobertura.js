// Cobertura del asistente con preguntas típicas de reclutadores. Gratis, sin modelo: node asistente/evaluacion/cobertura.js
// Para cada pregunta mira (1) si en los documentos existe algún dato del tema (palabras clave) y (2) qué trae la búsqueda.
// "Hueco" = no hay dato del tema en los documentos: hay que escribirlo (con la voz de Sofía) antes de esperar una buena respuesta.
const N = require('../nucleo.js');
const frags = N.cargarFragmentos();
const indice = N.indexar(frags);
const P = [
  ['¿Por qué decidió estudiar programación?', ['decidi', 'por que programacion', 'motiv', 'me gusto', 'elegi']],
  ['¿Por qué cambió de la atención al cliente y la comunicación a la tecnología?', ['cambio de rubro', 'transicion', 'cambio', 'pase de']],
  ['¿Qué busca en su primer equipo de desarrollo?', ['busca en un equipo', 'equipo donde', 'quiero aprender', 'mentor', 'busco un equipo']],
  ['¿Cuál es su mayor fortaleza?', ['fortaleza', 'se destaca', 'mayor fuerte']],
  ['¿Cuál es su mayor debilidad o qué está mejorando?', ['debilidad', 'mejorando', 'oportunidad de mejora', 'le cuesta']],
  ['¿Cómo aprende algo nuevo?', ['aprende', 'autodidact', 'como aprendo', 'aprendio']],
  ['Contame de un error que cometió y qué aprendió', ['error', 'equivoc', 'fallo que', 'aprendio de']],
  ['¿Cómo trabaja en equipo?', ['en equipo', 'trabajo en equipo', 'colabor']],
  ['¿Cómo maneja los desacuerdos o las críticas?', ['desacuerdo', 'critica', 'feedback', 'conflicto']],
  ['¿Cómo organiza su tiempo y sus prioridades?', ['organiza', 'prioridad', 'planifica', 'tiempo']],
  ['¿Qué nivel de inglés tiene y cómo lo usa?', ['ingles']],
  ['¿Qué sueldo pretende?', ['sueldo', 'pretension', 'salario', 'remuneracion']],
  ['¿Puede trabajar en horario de otro país o zona horaria?', ['zona horaria', 'horario', 'timezone']],
  ['¿Cuándo podría empezar?', ['empezar', 'incorpor', 'disponibilidad inmediata', 'inmediata']],
  ['¿Cuál fue lo más difícil de FRESKA?', ['mas dificil', 'desafio', 'dificultad', 'lo complicado']],
  ['¿Por qué eligió Electron y SQLite para FRESKA?', ['por que electron', 'elegi', 'eligio', 'porque electron', 'se eligio']],
  ['¿Qué hizo como Community Manager y qué logró?', ['community manager', 'creadora de contenido']],
  ['¿Qué aprendió de la atención al cliente que le sirve para programar?', ['atencion al cliente']],
  ['¿Qué lenguajes y herramientas domina mejor?', ['java', 'javascript', 'python', 'sql']],
  ['¿Qué espera aprender en el próximo año?', ['proximo ano', 'quiere aprender', 'quiere seguir', 'aprender ahora', 'proximos pasos']],
];
let huecos = 0;
for (const [q, claves] of P) {
  const hallados = frags.filter(f => claves.some(c => N.normalizar(f.texto).includes(c)));
  const res = N.buscar(indice, q);
  const top = res.length && res[0].score >= N.UMBRAL ? N.etiqueta(res[0].frag) : '(la búsqueda no trae nada)';
  const estado = hallados.length ? 'HAY DATO ' : 'HUECO    ';
  if (!hallados.length) huecos++;
  console.log(`${estado}| ${q}\n          datos en: ${hallados.slice(0, 2).map(N.etiqueta).join(' · ') || '—'} | búsqueda: ${top}`);
}
console.log(`\n${P.length - huecos}/${P.length} con algún dato del tema; ${huecos} huecos.`);
