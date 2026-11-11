// Servidor local para probar el portfolio con el asistente: node asistente/servidor-local.js [puerto]
// Sin ANTHROPIC_API_KEY responde con el fragmento más relevante (gratis). Con la clave, usa el modelo.
const http = require('http'), fs = require('fs'), path = require('path');
const handler = require('../api/preguntar.js');
const RAIZ = path.join(__dirname, '..'), PUERTO = Number(process.argv[2] || 8767);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/api/preguntar') { let b = ''; req.on('data', d => b += d); req.on('end', () => { req.body = b; handler(req, res); }); return; }
  const f = path.join(RAIZ, url === '/' || /^\/p\/[^/]+\/?$/.test(url) ? 'index.html' : url);
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end('no está'); }
  res.setHeader('content-type', TIPOS[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(res);
}).listen(PUERTO, () => console.log('http://localhost:' + PUERTO));
