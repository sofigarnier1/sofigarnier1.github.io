// Chat "Preguntale a Sofía". Habla con /api/preguntar; no guarda conversaciones.
(function () {
  var API = '/api/preguntar';
  var T = {
    es: { abrir: 'Preguntale a Sofía', titulo: 'Preguntale a Sofía', sub: 'Una IA que responde solo con mis documentos', cerrar: 'Cerrar', ph: 'Escribí tu pregunta…', enviar: 'Enviar',
      hola: 'Hola, soy un asistente con IA. Respondo solo con lo que figura en el CV y los proyectos de Sofía. Si algo no está, te lo digo.',
      fuentes: 'Fuentes: ', pensando: 'Buscando en los documentos…', error: 'No pude responder ahora. Probá más tarde o escribile a sofigarnier1@gmail.com.',
      nota: 'Es una IA: puede equivocarse. No guarda tus mensajes, salvo que elijas ',
      globo: '¿Poco tiempo para leer? Preguntale a mi asistente', agente: ['', ''], dejar: 'Dejarle esta pregunta a Sofía', quiero: 'Escribile a Sofía', intro: 'Tu mensaje le llega directo a ella. Si dejás un mail o un número, te responde por ahí.', tel: 'Tu teléfono o WhatsApp (opcional)', volver: '← Volver', notaLink: 'dejarle un mensaje a Sofía', msgPh: 'Tu mensaje', nom: 'Tu nombre (opcional)', mail: 'Tu mail (opcional)', mandar: 'Enviar', enviada: 'Listo, mensaje enviado a Sofía.', noLlego: 'No pude avisarle ahora. Escribile a sofigarnier1@gmail.com.', agrandar: 'Agrandar el chat', achicar: 'Achicar el chat',
      otros: 'Otros temas', masPreg: 'Otras preguntas', temas: [
        { t: 'Proyectos', q: ['¿Qué proyecto armó de punta a punta?', '¿Qué es FRESKA y qué resuelve?', '¿Con qué tecnologías trabajó?', '¿Qué proyectos hizo en equipo?'] },
        { t: 'IA', q: ['¿Qué experiencia tiene con IA?', '¿Cómo funciona el agente de pedidos?', '¿Cómo probó que el agente anda bien?', '¿Entrenó modelos de machine learning?'] },
        { t: 'Disponibilidad', q: ['¿Qué disponibilidad tiene?', '¿Trabaja remoto?', '¿Qué roles busca?', '¿Cómo la contacto?'] },
        { t: 'Pancho Piletas', q: ['¿Qué hizo en Pancho Piletas?', '¿Qué tecnologías usó en Pancho Piletas?', '¿Qué es Alinea?', '¿Cómo fue trabajar con otro desarrollador?'] }] },
    en: { abrir: 'Ask Sofía', titulo: 'Ask Sofía', sub: 'An AI that answers only from my documents', cerrar: 'Close', ph: 'Type your question…', enviar: 'Send',
      hola: "Hi, I'm an AI assistant. I only answer with what's in Sofía's CV and projects. If something isn't there, I'll say so.",
      fuentes: 'Sources: ', pensando: 'Searching the documents…', error: "I couldn't answer right now. Try later or email sofigarnier1@gmail.com.",
      nota: 'This is an AI and can be wrong. It does not store your messages, unless you choose to ',
      globo: 'Short on time? Ask my assistant', agente: ['', ''], dejar: 'Leave this question for Sofía', quiero: 'Write to Sofía', intro: 'Your message goes straight to her. If you leave an email or a number, she will reply there.', tel: 'Your phone or WhatsApp (optional)', volver: '← Back', notaLink: 'leave Sofía a message', msgPh: 'Your message', nom: 'Your name (optional)', mail: 'Your email (optional)', mandar: 'Send', enviada: 'Done, message sent to Sofía.', noLlego: 'I couldn\'t notify her now. Write to sofigarnier1@gmail.com.', agrandar: 'Enlarge chat', achicar: 'Shrink chat',
      otros: 'Other topics', masPreg: 'More questions', temas: [
        { t: 'Projects', q: ['What project did she build end to end?', 'What is FRESKA and what does it solve?', 'What technologies has she worked with?', 'What projects did she do in a team?'] },
        { t: 'AI', q: ['What experience does she have with AI?', 'How does the order agent work?', 'How did she test that the agent works well?', 'Did she train machine learning models?'] },
        { t: 'Availability', q: ['What is her availability?', 'Does she work remotely?', 'What roles is she looking for?', 'How can I contact her?'] },
        { t: 'Pancho Piletas', q: ['What did she do on Pancho Piletas?', 'What technologies did she use on Pancho Piletas?', 'What is Alinea?', 'What was it like working with another developer?'] }] }
  };
  var L = function () { return T[window.idioma === 'en' ? 'en' : 'es']; };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };

  var btn = el('button', 'asis-btn'); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
  var foto = el('img'); foto.src = 'asistente/avatar.png'; foto.alt = ''; foto.width = 64; foto.height = 64; foto.decoding = 'async';
  var globo = el('span', 'asis-globo'); globo.setAttribute('aria-hidden', 'true'); var badge = el('span', 'asis-badge', '1'); badge.setAttribute('aria-hidden', 'true'); btn.append(foto, globo, badge);
  var panel = el('section', 'asis-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Chat');
  var cab = el('div', 'asis-cab'), tit = el('div'), strong = el('strong'), sub = el('small'); tit.append(strong, sub);
  var tam = el('button', 'asis-tam', '⤢'); tam.type = 'button';
  var x = el('button', 'asis-x', '×'); x.type = 'button'; cab.append(tit, tam, x);
  var msgs = el('div', 'asis-msgs'); msgs.setAttribute('aria-live', 'polite');
  var sug = el('div', 'asis-sug');
  var form = el('form', 'asis-form'), input = el('input'), enviar = el('button'); input.type = 'text'; input.maxLength = 300; input.autocomplete = 'off'; enviar.type = 'submit';
  form.append(input, enviar);
  var nota = el('p', 'asis-nota');
  panel.append(cab, msgs, form, nota);
  document.body.append(btn, panel);

  function textos() {
    var t = L(); globo.textContent = ''; globo.append(el('b', null, 'Sofía'), el('span', null, t.globo)); btn.setAttribute('aria-label', t.abrir); strong.textContent = t.titulo; sub.textContent = t.sub; x.setAttribute('aria-label', t.cerrar);
    var tt = grande ? t.achicar : t.agrandar; tam.setAttribute('aria-label', tt); tam.title = tt; tam.innerHTML = grande
      ? '<svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v4h4M6 14v-4H2M10 6l5-5M6 10l-5 5"/></svg>'
      : '<svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 1h5v5M6 15H1v-5M15 1l-5 5M1 15l5-5"/></svg>';
    input.placeholder = t.ph; input.setAttribute('aria-label', t.ph); enviar.textContent = t.enviar; nota.textContent = t.nota; var ln = el('button', 'asis-nota-link', t.notaLink); ln.type = 'button'; ln.addEventListener('click', dejarMensaje); nota.append(ln, '.');
    pintarSug();
  }
  function saludo() {
    var m = msg('ia', L().hola);
    var f = el('div', 'asis-fila'), av = el('img', 'asis-av'); av.src = foto.src; av.alt = ''; av.decoding = 'async'; msgs.insertBefore(f, m); f.append(av, m);
    msgs.append(sug);
  }
  // Pone el texto y convierte mails, links, LinkedIn y GitHub en enlaces.
  function poner(e, texto) {
    e.textContent = ''; texto = String(texto).replace(/\*\*/g, '').replace(/ ?\[\d\]/g, '');
    var re = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+|linkedin\.com\/in\/[\w-]+|github\.com\/[\w-]+)/g, i = 0, m;
    while ((m = re.exec(texto))) {
      if (m.index > i) e.append(document.createTextNode(texto.slice(i, m.index)));
      var t = m[0], a = document.createElement('a'); a.textContent = t.replace(/^https?:\/\//, ''); a.target = '_blank'; a.rel = 'noopener';
      a.href = t.indexOf('@') > 0 && t.indexOf('/') < 0 ? 'mailto:' + t : (/^https?:/.test(t) ? t : 'https://' + t);
      e.append(a); i = m.index + t.length;
    }
    if (i < texto.length) e.append(document.createTextNode(texto.slice(i)));
  }
  function msg(clase, texto) { var m = el('div', 'asis-m ' + clase, texto); msgs.append(m); msgs.scrollTop = msgs.scrollHeight; return m; }

  var ocupado = false;
  var ICO = ['<path d="M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4"/>', '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'];
  var tema = null, hechas = {}, verSug = true, listaAbierta = true;
  function pintarSug() {
    var t = L(), lista = []; sug.textContent = '';
    if (tema !== null) t.temas[tema].q.forEach(function (q, j) { if (!hechas[tema + '-' + j]) lista.push([q, j]); });
    if (tema !== null && lista.length) {
      sug.className = 'asis-sug asis-preg';
      if (!listaAbierta) sug.classList.add('asis-plegada');
      if (listaAbierta) lista.forEach(function (p) { var b = el('button', '', p[0]); b.type = 'button'; b.addEventListener('click', function () { preguntar(p[0], tema + '-' + p[1]); }); sug.append(b); });
      var m = el('button', 'asis-volver', t.masPreg + (listaAbierta ? ' ▴' : ' ▾')); m.type = 'button'; m.addEventListener('click', function () { listaAbierta = !listaAbierta; pintarSug(); msgs.scrollTop = msgs.scrollHeight; }); sug.append(m);
      var v = el('button', 'asis-volver', '← ' + t.otros); v.type = 'button'; v.addEventListener('click', function () { tema = null; pintarSug(); msgs.scrollTop = msgs.scrollHeight; }); sug.append(v);
    } else {
      tema = null; sug.className = 'asis-sug';
      t.temas.forEach(function (tm, i) { var b = el('button', ''); b.type = 'button'; b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[i] + '</svg><span></span>'; b.lastChild.textContent = tm.t; b.addEventListener('click', function () { tema = i; listaAbierta = true; pintarSug(); msgs.scrollTop = msgs.scrollHeight; }); sug.append(b); });
      var mb = el('button', 'asis-sug-msg'); mb.type = 'button'; mb.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span></span>'; mb.lastChild.textContent = t.notaLink.charAt(0).toUpperCase() + t.notaLink.slice(1); mb.addEventListener('click', dejarMensaje); sug.append(mb);
    }
    sug.style.display = verSug ? '' : 'none';
  }
  // Pantalla aparte dentro del chat para dejarle un mensaje a Sofía (le llega por Telegram; no se contesta por acá).
  var pant = el('div', 'asis-pant');
  panel.insertBefore(pant, form);
  function cerrarPantalla() { panel.classList.remove('pant'); pant.textContent = ''; }
  function abrirPantalla(q) {
    pant.textContent = '';
    var volver = el('button', 'asis-pant-volver', L().volver); volver.type = 'button'; volver.addEventListener('click', cerrarPantalla);
    var f = el('form', 'asis-dejarf'), mm = el('textarea'), n = el('input'), m = el('input'), ok = el('button', null, L().mandar), r = el('div', 'asis-aviso'), t = el('input');
    t.type = 'tel'; t.maxLength = 30; t.placeholder = L().tel; t.setAttribute('aria-label', L().tel);
    mm.maxLength = 600; mm.rows = 5; mm.required = true; mm.placeholder = L().msgPh; mm.setAttribute('aria-label', L().msgPh); mm.value = q || '';
    n.type = 'text'; n.maxLength = 60; n.placeholder = L().nom; n.setAttribute('aria-label', L().nom);
    m.type = 'email'; m.maxLength = 120; m.placeholder = L().mail; m.setAttribute('aria-label', L().mail); ok.type = 'submit';
    f.append(n, mm, m, t, ok, r);
    f.addEventListener('submit', function (e) {
      e.preventDefault(); ok.disabled = true; r.textContent = '';
      fetch('/api/contacto', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nombre: n.value, mail: m.value, telefono: t.value, mensaje: mm.value, solo_aviso: true }) })
        .then(function (x) { return x.json().then(function (j) { return { ok: x.ok, j: j }; }); })
        .then(function (x) { if (x.ok && !x.j.error && x.j.avisado) { f.replaceWith(el('div', 'asis-aviso asis-pant-ok', L().enviada)); } else { r.textContent = (x.j && x.j.error) || L().noLlego; ok.disabled = false; } })
        .catch(function () { r.textContent = L().noLlego; ok.disabled = false; });
    });
    pant.append(volver, el('h3', null, L().quiero), el('p', 'asis-pant-intro', L().intro), f);
    panel.classList.add('pant'); (q ? mm : n).focus();
  }
  // Cuando el asistente no sabe, ofrece dejarle la pregunta a Sofía.
  function dejarPregunta(burbuja, q) {
    var b = el('button', 'asis-dejar', L().dejar); b.type = 'button'; b.addEventListener('click', function () { abrirPantalla(q); });
    burbuja.append(b);
  }
  function dejarMensaje() { abrirPantalla(''); }
  window.abrirMensajeSofia = function () {
    if (!abierto()) { btn.style.left = btn.style.top = btn.style.right = btn.style.bottom = ''; btn.classList.remove('izq'); try { localStorage.removeItem('asis-pos'); } catch (_) {} }   // vuelve a su lugar: abajo a la derecha
    abrir(true); dejarMensaje();
  };   // lo usa el botón de la sección Contacto
  function preguntar(q, i) {
    q = (q || '').trim(); if (!q || ocupado) return;
    ocupado = true; enviar.disabled = true; var pregunta = msg('yo', q); input.value = ''; verSug = false; if (i !== undefined) hechas[i] = true; pintarSug();
    var espera = msg('ia', ''); espera.classList.add('escribiendo'); espera.setAttribute('aria-label', L().pensando); espera.innerHTML = '<i></i><i></i><i></i>';
    var demora = new Promise(function (r) { setTimeout(r, 1100); }); // que se vea "escribiendo…" aunque la respuesta ya esté lista
    fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pregunta: q }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'error'); return j; }); })
      .then(function (j) { return demora.then(function () { return j; }); })
      .then(function (j) {
        espera.classList.remove('escribiendo'); espera.removeAttribute('aria-label');
        poner(espera, j.respuesta);
        if (j.aviso) espera.append(el('div', 'asis-aviso', j.aviso));
        if (j.modo === 'sin-datos' || (j.modo === 'modelo' && /\b(no lo s[eé]|no figura|no (tengo|hay|incluyen?|puedo responder)|las fuentes no|no (est[aá]|aparece) (en|entre))/i.test(j.respuesta))) dejarPregunta(espera, q);
      })
      .catch(function (e) { espera.classList.remove('escribiendo'); espera.textContent = (e && e.message && e.message !== 'error' && e.message.indexOf('Failed') < 0 && e.message.indexOf('JSON') < 0 && e.message.indexOf('Unexpected') < 0) ? e.message : L().error; })
      .then(function () { verSug = true; listaAbierta = false; msgs.append(sug); pintarSug(); ocupado = false; enviar.disabled = false; msgs.scrollTop = Math.max(0, pregunta.offsetTop - 8); });
  }
  // Cerrado: el botón (la foto) se arrastra y se pega al borde más cercano.
  // Abierto: foto y chat son una sola pieza; la foto queda a la altura de donde se escribe
  // y se mueve todo junto agarrando la foto o el encabezado.
  var grande = false, minim = false, ancla = null; // ancla: dónde dejó la foto (en proporción a la ventana), para volver al mismo lugar al cambiar el tamaño
  var CEL = function () { return innerWidth <= 520; };
  var MARGEN = 8, SEP = 10;
  var abierto = function () { return panel.classList.contains('abierto'); };
  function abrir(v) {
    panel.classList.toggle('abierto', v); btn.setAttribute('aria-expanded', String(v));
    btn.classList.toggle('activo', v);
    btn.style.visibility = v && CEL() ? 'hidden' : ''; // en el celu el chat ocupa toda la pantalla
    if (v) { badge.remove(); minim = false; panel.classList.remove('min'); armarPieza(); if (!msgs.querySelector('.asis-m')) saludo(); }
    else { panel.style.cssText = ''; pegarAlBorde(posBtn()); guardar(); btn.focus(); }
  }
  btn.addEventListener('click', function (e) {
    if (arrastrado) { arrastrado = false; e.preventDefault(); return; }
    abrir(!abierto()); // el mismo botón abre y cierra
  });

  var arrastrado = false, ini = null;
  foto.draggable = false;
  btn.addEventListener('dragstart', function (e) { e.preventDefault(); }); // sin esto el navegador "agarra" la foto
  function lado() { return btn.offsetWidth || 68; }
  function techo() { var n = document.getElementById('nav'); return (n ? n.getBoundingClientRect().bottom : 0) + MARGEN; } // no tapar el header
  function posBtn() { var r = btn.getBoundingClientRect(); return { x: r.left, y: r.top }; }
  function limitar(x, y) {
    return { x: Math.min(Math.max(MARGEN, x), innerWidth - lado() - MARGEN), y: Math.min(Math.max(techo(), y), innerHeight - lado() - MARGEN) };
  }
  function ubicar(x, y) {
    var p = limitar(x, y);
    btn.style.left = p.x + 'px'; btn.style.top = p.y + 'px'; btn.style.right = 'auto'; btn.style.bottom = 'auto';
    btn.classList.toggle('izq', p.x + lado() / 2 < innerWidth / 2); // el globo pasa a la derecha
    return p;
  }
  function pegarAlBorde(p) {
    var w = lado(), d = { izq: p.x, der: innerWidth - w - p.x, arr: p.y - techo(), aba: innerHeight - w - p.y };
    var b = Object.keys(d).reduce(function (a, k) { return d[k] < d[a] ? k : a; }, 'der');
    if (b === 'izq') p.x = MARGEN; else if (b === 'der') p.x = innerWidth - w - MARGEN;
    else if (b === 'arr') p.y = techo(); else p.y = innerHeight - w - MARGEN;
    return ubicar(p.x, p.y);
  }
  function guardar() { var p = posBtn(); if (!innerWidth || !innerHeight) return; ancla = { x: p.x / innerWidth, y: p.y / innerHeight }; try { localStorage.setItem('asis-pos', JSON.stringify(ancla)); } catch (_) {} }
  try { var g = JSON.parse(localStorage.getItem('asis-pos') || 'null'); if (g && isFinite(g.x) && isFinite(g.y) && g.x !== null && g.y !== null) { ancla = g; pegarAlBorde({ x: g.x * innerWidth, y: g.y * innerHeight }); } } catch (_) {}

  // ---- La pieza abierta: [foto][chat] o [chat][foto], la foto alineada con la barra de escribir
  var pieza = null; // { lado: 'izq'|'der', W, H, dy } medidas del chat respecto de la foto
  function armarPieza() {
    if (CEL()) { panel.style.cssText = ''; pieza = null; return; }
    var W = Math.min(grande && !minim ? 560 : 380, innerWidth - lado() - SEP - 2 * MARGEN);
    var H = minim ? cab.offsetHeight : Math.min(grande ? 760 : 560, innerHeight - techo() - MARGEN);
    panel.style.width = W + 'px'; panel.style.height = H + 'px';
    var dy = minim ? (cab.offsetHeight - lado()) / 2                  // minimizado: la foto queda a la altura del encabezado
                   : form.offsetTop + form.offsetHeight / 2 - lado() / 2; // abierto: a la altura de la barra de escribir
    var b = posBtn(), fotoAIzq = b.x + lado() / 2 < innerWidth / 2;  // la foto queda del lado del borde
    pieza = { fotoAIzq: fotoAIzq, W: W, H: H, dy: dy };
    var c = calcPieza(b.x, b.y); aplicarPieza(c);
  }
  // Calcula dónde va cada parte (sin tocar nada), para que foto y chat se muevan siempre juntos.
  function calcPieza(x, y) { // x, y = esquina de la foto; acomoda todo para que entre en pantalla
    var P = pieza, w = lado();
    var anchoTotal = w + SEP + P.W;
    var izq = P.fotoAIzq ? x : x - SEP - P.W;                     // borde izquierdo de la pieza
    izq = Math.min(Math.max(MARGEN, izq), innerWidth - anchoTotal - MARGEN);
    var arriba = y - P.dy;                                         // borde de arriba del chat
    var minA = techo() - Math.min(0, P.dy), maxA = innerHeight - Math.max(P.H, P.dy + w) - MARGEN; // la foto también tiene que entrar
    arriba = Math.min(Math.max(minA, arriba), Math.max(minA, maxA));
    return { fx: P.fotoAIzq ? izq : izq + P.W + SEP, fy: arriba + P.dy, px: P.fotoAIzq ? izq + w + SEP : izq, py: arriba, izq: P.fotoAIzq };
  }
  function aplicarPieza(c) {
    btn.style.left = c.fx + 'px'; btn.style.top = c.fy + 'px'; btn.style.right = 'auto'; btn.style.bottom = 'auto';
    panel.style.left = c.px + 'px'; panel.style.top = c.py + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto';
    btn.classList.toggle('izq', c.izq);
  }
  function minimizar(v) {
    if (CEL() || !pieza) return;
    minim = v; panel.classList.toggle('min', v); armarPieza();
  }
  function tamano(v) {
    if (CEL()) return;
    grande = v; minim = false; panel.classList.remove('min'); textos(); armarPieza();
  }
  tam.addEventListener('click', function () { tamano(!grande); });

  // ---- Arrastre: la foto siempre; el encabezado cuando está abierto (mueven todo junto)
  function empezar(e, desde) {
    if (e.button) return;
    if (desde === 'cab' && (CEL() || e.target.closest('button'))) return;
    var b = posBtn();
    ini = { px: e.clientX, py: e.clientY, x: b.x, y: b.y, mov: false, desde: desde, pb: null, pp: null };
    if (desde === 'cab') e.preventDefault();
  }
  btn.addEventListener('pointerdown', function (e) { empezar(e, 'btn'); });
  cab.addEventListener('pointerdown', function (e) { empezar(e, 'cab'); });
  addEventListener('pointermove', function (e) {
    if (!ini) return;
    if (e.pointerType === 'mouse' && !e.buttons) return soltar(); // se soltó fuera de la ventana
    var dx = e.clientX - ini.px, dy = e.clientY - ini.py;
    if (!ini.mov && Math.abs(dx) + Math.abs(dy) < 6) return;
    if (!ini.mov) {
      ini.mov = true; btn.classList.add('arrastrando'); panel.classList.add('arrastrando');
      if (abierto() && pieza) { ini.pb = btn.getBoundingClientRect(); ini.pp = panel.getBoundingClientRect(); }
    }
    if (abierto() && pieza) {
      // Foto y chat se mueven con el mismo desplazamiento (transform), así van siempre pegados.
      var c = calcPieza(ini.x + dx, ini.y + dy); ini.c = c;
      btn.style.translate = (c.fx - ini.pb.left) + 'px ' + (c.fy - ini.pb.top) + 'px';
      panel.style.translate = (c.px - ini.pp.left) + 'px ' + (c.py - ini.pp.top) + 'px';
    } else ubicar(ini.x + dx, ini.y + dy);
  });
  function soltar() {
    if (!ini) return;
    var a = ini; ini = null;
    btn.classList.remove('arrastrando'); panel.classList.remove('arrastrando');
    if (!a.mov) { if (a.desde === 'cab' && abierto()) minimizar(!minim); return; } // un clic en el encabezado minimiza o vuelve a abrir
    if (a.c) { btn.style.translate = ''; panel.style.translate = ''; aplicarPieza(a.c); }
    if (a.desde === 'btn') { arrastrado = true; setTimeout(function () { arrastrado = false; }, 300); } // que no se abra/cierre al soltar
    if (!abierto()) {
      btn.classList.add('pegando'); pegarAlBorde(posBtn());
      setTimeout(function () { btn.classList.remove('pegando'); }, 260);
    }
    guardar();
  }
  addEventListener('pointerup', soltar);
  addEventListener('pointercancel', soltar);
  addEventListener('blur', soltar);
  addEventListener('resize', function () {
    var p = ancla ? { x: ancla.x * innerWidth, y: ancla.y * innerHeight } : null; // vuelve al lugar donde la dejó, no al que quedó al achicar
    if (abierto()) { btn.style.visibility = CEL() ? 'hidden' : ''; if (p) ubicar(p.x, p.y); armarPieza(); }
    else if (p) pegarAlBorde(p);
    else if (btn.style.left) pegarAlBorde(posBtn());
  });
  x.addEventListener('click', function () { abrir(false); });
  document.querySelectorAll('.js-asistente').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); if (!abierto()) abrir(true); }); }); // accesos de la página
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('abierto')) abrir(false); });
  form.addEventListener('submit', function (e) { e.preventDefault(); preguntar(input.value); input.blur(); });
  textos();
  // Notificación: aparece una vez, a los pocos segundos de entrar, con el chat cerrado. El "1" en la foto queda hasta que se abre el chat.
  function saludar() {
    if (abierto() || ini || document.hidden) return;
    btn.classList.add('saluda'); setTimeout(function () { btn.classList.remove('saluda'); }, 8000);
  }
  setTimeout(saludar, 2500);
  // Si cambia el idioma de la página, se actualizan los textos del chat.
  new MutationObserver(textos).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
