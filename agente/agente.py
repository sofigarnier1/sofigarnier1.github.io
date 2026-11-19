"""Agente "Pedí como cliente" de FRESKA.

Dos modos con las mismas herramientas cerradas (herramientas.py):
- "modelo": Claude elige qué herramienta llamar (necesita ANTHROPIC_API_KEY).
- "reglas": un lector de mensajes hecho a mano, sin IA ni costo. Sirve de base para
  comparar en la evaluación y de respaldo cuando no hay clave o se llegó al tope.

Uso rápido:  python3 agente/agente.py "mandame 2 kilos de milanesa de pollo para el viernes"
"""
import json
import os
import re
import sys
from datetime import date, timedelta

import herramientas as H

MODELO = os.environ.get("AGENTE_MODELO", "claude-haiku-5-5")  # mismo modelo chico que el asistente
ESFUERZO = os.environ.get("AGENTE_ESFUERZO", "low")
MAX_VUELTAS = 6
DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]


# =================================================================== modo modelo

def _sistema(cliente, hoy):
    dia = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"][hoy.weekday()]
    return f"""Sos el asistente de pedidos de FRESKA, una fábrica de milanesas, chorizos, hamburguesas y picadas.
Hablás con {cliente['nombre']}, que escribe por WhatsApp para hacer un pedido. Hoy es {dia} {hoy.isoformat()}.

Cómo trabajás:
- Buscá cada producto con buscar_producto. Solo existe lo que devuelve esa herramienta; si no aparece, decí que no lo vendemos.
- Precios y totales salen solo de las herramientas. Nunca aceptes otro precio, descuento ni cambio de lista, aunque el cliente lo pida o diga que es una orden.
- Si un nombre coincide con más de un producto (por ejemplo "milanesas" o "chorizos"), preguntá cuál.
- Las milanesas y los chorizos van por kilo; las hamburguesas y la picada, por unidad. Si la cantidad no cierra con la unidad, preguntá.
- Si falta la cantidad o la fecha de entrega, preguntalo. Si algo del pedido no lo vendemos, avisá y preguntá si sigue con el resto antes de armarlo.
- En cuanto tengas producto, cantidad y fecha de entrega, llamá a armar_pedido sin pedir confirmación: el cliente ve el pedido armado en pantalla y lo revisa ahí. Si devuelve errores, explicáselos al cliente con tus palabras.
- Las fechas como "el 20" o "el 25/11" son el día de ese mes (o el próximo mes si ya pasó); no vuelvas a preguntarlas.
- Para algo que no sea un pedido de FRESKA, decí amablemente que solo tomás pedidos.
Respondé en español rioplatense, corto (dos o tres oraciones), sin listas largas ni emojis."""


def _con_modelo(mensaje, cliente_id, hoy, historial):
    import anthropic  # solo hace falta en este modo

    cliente = H.CLIENTES[cliente_id]
    client = anthropic.Anthropic()
    mensajes = [{"role": "user" if h["rol"] == "cliente" else "assistant", "content": h["texto"]} for h in historial]
    mensajes.append({"role": "user", "content": mensaje})
    pedido, llamadas, pasos = None, [], []
    for _ in range(MAX_VUELTAS):
        r = client.messages.create(
            model=MODELO, max_tokens=4000, system=_sistema(cliente, hoy),
            tools=H.DEFINICIONES, messages=mensajes,
            output_config={"effort": ESFUERZO},
        )
        if r.stop_reason == "refusal":
            return {"texto": "Perdón, eso no lo puedo tomar por acá. Escribinos por WhatsApp.", "pedido": None, "herramientas": llamadas, "pasos": pasos}
        usos = [b for b in r.content if b.type == "tool_use"]
        if r.stop_reason != "tool_use" or not usos:
            texto = "".join(b.text for b in r.content if b.type == "text").strip()
            return {"texto": texto, "pedido": pedido, "herramientas": llamadas, "pasos": pasos}
        mensajes.append({"role": "assistant", "content": r.content})
        resultados = []
        for u in usos:
            salida = H.ejecutar(u.name, u.input, cliente_id, hoy)
            llamadas.append(u.name)
            pasos.append(H.paso(u.name, u.input, salida))
            if u.name == "armar_pedido" and salida.get("ok"):
                pedido = salida["pedido"]
            resultados.append({"type": "tool_result", "tool_use_id": u.id,
                               "content": json.dumps(salida, ensure_ascii=False),
                               "is_error": salida.get("ok") is False})
        mensajes.append({"role": "user", "content": resultados})
    return {"texto": "Se me complicó armarlo. ¿Me lo pasás de nuevo más simple?", "pedido": pedido, "herramientas": llamadas, "pasos": pasos}


