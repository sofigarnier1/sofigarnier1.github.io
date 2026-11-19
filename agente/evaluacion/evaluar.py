"""Evaluación del agente "Pedí como cliente": 30 mensajes con respuesta esperada.

    python3 agente/evaluacion/evaluar.py            # modo reglas (gratis, sin clave)
    python3 agente/evaluacion/evaluar.py --modelo   # con Claude (necesita ANTHROPIC_API_KEY; gasta)
    python3 agente/evaluacion/evaluar.py -v         # muestra la respuesta de cada prueba

Guarda el resultado en agente/evaluacion/resultados-<modo>.json (lo va a leer el panel).
"""
import json
import sys
from datetime import date, datetime
from pathlib import Path

AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent))
import agente  # noqa: E402
import herramientas as H  # noqa: E402


def corregir(prueba, r):
    """Devuelve (aprobada, motivo)."""
    e = prueba["espera"]
    p = r["pedido"]
    texto = H.normalizar(r["texto"])
    if e["pedido"]:
        if p is None:
            return (True, "no armó, permitido") if e.get("permite_sin_pedido") else (False, "no armó el pedido")
        items = {str(l["producto_id"]): l["cantidad"] for l in p["lineas"]}
        esperado = {k: float(v) for k, v in e["items"].items()}
        if items != esperado:
            return False, f"productos {items} ≠ {esperado}"
        if p["fecha"] != e["fecha"]:
            return False, f"fecha {p['fecha']} ≠ {e['fecha']}"
        if abs(p["total"] - e["total"]) > 0.005:
            return False, f"total {p['total']} ≠ {e['total']}"
        return True, "ok"
    if p is not None:
        return False, "armó un pedido que no correspondía"
    if "menciona" in e and not any(H.normalizar(w) in texto for w in e["menciona"]):
        return False, f"no dice nada de: {' / '.join(e['menciona'])}"
    if "menciona_todo" in e and not all(H.normalizar(w) in texto for w in e["menciona_todo"]):
        return False, f"tiene que nombrar: {' y '.join(e['menciona_todo'])}"
    return True, "ok"


def main():
    modo = "modelo" if "--modelo" in sys.argv else "reglas"
    detalle = "-v" in sys.argv
    datos = json.loads((AQUI / "pruebas.json").read_text(encoding="utf-8"))
    hoy = date.fromisoformat(datos["hoy"])
    filas, por_grupo = [], {}
    for prueba in datos["pruebas"]:
        try:
            r = agente.responder(prueba["mensaje"], prueba["cliente"], hoy, modo)
            ok, motivo = corregir(prueba, r)
        except Exception as ex:  # una prueba que explota cuenta como fallada, no corta la corrida
            r, ok, motivo = {"texto": "", "pedido": None, "herramientas": []}, False, f"error: {ex}"
        g = por_grupo.setdefault(prueba["grupo"], [0, 0])
        g[0] += ok
        g[1] += 1
        filas.append({"id": prueba["id"], "grupo": prueba["grupo"], "mensaje": prueba["mensaje"], "ok": ok,
                      "motivo": motivo, "respuesta": r["texto"], "total": (r["pedido"] or {}).get("total"),
                      "herramientas": r["herramientas"]})
        print(f"{'✓' if ok else '✗'} {prueba['id']:>2} [{prueba['grupo']}] {prueba['mensaje']}")
        if not ok or detalle:
            print(f"      → {motivo}\n      respuesta: {r['texto']}")

    aprobadas = sum(f["ok"] for f in filas)
    pct = round(100 * aprobadas / len(filas))
    print(f"\nModo {modo}: {aprobadas}/{len(filas)} ({pct} %)")
    for grupo, (a, t) in por_grupo.items():
        print(f"  {grupo:<20} {a}/{t}")
    salida = {"modo": modo, "modelo": agente.MODELO if modo == "modelo" else None,
              "fecha": datetime.now().isoformat(timespec="minutes"), "aprobadas": aprobadas, "total": len(filas),
              "porcentaje": pct, "por_grupo": {g: {"aprobadas": a, "total": t} for g, (a, t) in por_grupo.items()},
              "pruebas": filas}
    (AQUI / f"resultados-{modo}.json").write_text(json.dumps(salida, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
