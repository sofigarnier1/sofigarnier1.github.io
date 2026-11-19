"""Herramientas cerradas del agente "Pedí como cliente" (FRESKA, datos ficticios).

Las tres son código común: el modelo solo elige cuál llamar y con qué datos.
Los precios salen siempre del catálogo y las cuentas las hace Python, nunca el modelo.
El cliente (y por lo tanto la lista de precios) lo fija la pantalla, no el mensaje.
"""
import json
import unicodedata
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

_DATOS = json.loads((Path(__file__).parent / "catalogo.json").read_text(encoding="utf-8"))
PRODUCTOS = {p["id"]: p for p in _DATOS["productos"]}
CLIENTES = {c["id"]: c for c in _DATOS["clientes"]}
TOPES = _DATOS["topes"]


def normalizar(texto):
    sin_tildes = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in sin_tildes if unicodedata.category(c) != "Mn")


def precio(producto, cliente_id):
    return producto["precio_cf"] if CLIENTES[cliente_id]["lista"] == "cf" else producto["precio_cliente"]


def pesos(valor):
    """$ 10.500 / $ 2.100,50 (formato argentino)."""
    v = Decimal(str(valor)).quantize(Decimal("0.01"), ROUND_HALF_UP)
    entero, dec = f"{v:,.2f}".split(".")
    entero = entero.replace(",", ".")
    return f"$ {entero}" if dec == "00" else f"$ {entero},{dec}"


def _cantidad_texto(cantidad, unidad):
    c = Decimal(str(cantidad)).normalize()
    c_txt = f"{c:f}".replace(".", ",")
    if unidad == "kg":
        return f"{c_txt} kg"
    return f"{c_txt} {'unidad' if c == 1 else 'unidades'}"


# ---------------------------------------------------------------- herramientas

def buscar_producto(texto, cliente_id):
    """Productos del catálogo que coinciden con el texto, con el precio de la lista del cliente."""
    t = normalizar(texto)
    palabras = [p for p in t.replace(",", " ").split() if len(p) > 2 and p not in ("de", "del", "los", "las", "kilo", "kilos")]
    encontrados = []
    for p in PRODUCTOS.values():
        nombre = normalizar(p["nombre"])
        sinonimos = [normalizar(s) for s in p["sinonimos"]]
        if any(s in t for s in sinonimos) or t in nombre or (palabras and all(any(w[:5] in x for x in [nombre, *sinonimos]) for w in palabras)):
            encontrados.append({"producto_id": p["id"], "nombre": p["nombre"], "unidad": p["unidad"], "precio": precio(p, cliente_id)})
    if not encontrados:
        return {"encontrados": [], "aviso": f"'{texto}' no está en el catálogo. No lo vendemos: no lo ofrezcas ni inventes un precio."}
    return {"encontrados": encontrados}


def calcular_total(items, cliente_id):
    """Valida las cantidades y calcula subtotales y total. Devuelve errores en vez de adivinar."""
    if not items:
        return {"ok": False, "errores": ["El pedido no tiene productos."]}
    lineas, errores, total = [], [], Decimal("0")
    vistos = set()
    for it in items:
        p = PRODUCTOS.get(it.get("producto_id"))
        if p is None:
            errores.append(f"El producto {it.get('producto_id')} no existe en el catálogo.")
            continue
        if p["id"] in vistos:
            errores.append(f"{p['nombre']} está repetido: juntá las cantidades en una sola línea.")
            continue
        vistos.add(p["id"])
        try:
            cant = Decimal(str(it.get("cantidad")))
        except Exception:
            errores.append(f"Falta una cantidad válida para {p['nombre']}.")
            continue
        if cant <= 0:
            errores.append(f"La cantidad de {p['nombre']} tiene que ser mayor que cero.")
            continue
        if p["unidad"] == "unidad" and cant != cant.to_integral_value():
            errores.append(f"{p['nombre']} se vende por unidad: la cantidad tiene que ser un número entero.")
            continue
        if cant > TOPES[p["unidad"]]:
            errores.append(f"{_cantidad_texto(cant, p['unidad'])} de {p['nombre']} supera lo que se toma por este chat: hay que consultarlo por WhatsApp.")
            continue
        unit = Decimal(precio(p, cliente_id))
        sub = (unit * cant).quantize(Decimal("0.01"), ROUND_HALF_UP)
        total += sub
        lineas.append({"producto_id": p["id"], "nombre": p["nombre"], "unidad": p["unidad"],
                       "cantidad": float(cant), "precio": float(unit), "subtotal": float(sub)})
    if errores:
        return {"ok": False, "errores": errores}
    return {"ok": True, "lineas": lineas, "total": float(total), "lista": CLIENTES[cliente_id]["lista"]}