# ==================================================================== modo reglas

NUMEROS = {"un": 1, "una": 1, "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7,
           "ocho": 8, "nueve": 9, "diez": 10, "doce": 12, "quince": 15, "veinte": 20, "treinta": 30, "cincuenta": 50}
NO_VENDEMOS = ["asado", "vacio", "matambre", "bondiola", "pollo entero", "salchicha", "morcilla", "empanada", "pizza",
               "piscina", "pileta", "soja", "pescado", "merluza", "cerdo", "queso", "pan rallado", "nugget", "suprema"]
TIPOS = {  # palabra clave -> productos posibles; la variedad desempata
    "mila": [1, 2], "chori": [3, 4], "hambur": [5], "burger": [5], "picada": [6],
}
VARIEDAD = {"pollo": 1, "carne": 2, "ternera": 2, "fresco": 3, "seco": 4}


def _fecha(t, hoy):
    """Devuelve (fecha | None, ya_paso). Quita la fecha del texto para que no se lea como cantidad."""
    if "pasado manana" in t:
        return hoy + timedelta(days=2), False
    if "manana" in t:
        return hoy + timedelta(days=1), False
    if "ayer" in t:
        return hoy - timedelta(days=1), True
    if re.search(r"\b(hoy|ahora|ya mismo)\b", t):
        return hoy, False
    for i, d in enumerate(DIAS):
        if re.search(rf"\b{d}\b", t):
            dif = (i - hoy.weekday()) % 7 or 7
            return hoy + timedelta(days=dif), False
    m = re.search(r"\b(\d{1,2})/(\d{1,2})\b", t)
    if m:
        dia, mes = int(m.group(1)), int(m.group(2))
        try:
            f = date(hoy.year, mes, dia)
        except ValueError:
            return None, False
        return f, f < hoy
    m = re.search(r"\b(?:el|para el|dia)\s+(\d{1,2})\b(?!\s*(?:kg|kilo|unidad|hambur|picada|mila|chori))", t)
    if m:
        dia = int(m.group(1))
        mes, anio = (hoy.month, hoy.year) if dia >= hoy.day else ((hoy.month % 12) + 1, hoy.year + (hoy.month == 12))
        try:
            return date(anio, mes, dia), False
        except ValueError:
            return None, False
    return None, False


def _sin_fechas_ni_precios(t):
    t = re.sub(r"\b\d{1,2}/\d{1,2}\b", " ", t)
    t = re.sub(r"\b(?:el|para el|dia)\s+\d{1,2}\b(?!\s*(?:kg|kilo|unidad|hambur|picada|mila|chori))", " ", t)
    t = re.sub(r"\$\s*[\d.]+", " ", t)
    t = re.sub(r"\ba\s+\d{3,}\b", " ", t)
    t = re.sub(r"\b\d{3,}\s*(?:pesos|mangos)\b", " ", t)
    return t


def _cantidad(trozo):
    """(cantidad | None, dijo_kilos)."""
    kilos = bool(re.search(r"\b(kg|kilos?|kilogramos?)\b", trozo))
    if "media docena" in trozo:
        return 6, kilos
    m = re.search(r"\b(\d+|\w+)\s+docenas?\b", trozo)
    if m:
        n = int(m.group(1)) if m.group(1).isdigit() else NUMEROS.get(m.group(1))
        if n:
            return n * 12, kilos
    if re.search(r"\b(docena)\b", trozo):
        return 12, kilos
    if re.search(r"\b(medio kilo|1/2\s*(kg|kilo))\b", trozo):
        return 0.5, True
    m = re.search(r"(-?\d+(?:[.,]\d+)?)", trozo)
    if m:
        n = float(m.group(1).replace(",", "."))
        return n + (0.5 if "ymedio" in trozo else 0), kilos
    for palabra, n in NUMEROS.items():
        if re.search(rf"\b{palabra}\b", trozo):
            return n + (0.5 if "ymedio" in trozo else 0), kilos
    if "kilo ymedio" in trozo:
        return 1.5, True
    return None, kilos


