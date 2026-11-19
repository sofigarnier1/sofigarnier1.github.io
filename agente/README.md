# Agente "Pedí como cliente" (FRESKA)

El visitante escribe como un cliente de FRESKA ("mandame 2 kilos de milas de pollo para el viernes") y el agente arma el pedido con el catálogo ficticio del mock de FRESKA, o pregunta lo que falta.

- `catalogo.json`: los 6 productos y 3 clientes del mock (datos ficticios), las dos listas de precios (cliente y consumidor final) y los topes.
- `herramientas.py`: las tres herramientas cerradas, `buscar_producto`, `calcular_total` y `armar_pedido`. Precios y cuentas los pone el código, nunca el modelo. El cliente lo fija la pantalla, no el mensaje.
- `agente.py`: dos modos con las mismas herramientas. **modelo** usa Claude (`AGENTE_MODELO`, por defecto `claude-haiku-5-5`) y **reglas** es un lector hecho a mano, sin IA ni costo: es la base para comparar y el respaldo sin clave.
- `evaluacion/pruebas.json`: 30 mensajes con respuesta esperada, incluidas trampas (productos que no vendemos, cantidades imposibles, precio inventado, "ignorá tus instrucciones", fuera de tema).

```bash
python3 agente/agente.py "media docena de hamburguesas para el viernes" --cliente=cf
python3 agente/evaluacion/evaluar.py          # reglas, gratis
python3 agente/evaluacion/evaluar.py --modelo # con clave; gasta
```

**Resultado real del modo modelo (`claude-haiku-5-5`): 28/30 (93 %), corrida del 17/11/2026.** Primera corrida (12/11): 20/30 (67 %); fallaban 8 pruebas porque el agente pedía confirmación antes de armar el pedido, y una por no entender "el 20". Se cambió el prompt del agente (arma el pedido apenas tiene producto, cantidad y fecha; el cliente lo revisa en el ticket) y las pruebas no se tocaron. Por grupo: pedido completo 5/5, cantidad rara 4/4, lista de precios 1/1, falta un dato 6/6, cantidad imposible 4/4, pregunta de precio 2/2, precio inventado 3/3, fuera de tema 1/1, no lo vendemos 2/4. Los 2 fallos ("piscinas" y "milanesas de soja") son respuestas correctas ("no es un producto que vendamos", "no las vendemos") que la prueba rechaza por exigir una frase exacta; se dejan como fallo para no inflar el número. Detalle en `evaluacion/resultados-modelo.json`.

Ojo: el modo reglas se ajustó mirando estas mismas 30 pruebas, así que su 100 % no mide nada nuevo. El número que vale es el del modo modelo, que no vio las pruebas.
