"""API del agente "Pedí como cliente" (función de Vercel en Python).

POST {"mensaje": "...", "cliente": "1" | "2" | "3" | "cf", "historial": [{"rol": "cliente"|"agente", "texto": "..."}]}
-> {"texto", "pedido", "herramientas", "modo", "aviso"?}

Cuidados de gasto, igual que el chat del portfolio:
- topes por visitante y por día (variables AGENTE_TOPE_VISITANTE y AGENTE_TOPE_GLOBAL);
- sin clave, con el tope cumplido o si la IA falla, contesta el modo reglas (gratis);
- mensajes cortos y charla de pocos mensajes.
Los contadores viven en la memoria de la instancia: el tope duro real es el límite de gasto de la cuenta de la API.
También se puede usar por consola (lo usa el servidor local): echo '{"mensaje": "..."}' | python3 api/pedir.py
"""
import json
import os
import sys
from datetime import date
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "agente"))
import agente  # noqa: E402

TOPE_VISITANTE = int(os.environ.get("AGENTE_TOPE_VISITANTE", 15))  # mensajes con IA por visitante y por día
TOPE_GLOBAL = int(os.environ.get("AGENTE_TOPE_GLOBAL", 300))
_cuenta = {"dia": "", "global": 0, "por_ip": {}}


def _tope(ip):
    hoy = date.today().isoformat()
    if _cuenta["dia"] != hoy:
        _cuenta.update({"dia": hoy, "global": 0, "por_ip": {}})
    v = _cuenta["por_ip"].get(ip, 0)
    if v >= TOPE_VISITANTE or _cuenta["global"] >= TOPE_GLOBAL:
        return True
    _cuenta["por_ip"][ip] = v + 1
    _cuenta["global"] += 1
    return False


def atender(cuerpo, ip):
    """(estado HTTP, respuesta)."""
    try:
        datos = json.loads(cuerpo or "{}")
    except ValueError:
        return 400, {"error": "Pedido mal formado."}
    mensaje = str(datos.get("mensaje") or "").strip()
    cliente = str(datos.get("cliente") or "1")
    if not mensaje:
        return 400, {"error": "Escribí tu pedido."}
    if len(mensaje) > agente.MAX_MENSAJE:
        return 400, {"error": f"El mensaje puede tener hasta {agente.MAX_MENSAJE} caracteres."}
    if cliente not in agente.H.CLIENTES:
        return 400, {"error": "Cliente desconocido."}
    historial = datos.get("historial") if isinstance(datos.get("historial"), list) else []

    aviso = None
    hay_clave = bool(os.environ.get("ANTHROPIC_API_KEY"))
    if hay_clave and _tope(ip):
        aviso = "Hoy se llegó al tope de mensajes con IA: te contesta la versión sin IA."
    modo = "modelo" if hay_clave and not aviso else "reglas"
    try:
        r = agente.responder(mensaje, cliente, modo=modo, historial=historial)
    except Exception:
        if modo != "modelo":
            return 500, {"error": "No pude responder ahora. Probá más tarde."}
        r = agente.responder(mensaje, cliente, modo="reglas", historial=historial)
        aviso = "La IA no está disponible ahora: te contesta la versión sin IA."
    if aviso:
        r["aviso"] = aviso
    return 200, r


class handler(BaseHTTPRequestHandler):  # nombre que pide Vercel
    def _responder(self, estado, datos):
        cuerpo = json.dumps(datos, ensure_ascii=False).encode("utf-8")
        self.send_response(estado)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("cache-control", "no-store")
        self.end_headers()
        self.wfile.write(cuerpo)

    def do_POST(self):
        largo = min(int(self.headers.get("content-length") or 0), 20_000)
        ip = (self.headers.get("x-forwarded-for") or self.client_address[0] or "?").split(",")[0].strip()
        self._responder(*atender(self.rfile.read(largo).decode("utf-8", "replace"), ip))

    def do_GET(self):
        self._responder(405, {"error": "Usá POST."})


if __name__ == "__main__":
    estado, datos = atender(sys.stdin.read(), os.environ.get("IP_VISITANTE", "local"))
    print(json.dumps({"estado": estado, "datos": datos}, ensure_ascii=False))
