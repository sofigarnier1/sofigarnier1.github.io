# Preguntale a Sofía — asistente RAG del portfolio

Chat que responde preguntas sobre mi experiencia usando **solo** los documentos de `conocimiento/`, citando la fuente y diciendo "no lo sé" cuando no está.

## Cómo funciona (y por qué cuesta poco)
1. `nucleo.js` parte los documentos en fragmentos y busca por palabras (BM25, sin dependencias): es el respaldo. La búsqueda principal es por significado (`rag.js`: embeddings de OpenAI + pgvector en Supabase; esquema en `rag/schema.sql`, carga con `rag/indexar.js`).
2. `../api/preguntar.js` (función de Vercel):
   - las 3-4 preguntas sugeridas salen de `sugeridas.json` (sin modelo);
   - si la búsqueda no encuentra nada relevante: "no lo sé" sin llamar al modelo;
   - preguntas repetidas: caché;
   - topes por visitante y por día (`ASISTENTE_TOPE_VISITANTE`, `ASISTENTE_TOPE_GLOBAL`); al llegar al tope o si falla el modelo, devuelve el fragmento más relevante (gratis);
   - modelo chico (`ASISTENTE_MODELO`, por defecto `claude-haiku-5-5`), respuesta corta (350 tokens).
3. `widget.js` / `widget.css`: el chat flotante del portfolio (es/en).

## Probar en local
```bash
node asistente/servidor-local.js 8767      # http://localhost:8767 (sin clave: respuestas "extracto", gratis)
node asistente/evaluacion/correr.js        # evaluación de la búsqueda (gratis)
ANTHROPIC_API_KEY=... node asistente/evaluacion/correr.js --modelo   # evalúa también las respuestas del modelo
```

## Publicar
- En Vercel: variable `ANTHROPIC_API_KEY` (nunca en el repo) y un **límite de gasto mensual** en la cuenta de la API.
- `vercel.json` incluye `asistente/**` en la función.
- Los topes en memoria se reinician cuando la función se "duerme": el tope duro real es el límite de gasto.

## Honestidad
`conocimiento/limites-e-ia.md` declara lo que Sofía todavía no tiene. Si cambia el CV, actualizar `conocimiento/`, `sugeridas.json` y volver a correr la evaluación.

## Resultado real con el modelo (`claude-haiku-5-5`, 17/11/2026)
18 preguntas (`evaluacion/preguntas.json`, `node asistente/evaluacion/correr.js --modelo`). Dos corridas seguidas, sin tocar nada entre ellas: **15/18 y 18/18**. Las respuestas del modelo varían de una corrida a otra y la prueba busca palabras exactas ("landing", "remoto", "appointment"), así que el número honesto es "15 a 18 de 18". En la primera corrida fallaron tres por palabra; antes de los ajustes de los documentos (12/11) también fallaban "¿Qué es FRESKA?" y "años de experiencia".
