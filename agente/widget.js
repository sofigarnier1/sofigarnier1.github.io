// Agente "Pedí como cliente" en la pestaña FRESKA. Habla con /api/pedir (api/pedir.py).
(function () {
  var raiz = document.getElementById('pedi');
  if (!raiz) return;
  var $ = function (id) { return document.getElementById(id); };
  var msgs = $('pedi-msgs'), form = $('pedi-form'), input = $('pedi-input'), cliente = $('pedi-cliente');
  var cuerpo = $('pedi-ticket-cuerpo'), nuevo = $('pedi-nuevo'), ejemplos = $('pedi-ejemplos');
  var pasosEl = $('pedi-pasos'), codigoEl = $('pedi-codigo'), temporizadores = [];
  var historial = [], ocupado = false, ultimaNota = '';
  var en = function () { return window.idioma === 'en'; };
  var T = {
    vacio: ['Acá aparece el pedido cuando esté completo.', 'The order shows up here once it\'s complete.'],
    error: ['No pude responder ahora. Probá de nuevo en un rato.', 'I couldn\'t reply right now. Try again in a bit.'],
    wa: ['Así le llega por WhatsApp', 'How it reaches them on WhatsApp'],
    copiar: ['Copiar texto', 'Copy text'], copiado: ['Copiado', 'Copied'],
    sinIA: ['respuesta sin IA', 'reply without AI'], para: ['Para el', 'For'],
    ph: ['Escribí tu pedido…', 'Type your order…'],
    pasosVacio: ['Cuando mandes un pedido, acá aparecen los pasos que hace el agente, en orden.', 'When you send an order, the steps the agent takes show up here, in order.'],
    leyendo: ['Leyendo tu mensaje…', 'Reading your message…'],
    sinHerr: ['No usó ninguna herramienta: no hacía falta (o no está permitido) y contestó directo.', 'It used no tool: it wasn\'t needed (or isn\'t allowed), so it replied directly.'],
    buscoGen: ['Buscó el producto en el catálogo', 'Looked the product up in the catalog'],
    calcGen: ['Calculó el total (lo hizo el código)', 'Calculated the total (done by the code)'],
    armoGen: ['Armó el pedido', 'Built the order']
  };
  var t = function (k) { return T[k][en() ? 1 : 0]; };
  var pesos = function (n) {
    var s = Number(n).toFixed(2).split('.'), e = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$ ' + (s[1] === '00' ? e : e + ',' + s[1]);
  };
  var cant = function (l) {
    var c = String(l.cantidad).replace('.', ',');
    return l.unidad === 'kg' ? c + ' kg' : c + ' u.';
  };

  function burbuja(rol, texto, extra) {
    var d = document.createElement('div');
    d.className = 'pedi-msg ' + rol + (extra ? ' ' + extra : '');
    d.textContent = texto;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  function nota(texto) {
    var s = document.createElement('span');
    s.className = 'pedi-aviso'; s.textContent = texto;
    msgs.appendChild(s);
  }
  function limpiarPasos() {
    temporizadores.forEach(clearTimeout); temporizadores = [];
    codigoEl.hidden = true;
  }
  function pasosVacio(clase, texto) {
    limpiarPasos(); pasosEl.innerHTML = '';
    var li = document.createElement('li'); li.className = clase || 'pedi-vacio'; li.textContent = texto || t('pasosVacio');
    pasosEl.appendChild(li);
  }
  function textoPaso(p) {
    var E = en();
    if (p.herramienta === 'buscar_producto' && p.buscado != null) {
      var r = (p.encontrados || []).join(', ');
      return (E ? 'Searched “' : 'Buscó “') + p.buscado + (E ? '” in the catalog → ' : '” en el catálogo → ') + (r || (E ? 'not in the catalog' : 'no está en el catálogo'));
    }
    if (p.herramienta === 'calcular_total') {
      if (p.ok === false) return (E ? 'Checked the quantities, they didn\'t add up: ' : 'Revisó las cantidades y no cerraron: ') + (p.errores || [''])[0];
      if (p.total != null) return (E ? 'Calculated the total: ' : 'Calculó el total: ') + pesos(p.total) + (E ? ' (done by the code)' : ' (lo hizo el código)');
      return t('calcGen');
    }
    if (p.herramienta === 'armar_pedido') {
      if (p.ok === false) return (E ? 'Couldn\'t build it: ' : 'No pudo armarlo: ') + (p.errores || [''])[0];
      if (p.total != null) return (E ? 'Built the order for ' : 'Armó el pedido por ') + pesos(p.total);
      return t('armoGen');
    }
    return t('buscoGen');
  }
  function mostrarPasos(pasos) {
    limpiarPasos(); pasosEl.innerHTML = '';
    if (!pasos.length) { pasosVacio('pedi-vacio', t('sinHerr')); return; }
    var usoCodigo = pasos.some(function (p) { return (p.herramienta === 'calcular_total' || p.herramienta === 'armar_pedido') && p.ok !== false; });
    pasos.forEach(function (p, i) {
      var li = document.createElement('li');
      li.className = 'pedi-paso' + (p.ok === false ? ' mal' : '');
      var nom = document.createElement('code'); nom.textContent = p.herramienta;
      var txt = document.createElement('span'); txt.textContent = textoPaso(p);
      li.appendChild(nom); li.appendChild(txt);
      temporizadores.push(setTimeout(function () {
        pasosEl.appendChild(li);
        requestAnimationFrame(function () { li.classList.add('visto'); });
        if (i === pasos.length - 1 && usoCodigo) codigoEl.hidden = false;
      }, 380 * (i + 1)));
    });
  }
  function ticketVacio() {
    cuerpo.innerHTML = '';
    var p = document.createElement('p'); p.className = 'pedi-vacio'; p.textContent = t('vacio');
    cuerpo.appendChild(p);
  }
  function ticket(p) {
    cuerpo.innerHTML = '';
    var dias = en() ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    var f = new Date(p.fecha + 'T12:00:00'), d = dias[(f.getDay() + 6) % 7];
    var el = function (tag, cls, txt) { var x = document.createElement(tag); if (cls) x.className = cls; if (txt != null) x.textContent = txt; return x; };
    cuerpo.appendChild(el('p', 'pedi-fecha', t('para') + ' ' + d + ' ' + f.getDate() + '/' + (f.getMonth() + 1)));
    cuerpo.appendChild(el('p', 'pedi-de', p.cliente));
    p.lineas.forEach(function (l) {
      var fila = el('div', 'pedi-linea');
      fila.appendChild(el('span', null, cant(l) + ' · ' + l.nombre));
      fila.appendChild(el('span', null, pesos(l.subtotal)));
      cuerpo.appendChild(fila);
    });
    var tot = el('div', 'pedi-total'); tot.appendChild(el('span', null, 'Total')); tot.appendChild(el('span', null, pesos(p.total)));
    cuerpo.appendChild(tot);
    cuerpo.appendChild(el('span', 'pedi-wa-tit', t('wa')));
    var wa = el('div', 'pedi-wa', p.whatsapp);
    var c = el('button', null, t('copiar')); c.type = 'button';
    c.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(p.whatsapp).then(function () { c.textContent = t('copiado'); }, function () {});
    });
    wa.appendChild(c); cuerpo.appendChild(wa);
  }
  function reiniciar() {
    historial = []; ultimaNota = ''; msgs.innerHTML = ''; msgs.appendChild(ejemplos); ejemplos.hidden = false;
    nuevo.hidden = true; ticketVacio(); pasosVacio(); input.focus();
  }

  function enviar(texto) {
    texto = (texto || '').trim();
    if (!texto || ocupado) return;
    ocupado = true; form.querySelector('button').disabled = true;
    ejemplos.hidden = true;
    burbuja('cliente', texto);
    input.value = '';
    var esperando = burbuja('agente', '···', 'escribiendo');
    pasosVacio('pedi-leyendo', t('leyendo'));
    fetch('/api/pedir', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mensaje: texto, cliente: cliente.value, historial: historial })
    }).then(function (r) { return r.json(); }).then(function (r) {
      esperando.remove();
      if (r.error) { burbuja('agente', r.error); pasosVacio(); return; }
      burbuja('agente', r.texto);
      if (r.aviso && r.aviso !== ultimaNota) nota(ultimaNota = r.aviso);
      else if (!r.aviso && r.modo === 'reglas' && !ultimaNota) nota(ultimaNota = t('sinIA'));
      mostrarPasos(r.pasos || (r.herramientas || []).map(function (n) { return { herramienta: n, ok: null }; }));
      historial.push({ rol: 'cliente', texto: texto }, { rol: 'agente', texto: r.texto });
      if (r.pedido) { ticket(r.pedido); nuevo.hidden = false; historial = []; }
      nuevo.hidden = nuevo.hidden && !historial.length;
    }).catch(function () {
      esperando.remove(); burbuja('agente', t('error')); pasosVacio();
    }).then(function () {
      ocupado = false; form.querySelector('button').disabled = false;
    });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); enviar(input.value); });
  ejemplos.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { enviar(b.textContent); }); });
  raiz.querySelectorAll('.pedi-romper button').forEach(function (b) { b.addEventListener('click', function () { enviar(b.textContent); }); });
  nuevo.addEventListener('click', reiniciar);
  cliente.addEventListener('change', function () { if (historial.length || !nuevo.hidden) reiniciar(); });

  // Ayuda detrás del "?"
  var ayuda = $('pedi-ayuda'), ayudaTxt = $('pedi-ayuda-txt');
  ayuda.addEventListener('click', function (e) {
    e.stopPropagation();
    var abrir = ayudaTxt.hidden; ayudaTxt.hidden = !abrir; ayuda.setAttribute('aria-expanded', String(abrir));
  });
  document.addEventListener('click', function (e) {
    if (!ayudaTxt.hidden && !ayudaTxt.contains(e.target)) { ayudaTxt.hidden = true; ayuda.setAttribute('aria-expanded', 'false'); }
  });

  // Textos que arma el JS: se actualizan al cambiar de idioma
  var ph = function () { input.placeholder = t('ph'); };
  ph();
  new MutationObserver(function () { ph(); if (cuerpo.querySelector('.pedi-vacio')) ticketVacio(); if (pasosEl.querySelector('.pedi-vacio') && !temporizadores.length) pasosVacio(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) {
    document.body.classList.toggle('pedi-a-la-vista', e[0].isIntersecting);
  }, { threshold: 0.15 }).observe(raiz);

  // Ir al agente: abre la pestaña FRESKA y baja hasta la demo. Lo usan los accesos (#pedi) y la burbuja del asistente.
  window.irAlAgente = function () {
    var tab = document.getElementById('t-fresca'); if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
    var nav = document.getElementById('nav-links'); if (nav && nav.classList.contains('open')) document.getElementById('hamburger').click();
    setTimeout(function () { raiz.scrollIntoView({ behavior: 'smooth', block: 'start' }); input.focus({ preventScroll: true }); }, 60);
  };
  document.querySelectorAll('a[href="#pedi"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); window.irAlAgente(); });
  });
})();