def armar_pedido(items, fecha, cliente_id, hoy, notas=""):
    """Arma el pedido final y el texto para mandar por WhatsApp. Solo si todo está completo y válido."""
    cuenta = calcular_total(items, cliente_id)
    if not cuenta["ok"]:
        return cuenta
    try:
        f = date.fromisoformat(fecha)
    except (TypeError, ValueError):
        return {"ok": False, "errores": ["Falta la fecha de entrega (o no se entendió). Preguntásela al cliente."]}
    if f < hoy:
        return {"ok": False, "errores": [f"La fecha {f.isoformat()} ya pasó. Pedile otra al cliente."]}
    if f > hoy + timedelta(days=TOPES["dias_adelante"]):
        return {"ok": False, "errores": [f"Solo se toman pedidos hasta {TOPES['dias_adelante']} días adelante."]}
    cliente = CLIENTES[cliente_id]
    dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    fecha_txt = f"{dias[f.weekday()]} {f.day}/{f.month}"
    renglones = [f"• {_cantidad_texto(l['cantidad'], l['unidad'])} de {l['nombre']}: {pesos(l['subtotal'])}" for l in cuenta["lineas"]]
    saludo = "Hola" if cliente_id == "cf" else f"Hola, soy {cliente['nombre']}"
    whatsapp = "\n".join([f"{saludo}. Quiero hacer este pedido para el {fecha_txt}:",
                          *renglones, f"Total: {pesos(cuenta['total'])}", *([f"Nota: {notas}"] if notas else [])])
    return {"ok": True, "pedido": {"cliente": cliente["nombre"], "fecha": f.isoformat(), "lineas": cuenta["lineas"],
                                   "total": cuenta["total"], "notas": notas, "whatsapp": whatsapp}}


# ------------------------------------------------- definiciones para el modelo

DEFINICIONES = [
    {
        "name": "buscar_producto",
        "description": "Busca en el catálogo de FRESKA un producto por nombre (por ejemplo 'milanesa de pollo' o 'chorizo'). "
                       "Devuelve id, unidad (kg o unidad) y el precio de la lista de este cliente. Si no aparece, no se vende.",
        "strict": True,
        "input_schema": {"type": "object", "additionalProperties": False, "required": ["texto"],
                         "properties": {"texto": {"type": "string", "description": "Lo que pidió el cliente, en sus palabras."}}},
    },
    {
        "name": "calcular_total",
        "description": "Calcula subtotales y total con los precios del catálogo y valida cantidades. Usala para dar un precio o un total.",
        "strict": True,
        "input_schema": {"type": "object", "additionalProperties": False, "required": ["items"],
                         "properties": {"items": {"type": "array", "items": {
                             "type": "object", "additionalProperties": False, "required": ["producto_id", "cantidad"],
                             "properties": {"producto_id": {"type": "integer"},
                                            "cantidad": {"type": "number", "description": "Kilos o unidades, según el producto."}}}}}},
    },
    {
        "name": "armar_pedido",
        "description": "Arma el pedido final cuando ya están claros todos los productos, las cantidades y la fecha de entrega. "
                       "No la llames si falta algo: preguntalo primero.",
        "strict": True,
        "input_schema": {"type": "object", "additionalProperties": False, "required": ["items", "fecha", "notas"],
                         "properties": {
                             "items": {"type": "array", "items": {
                                 "type": "object", "additionalProperties": False, "required": ["producto_id", "cantidad"],
                                 "properties": {"producto_id": {"type": "integer"}, "cantidad": {"type": "number"}}}},
                             "fecha": {"type": "string", "description": "Fecha de entrega en formato AAAA-MM-DD."},
                             "notas": {"type": "string", "description": "Aclaraciones del cliente (horario, etc.). Vacío si no hay."}}},
    },
]


def paso(nombre, entrada, salida):
    """Resumen corto de una llamada a herramienta, para mostrarlo en la demo (sin precios inventados: salen de la salida real)."""
    p = {"herramienta": nombre, "ok": salida.get("ok", bool(salida.get("encontrados")))}
    if nombre == "buscar_producto":
        p["buscado"] = str(entrada.get("texto", ""))[:60]
        p["encontrados"] = [x["nombre"] for x in salida.get("encontrados", [])]
    elif nombre == "calcular_total":
        if salida.get("ok"):
            p["total"] = salida["total"]
            p["lineas"] = len(salida["lineas"])
        else:
            p["errores"] = salida.get("errores", [])[:2]
    elif nombre == "armar_pedido":
        if salida.get("ok"):
            p["total"] = salida["pedido"]["total"]
        else:
            p["errores"] = salida.get("errores", [])[:2]
    return p


def ejecutar(nombre, entrada, cliente_id, hoy):
    """Corre una herramienta con lo que pidió el modelo. El cliente y la fecha de hoy los pone el código."""
    if nombre == "buscar_producto":
        return buscar_producto(str(entrada.get("texto", "")), cliente_id)
    if nombre == "calcular_total":
        return calcular_total(entrada.get("items") or [], cliente_id)
    if nombre == "armar_pedido":
        return armar_pedido(entrada.get("items") or [], entrada.get("fecha"), cliente_id, hoy, str(entrada.get("notas", "")))
    return {"ok": False, "errores": [f"La herramienta {nombre} no existe."]}
