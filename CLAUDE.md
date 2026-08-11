# Contexto del proyecto — Portfolio Sofía Garnier

## Quién es Sofía

- Estudiante de Tecnicatura en Programación (UTN), egreso julio 2026
- Vive en Concepción del Uruguay, Entre Ríos, Argentina
- Busca trabajo **full-time** (no necesariamente remoto)
- Aplicando a roles **Junior Developer** / **Trainee Developer**
- Experiencia real: Creadora de Contenido & Community Manager freelance (4 años, desde 2022)
- Experiencia real: Atención al cliente en local de indumentaria (desde 2023)
- Sin experiencia formal en IT todavía — lo dice abiertamente, no lo esconde
- Email: sofigarnier1@gmail.com
- GitHub: github.com/sofigarnier1
- LinkedIn: linkedin.com/in/sofia-garnier

## Archivos del proyecto

- `portfolio.html` — portfolio completo, single-file, sin frameworks, abrí en cualquier browser
- `CV.md` — CV en Markdown, sincronizado con el portfolio

## Estado actual del portfolio

### Estética
- Tema claro (fondo crema cálido `#faf8f5`) con acento teal (`#0f7173`)
- Sin frameworks — HTML/CSS/JS puro
- Fuentes: Inter + JetBrains Mono (Google Fonts)
- Favicon: círculo crema con "SG" teal
- Scroll reveal animations en todas las secciones
- Terminal flotante en el hero (animación float)

### Secciones (en orden)
1. **Hero** — nombre, terminal flotante, animación de texto, 3 botones, stats
2. **Sobre mí** — texto + 4 cards (Tecnicatura, Argentina, Analítica, Creadora de Contenido & CM)
3. **Stack técnico** — barras animadas + tags + idiomas + "Aprendiendo ahora"
4. **Proyectos académicos** — WMS, Sabina Accesorios (full-stack), Northwind
5. **SQL en acción** — playground interactivo, chips de ejemplos, esquema colapsable
6. **JS en acción** — filtro de skills con búsqueda en tiempo real, vanilla JS
7. **Contacto** — links + snippet JS decorativo

### Hero
- Animación de texto rota entre: "Junior Developer", "Desarrolladora Web", "status: aprendiendo", "loading experience..."
- Terminal flotante muestra: whoami, ls projects/, cat philosophy.txt (mejor hecho que perfecto), echo $STATUS
- Stats: 3 proyectos académicos (contador animado) · CM freelance 2+ años · jul 2026 egreso

### SQL Playground
- Motor SQL puro en JS (sin dependencias externas)
- Dos tablas reales: `publicaciones` (20 posts) y `semanas` (4 semanas)
- Datos de @andika.indum, período abr–may 2025
- Chips de ejemplos arriba del editor, esquema colapsable abajo

### JS en acción
- Filtro interactivo del stack técnico de Sofía
- 12 tecnologías: Frontend / Backend / Bases de datos / Herramientas / Aprendiendo
- Búsqueda en tiempo real + filtrado por categoría
- Cards con barra de nivel, cards "Aprendiendo" con borde punteado

## Decisiones tomadas

- **Perfil JD, no DE**: se cambió el foco de Data Engineering a Junior Developer
- **Honestidad sobre la experiencia**: el portfolio no infla ni esconde
- **CM como habilidad blanda**: la experiencia CM se presenta como autonomía y trabajo con clientes reales, no como puente a datos
- **WMS primero en proyectos**: muestra lógica de negocio y Java
- **Sabina Accesorios**: proyecto grupal full-stack (React + Node.js + Express + MongoDB + JWT). Link: github.com/lucasperinatto/ecommerce-university-project
- **Northwind**: proyecto SQL/MySQL académico
- No usar el proyecto "Feria de emprendedores" — Sofía hizo fork, no lo desarrolló ella
- Sección "Visualización de datos" eliminada (redundante con SQL playground)
- Chart.js removido del proyecto

## Cosas que Sofía prefiere

- Que todo se hable antes de implementar cambios grandes
- Que los textos suenen naturales, no como marketing ni como IA
- Que sea honesta sobre su nivel (no inflar skills ni experiencia)
- Paleta teal sobre crema — no volver a paletas oscuras
- Frases directas, tono argentino natural, sin buzzwords de LinkedIn
