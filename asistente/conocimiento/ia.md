# Experiencia de Sofía con IA (inteligencia artificial)

Sofía construye con IA y programa con IA. Esto es lo que hizo:

- Agente "Pedí como cliente" (Python, API de Claude): el visitante escribe como un cliente y el agente arma el pedido. Solo puede usar tres herramientas cerradas: buscar producto, calcular total y armar pedido. Los precios y las cuentas los resuelve el código; el modelo no puede inventarlos. Está en este portfolio para probarlo.
- Asistente "Preguntale a Sofía" (este chat): responde solo con los documentos de Sofía, cita la fuente y dice "no lo sé" cuando el dato no está. Es su primer proyecto de RAG: convierte los documentos en embeddings (OpenAI), los guarda en Supabase (PostgreSQL con pgvector) y busca por significado; le pasa al modelo solo los fragmentos encontrados. Si Supabase no responde o se acabó el tope, busca por palabras (BM25) como respaldo.
- Evaluación propia: 30 casos de prueba con respuesta esperada para el agente, incluidas trampas (productos que no existen, precios inventados, "ignorá tus instrucciones"), y un set de preguntas para el asistente. Tiene además un modo sin IA, hecho con reglas, como base para comparar.
- Control de gasto: modelo chico, respuestas cortas, caché, topes por visitante y por día, y respuesta sin modelo cuando no hace falta.
- Programa todos los días con Claude Code y Codex: define qué se construye, revisa lo que generan y no da nada por terminado sin tests. Así desarrolló su sistema de gestión en uso real.
- En su trabajo con redes usó IA generativa (Claude, Gemini, ChatGPT) para ideas, textos, imágenes y video.

Su fortaleza para un puesto de IA: sabe llevar un sistema de punta a punta (diseño, base de datos, pruebas automáticas, entrega), entender cómo trabaja un negocio real y medir lo que hace la IA en vez de confiar.