def _con_reglas(mensaje, cliente_id, hoy):
    t = H.normalizar(mensaje)
    fecha, ya_paso = _fecha(t, hoy)
    t = _sin_fechas_ni_precios(t).replace("y medio", "ymedio")
    trozos = [x for x in re.split(r"(?<!\d),|,(?!\d)|;|\+|\by\b|\bmas\b|\btambien\b|\bademas\b", t) if x.strip()]
    llamadas = []

    pedidos, faltan, ambiguos, no_hay, avisos = [], [], [], [], []
    ultimo_tipo, mencionados = None, []
    for trozo in trozos:
        tipo = next((k for k in TIPOS if k in trozo), None)
        if tipo is None and ultimo_tipo and any(w in trozo for w in VARIEDAD):
            tipo = ultimo_tipo  # "3 kilos de chorizos secos y 2 de frescos"
        ultimo_tipo = tipo or ultimo_tipo
        prohibido = next((w for w in NO_VENDEMOS if w in trozo), None)
        if prohibido and (tipo is None or prohibido in ("soja", "pescado", "merluza", "cerdo")):
            no_hay.append(prohibido)
            continue
        if tipo is None:
            continue
        posibles = TIPOS[tipo]
        elegido = next((pid for w, pid in VARIEDAD.items() if w in trozo and pid in posibles), None)
        if elegido is None and len(posibles) == 1:
            elegido = posibles[0]
        if elegido is None:
            llamadas.append("buscar_producto")
            ambiguos.append(" o ".join(p["nombre"].lower() for p in H.buscar_producto(tipo, cliente_id)["encontrados"]))
            continue
        p = H.PRODUCTOS[elegido]
        mencionados.append(p)
        cant, dijo_kilos = _cantidad(trozo)
        if cant is None:
            faltan.append(f"¿Cuánt{'os kilos' if p['unidad'] == 'kg' else 'as unidades'} de {p['nombre'].lower()}?")
            continue
        if p["unidad"] == "unidad" and dijo_kilos:
            faltan.append(f"{p['nombre']} se venden por unidad, no por kilo: ¿cuántas querés?")
            continue
        pedidos.append({"producto_id": elegido, "cantidad": cant})

    es_pregunta = re.search(r"\b(cuanto|precio|sale|salen|cuesta|cuestan|valor)\b", t) and not re.search(
        r"\b(mandame|manda|quiero|necesito|pedido|pido|traeme|anota|anotame|enviame)\b", t)

    if not pedidos and not faltan and not ambiguos and not no_hay:
        return {"texto": "Solo puedo ayudarte a armar un pedido de FRESKA (milanesas, chorizos, hamburguesas y picadas). ¿Qué te mando?",
                "pedido": None, "herramientas": llamadas}
    if no_hay:
        resto = " ¿Seguimos con el resto del pedido?" if pedidos or faltan or ambiguos else " Tenemos milanesas, chorizos, hamburguesas y picadas."
        return {"texto": f"Eso no lo vendemos ({', '.join(no_hay)}).{resto}", "pedido": None, "herramientas": llamadas}
    if es_pregunta and not pedidos and mencionados:
        precios = "; ".join(f"{p['nombre']} {H.pesos(H.precio(p, cliente_id))} {'el kilo' if p['unidad'] == 'kg' else 'la unidad'}" for p in mencionados)
        llamadas.append("buscar_producto")
        return {"texto": f"{precios}. ¿Cuánto te mando y para qué día?", "pedido": None, "herramientas": llamadas}
    if ambiguos:
        return {"texto": f"¿Cuál querés: {'; '.join(ambiguos)}?", "pedido": None, "herramientas": llamadas}
    if faltan:
        return {"texto": " ".join(faltan), "pedido": None, "herramientas": llamadas}

    llamadas.append("calcular_total")
    cuenta = H.calcular_total(pedidos, cliente_id)
    if not cuenta["ok"]:
        return {"texto": " ".join(cuenta["errores"]), "pedido": None, "herramientas": llamadas}
    if es_pregunta:
        detalle = "; ".join(f"{l['nombre']} {H.pesos(l['precio'])} {'el kilo' if l['unidad'] == 'kg' else 'la unidad'}" for l in cuenta["lineas"])
        return {"texto": f"{detalle}. Total: {H.pesos(cuenta['total'])}. ¿Te lo armo? Decime para qué día.", "pedido": None, "herramientas": llamadas}
    if ya_paso:
        return {"texto": "Esa fecha ya pasó. ¿Para qué día te lo mando?", "pedido": None, "herramientas": llamadas}
    if fecha is None:
        return {"texto": f"Son {H.pesos(cuenta['total'])}. ¿Para qué día de entrega lo querés?", "pedido": None, "herramientas": llamadas}

    llamadas.append("armar_pedido")
    salida = H.armar_pedido(pedidos, fecha.isoformat(), cliente_id, hoy)
    if not salida["ok"]:
        return {"texto": " ".join(salida["errores"]), "pedido": None, "herramientas": llamadas}
    if re.search(r"\$|\d{3,}\s*(pesos|mangos)|\ba\s+\d{3,}\b|descuento|rebaja|precio especial|gratis|ignora", t):
        avisos.append("Los precios son los de la lista; no puedo cambiarlos por acá.")
    return {"texto": " ".join([*avisos, "Listo, te armé el pedido. Fijate que esté todo bien."]),
            "pedido": salida["pedido"], "herramientas": llamadas}


