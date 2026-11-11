// Chat "Preguntale a Sofía". Habla con /api/preguntar; no guarda conversaciones.
(function () {
  var API = '/api/preguntar';
  var T = {
    es: { abrir: 'Preguntale a Sofía', titulo: 'Preguntale a Sofía', sub: 'Una IA que responde solo con mis documentos', cerrar: 'Cerrar', ph: 'Escribí tu pregunta…', enviar: 'Enviar',
      hola: 'Hola, soy un asistente con IA. Respondo solo con lo que figura en el CV y los proyectos de Sofía, y te muestro de dónde sale cada dato. Si algo no está, te lo digo.',
      fuentes: 'Fuentes: ', pensando: 'Buscando en los documentos…', error: 'No pude responder ahora. Probá más tarde o escribile a sofigarnier1@gmail.com.',
      nota: 'Es una IA: puede equivocarse. No guarda tus mensajes.',
      sug: ['¿Qué proyecto armó de punta a punta?', '¿Qué experiencia tiene con IA?', '¿Qué disponibilidad tiene?', '¿Qué hizo en Pancho Piletas?'] },
    en: { abrir: 'Ask Sofía', titulo: 'Ask Sofía', sub: 'An AI that answers only from my documents', cerrar: 'Close', ph: 'Type your question…', enviar: 'Send',
      hola: "Hi, I'm an AI assistant. I only answer with what's in Sofía's CV and projects, and I show where each fact comes from. If something isn't there, I'll say so.",
      fuentes: 'Sources: ', pensando: 'Searching the documents…', error: "I couldn't answer right now. Try later or email sofigarnier1@gmail.com.",
      nota: 'This is an AI and can be wrong. It does not store your messages.',
      sug: ['What project did she build end to end?', 'What experience does she have with AI?', 'What is her availability?', 'What did she do on Pancho Piletas?'] }
  };
  var L = function () { return T[window.idioma === 'en' ? 'en' : 'es']; };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };

  var btn = el('button', 'asis-btn'); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
  var foto = el('img'); foto.src = 'asistente/avatar.png'; foto.alt = ''; foto.width = 64; foto.height = 64; foto.decoding = 'async';
  var globo = el('span', 'asis-globo'); globo.setAttribute('aria-hidden', 'true'); btn.append(foto, globo);
  var panel = el('section', 'asis-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Chat');
  var cab = el('div', 'asis-cab'), tit = el('div'), strong = el('strong'), sub = el('small'); tit.append(strong, sub);
  var x = el('button', 'asis-x', '×'); x.type = 'button'; cab.append(tit, x);
  var msgs = el('div', 'asis-msgs'); msgs.setAttribute('aria-live', 'polite');
  var sug = el('div', 'asis-sug');
  var form = el('form', 'asis-form'), input = el('input'), enviar = el('button'); input.type = 'text'; input.maxLength = 300; input.autocomplete = 'off'; enviar.type = 'submit';
  form.append(input, enviar);
  var nota = el('p', 'asis-nota');
  panel.append(cab, msgs, sug, form, nota);
  document.body.append(btn, panel);

  function textos() {
    var t = L(); globo.textContent = t.abrir; btn.setAttribute('aria-label', t.abrir); strong.textContent = t.titulo; sub.textContent = t.sub; x.setAttribute('aria-label', t.cerrar);
    input.placeholder = t.ph; input.setAttribute('aria-label', t.ph); enviar.textContent = t.enviar; nota.textContent = t.nota;
    sug.textContent = ''; t.sug.forEach(function (q) { var b = el('button', '', q); b.type = 'button'; b.addEventListener('click', function () { preguntar(q); }); sug.append(b); });
  }
  function msg(clase, texto) { var m = el('div', 'asis-m ' + clase, texto); msgs.append(m); msgs.scrollTop = msgs.scrollHeight; return m; }

  var ocupado = false;
  function preguntar(q) {
    q = (q || '').trim(); if (!q || ocupado) return;
    ocupado = true; enviar.disabled = true; msg('yo', q); input.value = ''; sug.style.display = 'none';
    var espera = msg('ia', L().pensando);
    fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pregunta: q }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'error'); return j; }); })
      .then(function (j) {
        espera.textContent = j.respuesta;
        if (j.fuentes && j.fuentes.length) espera.append(el('div', 'asis-fuentes', L().fuentes + j.fuentes.join(' · ')));
        if (j.aviso) espera.append(el('div', 'asis-aviso', j.aviso));
      })
      .catch(function (e) { espera.textContent = (e && e.message && e.message !== 'error' && e.message.indexOf('Failed') < 0 && e.message.indexOf('JSON') < 0 && e.message.indexOf('Unexpected') < 0) ? e.message : L().error; })
      .then(function () { ocupado = false; enviar.disabled = false; msgs.scrollTop = msgs.scrollHeight; });
  }
  function abrir(v) {
    panel.classList.toggle('abierto', v); btn.style.display = v ? 'none' : '';
    if (v) { if (!msgs.children.length) msg('ia', L().hola); input.focus(); } else btn.focus();
  }
  btn.addEventListener('click', function () { abrir(true); });
  x.addEventListener('click', function () { abrir(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('abierto')) abrir(false); });
  form.addEventListener('submit', function (e) { e.preventDefault(); preguntar(input.value); });
  textos();
  // Al entrar, el globo aparece unos segundos para que se entienda qué es (una sola vez por visita).
  try { if (!sessionStorage.getItem('asisVisto') && !matchMedia('(prefers-reduced-motion: reduce)').matches) { sessionStorage.setItem('asisVisto', '1'); setTimeout(function () { btn.classList.add('saluda'); setTimeout(function () { btn.classList.remove('saluda'); }, 5000); }, 3500); } } catch (e) {}
  // Si cambia el idioma de la página, se actualizan los textos del chat.
  new MutationObserver(textos).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
