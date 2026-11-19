// Servidor local para probar el portfolio con el asistente: node asistente/servidor-local.js [puerto]
// Sin ANTHROPIC_API_KEY responde con el fragmento más relevante (gratis). Con la clave, usa el modelo.
const http = require('http'), fs = require('fs'), path = require('path');
const handler = require('../api/preguntar.js');
const contacto = require('../api/contacto.js');
const RAIZ = path.join(__dirname, '..'), PUERTO = Number(process.argv[2] || 8767);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
// Agente "Pedí como cliente": en Vercel es una función Python (api/pedir.py); acá se la llama por consola.
// Localmente los topes no se acumulan (cada pedido arranca un proceso nuevo).
function pedir(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('{"error":"Usá POST."}'); }
  let b = ''; req.on('data', d => { if (b.length < 20000) b += d; });
  req.on('end', () => {
    const p = require('child_process').spawn('python3', ['-I', path.join(RAIZ, 'api', 'pedir.py')], { env: { ...process.env, IP_VISITANTE: req.socket.remoteAddress || 'local' } });
    let out = ''; p.stdout.on('data', d => out += d);
    p.on('close', () => {
      try { const r = JSON.parse(out); res.statusCode = r.estado; res.end(JSON.stringify(r.datos)); }
      catch (_) { res.statusCode = 500; res.end('{"error":"No pude responder ahora."}'); }
    });
    p.stdin.end(b);
  });
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/api/preguntar') { let b = ''; req.on('data', d => b += d); req.on('end', () => { req.body = b; handler(req, res); }); return; }
  if (url === '/api/contacto') { let b = ''; req.on('data', d => b += d); req.on('end', () => { req.body = b; contacto(req, res); }); return; }
  if (url === '/api/pedir') return pedir(req, res);
  const f = path.join(RAIZ, url === '/' || /^\/p\/[^/]+\/?$/.test(url) ? 'index.html' : url);
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end('no está'); }
  res.setHeader('content-type', TIPOS[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(res);
}).listen(PUERTO, () => console.log('http://localhost:' + PUERTO));