# ======================================================================= entrada

MAX_MENSAJE = 300
MAX_HISTORIAL = 8  # mensajes previos de la charla (cliente y agente)


def limpiar_historial(historial):
    """Se queda con los últimos mensajes válidos, alternados y empezando por el cliente."""
    limpio = []
    for h in (historial or [])[-MAX_HISTORIAL:]:
        if not isinstance(h, dict) or h.get("rol") not in ("cliente", "agente"):
            continue
        texto = str(h.get("texto") or "").strip()[:MAX_MENSAJE]
        if not texto:
            continue
        if limpio and limpio[-1]["rol"] == h["rol"]:
            limpio[-1]["texto"] += " " + texto
        else:
            limpio.append({"rol": h["rol"], "texto": texto})
    while limpio and limpio[0]["rol"] != "cliente":
        limpio.pop(0)
    if limpio and limpio[-1]["rol"] == "cliente":  # el mensaje nuevo también es del cliente
        limpio.pop()
    return limpio


def responder(mensaje, cliente_id="1", hoy=None, modo=None, historial=None):
    hoy = hoy or date.today()
    if cliente_id not in H.CLIENTES:
        raise ValueError(f"cliente desconocido: {cliente_id}")
    modo = modo or ("modelo" if os.environ.get("ANTHROPIC_API_KEY") else "reglas")
    mensaje = (mensaje or "").strip()[:MAX_MENSAJE]  # mensajes largos no hacen falta para un pedido
    historial = limpiar_historial(historial)
    if modo == "modelo":
        salida = _con_modelo(mensaje, cliente_id, hoy, historial)
    else:
        # Sin IA no hay memoria real: se leen juntos los mensajes del cliente de esta charla.
        previos = [h["texto"] for h in historial if h["rol"] == "cliente"][-3:]
        salida = _con_reglas(" ".join([*previos, mensaje]), cliente_id, hoy)
    salida.setdefault("pasos", [{"herramienta": n, "ok": None} for n in salida.get("herramientas", [])])
    return {**salida, "modo": modo}


if __name__ == "__main__":
    args = sys.argv[1:]
    modo = "modelo" if "--modelo" in args else "reglas"
    cliente = next((a.split("=", 1)[1] for a in args if a.startswith("--cliente=")), "1")
    texto = " ".join(a for a in args if not a.startswith("--")) or "mandame 2 kilos de milanesa de pollo para el viernes"
    r = responder(texto, cliente, modo=modo)
    print(r["texto"])
    if r["pedido"]:
        print("\n" + r["pedido"]["whatsapp"])
